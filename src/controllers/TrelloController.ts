import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';

import { ITrelloClient } from '../lib/TrelloClient';
import { BoardWebhook } from '../models/TrelloBoardWebhook';

import IController from './IController';

class TrelloController implements IController {
  private readonly trelloClient: ITrelloClient;
  constructor(trelloClient: ITrelloClient) {
    this.trelloClient = trelloClient;
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
            const dueDate = new Date(card.due);
            const now = new Date(Date.now());
            if (this.isSameDay(dueDate, now)) {
              this.moveCardToListIfNeeded(
                card.id,
                list.id,
                '5f78cb57892f002ebcb88a28' // today
              );
            } else if (this.getMondayOfWeek(dueDate) <= now) {
              this.moveCardToListIfNeeded(
                card.id,
                list.id,
                '5cc282385eabf6760947aa4a' // this week
              );
            } else if (dueDate < this.addDays(now, 30)) {
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

  getMondayOfWeek(date: Date): Date {
    const thisMonday = new Date(date);
    thisMonday.setHours(0);
    thisMonday.setMinutes(0);
    thisMonday.setSeconds(0);
    thisMonday.setMilliseconds(0);
    thisMonday.setDate(thisMonday.getDate() + 1 - thisMonday.getDay());
    return thisMonday;
  }

  addDays(date: Date, days: number): Date {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getDate() == date2.getDate() &&
      date1.getMonth() == date2.getMonth() &&
      date2.getFullYear() == date2.getFullYear()
    );
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
