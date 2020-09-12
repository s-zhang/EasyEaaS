import test from 'ava';
import request from 'supertest';

import app from './App';

test('TestEval', async (t) => {
  const response = await request(app)
    .post('/api')
    .send({ code: 'const a = 1 + 1; a + 1' })
    .set('Accept', 'application/json');
  t.is(response.status, 200);
  t.is(response.body, 3);
});
