/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';
import { DateTime } from 'luxon';

import { ITimeUtils } from '../lib/TimeUtils';
import { ITrelloClient } from '../lib/TrelloClient';
import { Board, BoardWebhook, Card, List } from '../models/TrelloModels';

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
    const board: Board = webhook.action.data.board;
    if (board.name.endsWith('[X]')) {
      switch (webhook.action.type) {
        case 'updateCard':
          if (webhook.action.data.card && webhook.action.data.list) {
            const card: Card = webhook.action.data.card;
            const list: List = webhook.action.data.list;
            await this.cardUpdateHandler(card, list, board);
          }
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

  async cardUpdateHandler(card: Card, list: List, board: Board): Promise<void> {
    await this.updateCardDaysActiveWithoutFieldIds(card.id, board.id);
  }

  async updateCardDaysActiveWithoutFieldIds(
    cardId: string,
    boardId: string
  ): Promise<void> {
    /*const boards = await this.trelloClient.getBoards();
    let workBoard = null;
    for (const board of boards) {
      if (board.name == "Work v2") {
        workBoard = board;
      }
    }
    
    const boardId = workBoard!.id;*/

    const activeDateField = await this.trelloClient.getCustomFieldsByName(
      boardId,
      'Active Date'
    );
    const daysActiveField = await this.trelloClient.getCustomFieldsByName(
      boardId,
      'DA'
    );

    await this.updateCardDaysActiveIfNeeded(
      cardId,
      activeDateField!.id,
      daysActiveField!.id
    );
  }

  async updateCardDaysActiveIfNeeded(
    cardId: string,
    activeDateFieldId: string,
    daysActiveFieldId: string
  ): Promise<void> {
    const activeDate = await this.trelloClient.getCustomFieldValueById<
      DateTime
    >(cardId, activeDateFieldId, this.timeUtils.fromISO);

    //console.log(activeDate.toISO());
    if (activeDate) {
      const daysActive = Math.round(-activeDate.diffNow('day').days);
      //console.log(daysActive);

      await this.trelloClient.updateCustomFieldItemOnCard(
        cardId,
        daysActiveFieldId,
        'number',
        `${daysActive}`
      );
    }
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
        await this.updateCardDaysActiveIfNeeded(
          card.id,
          activeDateField!.id,
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
    this.mountTrelloWebhook(router, 'board_webhook', this.boardWebhookListener);
    router.post('/trello/echo', this.echo);
  }
}

export default TrelloController;
