Socket for Streamlabs obs
<div style="text-align: center;">
    <a href="https://www.npmjs.com/package/streamlabs-obs-ts"><img src="https://img.shields.io/npm/v/streamlabs-obs-ts.js.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/streamlabs-obs-ts"><img src="https://img.shields.io/npm/dt/streamlabs-obs-ts.js.svg?maxAge=3600" alt="NPM downloads" /></a>
</div>

# Streamlabs-obs-ts
An easy promise powered solution to access Streamlabs OBS (SLOBS) websocket connections.

[Reference material](https://stream-labs.github.io/streamlabs-obs-api-docs/docs/index.html)

## How to use
### Get Token
In Streamlabs OBS, go to ``Settings``->``Remote Control`` and click on the ``QR-Code`` and then on ``show details``

### Basic example
```
  const client = new Client();
  await client.connect('token');
  const scenes = await client.getScenes();
  client.subscribe('sceneSwitched', (event) => {
    console.log(event.data);
    client.unsubscribe('sceneSwitched');
  }).then(() => {
    scenes.get('Main').then((scene) => scene.activate());
  });
```
