import test from 'ava';

import { TimeUtils } from '../lib/TimeUtils';
import { TrelloClient } from '../lib/TrelloClient';
import TrelloConfig from '../models/TrelloConfig';

import TrelloController from './TrelloController';

const controller = new TrelloController(
  new TrelloClient(
    new TrelloConfig(
      '<replace_with_real>',
      '<replace_with_real>',
      '<replace_with_real>'
    )
  ),
  new TimeUtils()
);

test('TestTrelloUpdateDaysActive', async (t) => {
  await controller.updateAllCardsDaysActive('5ffe15d6fb57611385417155');
  t.pass();
});
