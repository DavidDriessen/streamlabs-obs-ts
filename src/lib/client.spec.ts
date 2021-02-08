import test from 'ava';

import Client from './client';

const token = "";
const sceneName = ""

test('Connect', (t) => {
  const client = new Client();
  return client
    .connect(token)
    .then((result) => t.true(result));
});

test('Get status', async (t) => {
  const client = new Client();
  await client.connect(token);
  await client.getStatus();
  t.pass();
});

test('Activate', async (t) => {
  const client = new Client();
  await client.connect(token);
  const scenes = await client.getScenes();
  await client.subscribe('sceneSwitched', async () => {
    await client.unsubscribe('sceneSwitched');
    t.pass();
  });
  const scene = scenes.get(sceneName);
  if (scene) {
    t.true(await scene.activate());
  } else {
    t.fail("Scene 'Main' or 'Ending Soon' not found.");
  }
});
