import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';

import { ITimeUtils } from '../lib/TimeUtils';
import { ITrelloClient } from '../lib/TrelloClient';

import IController from './IController';

class TrelloButlerController implements IController {
  private readonly trelloClient: ITrelloClient;
  private readonly timeUtils: ITimeUtils;
  private readonly boardId: string;
  constructor(
    trelloClient: ITrelloClient,
    timeUtils: ITimeUtils,
    boardId: string
  ) {
    this.trelloClient = trelloClient;
    this.timeUtils = timeUtils;
    this.boardId = boardId;
  }
  async cleanUpPassDueCards(
    request: Request,
    response: Response
  ): Promise<void> {
    const now = this.timeUtils.local();
    const lists = await this.trelloClient.getLists(this.boardId);
    for (const list of lists) {
      const cards = await this.trelloClient.getCards(list.id);
      for (const card of cards) {
        if (card.due) {
          const dueDate = this.timeUtils.fromJSDate(new Date(card.due));
          if (dueDate < now) {
            await this.trelloClient.updateCardDueDate(
              card.id,
              now.startOf('day').set({ hour: 22 }).toISO()
            );
            if (card.idList != '5f78cb57892f002ebcb88a28' /* today list */) {
              this.trelloClient.moveCardToList(
                card.id,
                '5f78cb57892f002ebcb88a28'
              );
            }
          }
        }
      }
    }
    response.end();
  }

  mount(router: Router) {
    router.post(
      '/trello_butler/clean_up_pass_due',
      asyncHandler((request: Request, response: Response) =>
        this.cleanUpPassDueCards(request, response)
      )
    );
  }
}

export default TrelloButlerController;
