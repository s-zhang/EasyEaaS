import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';

import { ITimeUtils } from '../lib/TimeUtils';
import { ITrelloClient } from '../lib/TrelloClient';
import { BoardWebhook } from '../models/TrelloBoardWebhook';

import IController from './IController';

class TrelloController implements IController {
  private readonly trelloClient: ITrelloClient;
  private readonly timeUtils: ITimeUtils;
  constructor(trelloClient: ITrelloClient, timeUtils: ITimeUtils) {
    this.trelloClient = trelloClient;
    this.timeUtils = timeUtils;
  }
  async boardWebhookListener(
    request: Request,
    response: Response
  ): Promise<void> {
    const webhook = request.body as BoardWebhook;
    console.log(`Webhook triggered. ${(JSON.stringify(webhook), null, 4)}`);
    switch (webhook.action.type) {
      case 'updateCard':
        if (webhook.action.data.card && webhook.action.data.list) {
          const card = webhook.action.data.card;
          const list = webhook.action.data.list;
          if (card.due) {
            const dueDate = this.timeUtils.fromMillis(parseInt(card.due));
            const now = this.timeUtils.local();
            console.log(`Due date: ${dueDate}, now: ${now}`);
            if (dueDate.hasSame(now, 'day')) {
              this.moveCardToListIfNeeded(
                card.id,
                list.id,
                '5f78cb57892f002ebcb88a28' // today
              );
            } else if (this.timeUtils.getMondayOfWeek(dueDate) <= now) {
              this.moveCardToListIfNeeded(
                card.id,
                list.id,
                '5cc282385eabf6760947aa4a' // this week
              );
            } else if (dueDate < now.plus({ days: 30 })) {
              this.moveCardToListIfNeeded(
                card.id,
                list.id,
                '5cc281d42cb4bd329417bcc4' // 30 days
              );
            } else {
              this.moveCardToListIfNeeded(
                card.id,
                list.id,
                '5cc281d42cb4bd329417bcc6' // long term
              );
            }
          } else if (card.due === null) {
            this.moveCardToListIfNeeded(
              card.id,
              list.id,
              '5cc28967afb4f12ab1911c06' // maybe
            );
          }
        }
        break;
    }
    response.end();
  }

  echo(request: Request, response: Response) {
    const body = JSON.stringify(request.body, null, 4);
    console.log(body);
    response.end(body);
  }

  async moveCardToListIfNeeded(
    cardId: string,
    fromListId: string,
    toListId: string
  ): Promise<void> {
    if (fromListId == toListId) {
      console.log(`card ${cardId} already in list ${toListId}`);
    } else {
      console.log(
        `Moving card ${cardId} from list ${fromListId} to list ${toListId}`
      );
      await this.trelloClient.moveCardToList(cardId, toListId);
    }
  }

  mount(router: Router): void {
    router.post(
      '/trello/board_webhook',
      asyncHandler((request: Request, response: Response) =>
        this.boardWebhookListener(request, response)
      )
    );
    router.post('/trello/echo', this.echo);
  }
}

export default TrelloController;
