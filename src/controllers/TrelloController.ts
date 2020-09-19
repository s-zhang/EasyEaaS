import { Request, Response, Router } from 'express';
import asyncHandler from 'express-async-handler';

import { ITrelloClient } from '../lib/TrelloClient';

import IController from './IController';

class TrelloController implements IController {
  private readonly trelloClient: ITrelloClient;
  constructor(trelloClient: ITrelloClient) {
    this.trelloClient = trelloClient;
  }
  async test(request: Request, response: Response) {
    await this.trelloClient.moveCardToList(
      '5f617bde481a1388b148fa5e',
      '5cc281d42cb4bd329417bcc4'
    );
    response.status(200);
  }
  echo(request: Request, response: Response) {
    console.log(JSON.stringify(request.body));
    response.status(200);
  }

  mount(router: Router): void {
    router.post('/trello/test', asyncHandler(this.test));
    router.post('/trello/echo', this.echo);
  }
}

export default TrelloController;
