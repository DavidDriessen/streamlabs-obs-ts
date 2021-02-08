import WebSocketAsPromised from 'websocket-as-promised';

import Source from './Source';

export default class Scene {
  readonly id: string;
  readonly name: string;
  readonly sources: Map<string, Source>;
  readonly socket: WebSocketAsPromised;

  constructor(
    socket: WebSocketAsPromised,
    data: { id: string; name: string; sources: Map<string, Source> }
  ) {
    this.socket = socket;
    this.id = data.id;
    this.name = data.name;
    this.sources = data.sources;
  }

  activate() {
    return this.socket
      .sendRequest({
        jsonrpc: '2.0',
        method: 'makeSceneActive',
        params: {
          resource: 'ScenesService',
          args: [this.id],
        },
      })
      .then((data) => data.result);
  }
}
