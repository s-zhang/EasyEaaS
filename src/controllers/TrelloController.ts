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
    response.end();
  }
  echo(request: Request, response: Response) {
    const body = JSON.stringify(request.body);
    console.log(body);
    response.end(body);
  }

  mount(router: Router): void {
    router.post('/trello/test', asyncHandler(this.test));
    router.post('/trello/echo', this.echo);
  }
}

export default TrelloController;
