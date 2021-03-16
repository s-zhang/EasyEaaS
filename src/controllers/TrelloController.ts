/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { DateTime } from 'luxon';

import { ITimeUtils } from '../lib/TimeUtils';
import { ITrelloClient } from '../lib/TrelloClient';
import {
  Board,
  BoardWebhook,
  UpdateCustomFieldItemActionData,
} from '../models/TrelloModels';

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
    console.log(`Webhook triggered. ${JSON.stringify(webhook, null, 4)}`);
    const board: Board = webhook.model;
    if (board.name.endsWith('[X]')) {
      switch (webhook.action.type) {
        case 'updateCard':
          break;
        case 'updateCustomFieldItem':
          await this.updateDaysActiveUponActiveDateChange(webhook.action.data);
          break;
      }
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

  async updateCustomFieldItemHandler(data: UpdateCustomFieldItemActionData) {
    await this.updateDaysActiveUponActiveDateChange(data);
  }

  async updateDaysActiveUponActiveDateChange(
    data: UpdateCustomFieldItemActionData
  ): Promise<void> {
    if (data.customField.name != 'Active Date') {
      return;
    }

    const activeDate = this.trelloClient.getCustomFieldValueFromItems<DateTime>(
      data.customFieldItem,
      this.timeUtils.fromISO
    );

    const daysActiveField = await this.trelloClient.getCustomFieldsByName(
      data.board.id,
      'DA'
    );

    await this.updateDaysActiveIfNeeded(
      data.card.id,
      activeDate,
      daysActiveField!.id
    );
  }

  async updateDaysActiveIfNeeded(
    cardId: string,
    activeDate: DateTime | undefined,
    daysActiveFieldId: string
  ): Promise<void> {
    //console.log(activeDate.toISO());
    let value;
    if (activeDate) {
      const daysActive = Math.round(-activeDate.diffNow('day').days);
      //console.log(daysActive);
      value = {
        number: `${daysActive}`,
      };
    }
    await this.trelloClient.updateCustomFieldItemOnCard(
      cardId,
      daysActiveFieldId,
      value
    );
  }

  async updateAllCardsDaysActive(boardId: string): Promise<void> {
    const activeDateField = await this.trelloClient.getCustomFieldsByName(
      boardId,
      'Active Date'
    );
    const daysActiveField = await this.trelloClient.getCustomFieldsByName(
      boardId,
      'DA'
    );

    const lists = await this.trelloClient.getLists(boardId);
    for (const list of lists) {
      const cards = await this.trelloClient.getCards(list.id);
      for (const card of cards) {
        const activeDate = await this.trelloClient.getCustomFieldValueById<
          DateTime
        >(card.id, activeDateField!.id, this.timeUtils.fromISO);
        await this.updateDaysActiveIfNeeded(
          card.id,
          activeDate,
          daysActiveField!.id
        );
      }
    }
  }

  private mountTrelloWebhook(
    router: Router,
    pathComponent: string,
    listener: (request: Request, response: Response) => Promise<void>
  ): void {
    const path = `/trello/${pathComponent}`;
    router.post(path, asyncHandler(listener));
    router.head(path, (req, res) => {
      res.sendStatus(200);
    });
  }

  mount(router: Router): void {
    this.mountTrelloWebhook(router, 'board_webhook', (req, res) =>
      this.boardWebhookListener(req, res)
    );
    router.post(
      '/trello/update_days_active',
      asyncHandler(async (req, res) => {
        await this.updateAllCardsDaysActive(req.query.boardId as string);
        res.sendStatus(200);
      })
    );
    router.post('/trello/echo', this.echo);
  }
}

export default TrelloController;
