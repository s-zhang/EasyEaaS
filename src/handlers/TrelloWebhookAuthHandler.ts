import crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';

import AuthHandler from './AuthHandler';

class TrelloWebhookAuthHandler extends AuthHandler {
  private readonly secret: string;
  private readonly baseUrl: string;
  constructor(path: string, secret: string, baseUrl: string) {
    super(path);
    this.secret = secret;
    this.baseUrl = baseUrl;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler(request: Request, response: Response, next: NextFunction): any {
    const content =
      JSON.stringify(request.body) + `${this.baseUrl}${request.originalUrl}`;
    console.log(`TrelloWebhookAuthHandler: content to hash: ${content}`);
    const doubleHash = crypto
      .createHmac('sha1', this.secret)
      .update(content)
      .digest('base64');
    console.log(`TrelloWebhookAuthHandler: actual hash: ${doubleHash}`);
    const headerHash = request.headers['x-trello-webhook'];
    console.log(`TrelloWebhookAuthHandler: given hash: ${headerHash}`);
    if (doubleHash == headerHash) {
      next();
    } else {
      // Trello webhooks expect 200 here
      response.status(200).end('Auth failed');
    }
  }
}

export default TrelloWebhookAuthHandler;
