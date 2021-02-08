import WebSocketAsPromised from 'websocket-as-promised';

export enum NodeType {
  Item = 'item',
  Folder = 'folder',
}

export interface Transform {
  position: { x: number; y: number };
  scale: { x: number; y: number };
  crop: { top: number; bottom: number; left: number; right: number };
  rotation: number;
}

export interface SourceData {
  id: string;
  name: string;
  sceneId: string;
  parentId: string;
  sceneNodeType: NodeType;

  childrenIds: string[];

  sourceId: string;
  sceneItemId: string;
  resourceId: string;
  transform: Transform;
  recordingVisible: boolean;
  streamVisible: boolean;
  locked: boolean;
  visible: boolean;
}

export default class Source {
  private readonly socket: WebSocketAsPromised;
  readonly id: string;
  readonly name: string;
  readonly sceneId: string;
  readonly parentId: string;
  readonly sceneNodeType: NodeType;

  readonly childrenIds: string[];

  readonly sourceId: string;
  readonly sceneItemId: string;
  readonly resourceId: string;
  readonly transform: Transform;
  readonly recordingVisible: boolean;
  readonly streamVisible: boolean;
  readonly locked: boolean;
  visible: boolean;

  constructor(socket: WebSocketAsPromised, data: SourceData) {
    this.socket = socket;
    this.id = data.id;
    this.name = data.name;
    this.sceneId = data.sceneId;
    this.parentId = data.parentId;
    this.sceneNodeType = data.sceneNodeType;

    // Type is item
    this.locked = data.locked;
    this.visible = data.visible;
    this.sourceId = data.sourceId;
    this.transform = data.transform;
    this.resourceId = data.resourceId;
    this.sceneItemId = data.sceneItemId;
    this.streamVisible = data.streamVisible;
    this.recordingVisible = data.recordingVisible;

    // Type is folder
    this.childrenIds = data.childrenIds;
  }

  changeVisibility(visibility: boolean) {
    return this.socket
      .sendRequest({
        jsonrpc: '2.0',
        method: 'setVisibility',
        params: {
          resource: this.resourceId,
          args: [visibility],
        },
      })
      .then((data) => {
        this.visible = visibility;
        return data.result;
      });
  }

  toggleVisibility() {
    return this.changeVisibility(!this.visible);
  }
}
