import test from 'ava';

import Client from './client';

test('Connect', (t) => {
  const client = new Client();
  return client
    .connect('9ddeea1216a71e4959fdd48f8a1c2d8ab772567')
    .then((result) => t.true(result));
});

test('Get status', async (t) => {
  const client = new Client();
  await client.connect('9ddeea1216a71e4959fdd48f8a1c2d8ab772567');
  await client.getStatus();
  t.pass();
});

test('Activate', async (t) => {
  const client = new Client();
  await client.connect('9ddeea1216a71e4959fdd48f8a1c2d8ab772567');
  const scenes = await client.getScenes();
  await client.subscribe('sceneSwitched', async () => {
    await client.unsubscribe('sceneSwitched');
    t.pass();
  });
  const main = scenes.get('Main');
  if (main) {
    t.true(await main.activate());
  } else {
    t.fail("Scene 'Main' or 'Ending Soon' not found.");
  }
});
