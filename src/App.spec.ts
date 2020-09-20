import test from 'ava';
import request from 'supertest';

import App from './App';
import AppConfig from './models/AppConfig';
import TrelloApiKey from './models/TrelloApiKey';

const app = new App(new AppConfig(0, new TrelloApiKey('', '', ''))).setup();

test('TestEval', async (t) => {
  const response = await request(app)
    .post('/api/eval')
    .send({ code: 'const a = 1 + 1; a + 1' })
    .set('Accept', 'application/json');
  t.is(response.status, 200);
  t.is(response.body, 3);
});
