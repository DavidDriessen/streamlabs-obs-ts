import { EventEmitter, EventHandler } from '@billjs/event-emitter';
import WebsocketClient from 'sockjs-client';
import WebSocketAsPromised from 'websocket-as-promised';

import Scene from './Scene';
import Source, { SourceData } from './Source';

export interface ConnectionOptions {
  port?: number;
  uri?: string;
  path?: string;
}

export enum State {
  Online = 'online',
  Offline = 'offline',
}

export interface Status {
  streamingStatus: State;
  streamingStatusTime: string | Date;
  recordingStatus: State;
  recordingStatusTime: string | Date;
  replayBufferStatus: State;
  replayBufferStatusTime: string | Date;
  selectiveRecording: boolean;
}

export default class Client extends EventEmitter {
  private subscriptions = new Map<string, string>();
  private readonly socket: WebSocketAsPromised;

  constructor(opts?: ConnectionOptions) {
    super();
    const port = opts && opts.port ? opts.port : 59650;
    const uri = opts && opts.uri ? opts.uri : '127.0.0.1';
    const path = opts && opts.path ? opts.path : 'api';
    this.socket = new WebSocketAsPromised(`http://${uri}:${port}/${path}`, {
      createWebSocket: (url) => new WebsocketClient(url),
      packMessage: (data) => JSON.stringify(data),
      unpackMessage: (data) => JSON.parse(data as string),
      attachRequestId: (data, requestId) =>
        Object.assign({ id: requestId }, data),
      extractRequestId: (data) => data && data.id,
    });

    this.socket.onUnpackedMessage.addListener((data) => {
      if (data.result && data.result._type && data.result._type === 'EVENT') {
        this.fire(data.result.resourceId, data.result.data);
      }
    });
  }

  connect(token: string) {
    return this.socket.open().then(() => {
      return this.authenticate(token);
    });
  }

  authenticate(token: string) {
    return this.socket
      .sendRequest({
        jsonrpc: '2.0',
        method: 'auth',
        params: {
          resource: 'TcpServerService',
          args: [token],
        },
      })
      .then((data) => data.result);
  }

  getScenes() {
    return this.socket
      .sendRequest({
        jsonrpc: '2.0',
        method: 'getScenes',
        params: { resource: 'ScenesService' },
      })
      .then((data) => {
        return new Map<string, Scene>(
          data.result.map(
            (scene: { id: string; name: string; nodes: Array<SourceData> }) => {
              const sources: Map<string, Source> = new Map(
                scene.nodes.map((node: SourceData) => [
                  node.name,
                  new Source(this.socket, node),
                ])
              );
              return [
                scene.name,
                new Scene(this.socket, {
                  id: scene.id,
                  name: scene.name,
                  sources,
                }),
              ];
            }
          )
        );
      });
  }

  getStatus(): Promise<Status> {
    return this.socket
      .sendRequest({
        jsonrpc: '2.0',
        method: 'getModel',
        params: { resource: 'StreamingService' },
      })
      .then((data) => data.result);
  }

  subscribe(event: 'streaming' | 'sceneSwitched', callback: EventHandler) {
    let req;
    switch (event) {
      case 'streaming':
        req = this.socket.sendRequest({
          jsonrpc: '2.0',
          method: 'streamingStatusChange',
          params: { resource: 'StreamingService' },
        });
        break;
      case 'sceneSwitched':
        req = this.socket.sendRequest({
          jsonrpc: '2.0',
          method: 'sceneSwitched',
          params: {
            resource: 'ScenesService',
            args: [],
          },
        });
        break;
      default:
        return Promise.reject("Unknown event '" + event + "'.");
    }
    return req.then((data) => {
      if (data.result) {
        this.on(data.result.resourceId, callback);
        if (!this.subscriptions.has(event)) {
          this.subscriptions.set(event, data.result.resourceId);
        }
      }
    });
  }

  unsubscribe(event: 'streaming' | 'sceneSwitched') {
    const id = this.subscriptions.get(event);
    this.off(id);
    return this.socket
      .sendRequest({
        jsonrpc: '2.0',
        method: 'unsubscribe',
        params: { resource: id },
      })
      .then((data) => {
        return data.result;
      });
  }
}
