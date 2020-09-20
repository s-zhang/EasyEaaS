import crypto from 'crypto';

import { Request } from 'express';

import AuthHandler from './AuthHandler';

class TrelloWebhookAuthHandler extends AuthHandler {
  private readonly token: string;
  private readonly baseUrl: string;
  constructor(path: string, token: string, baseUrl: string) {
    super(path);
    this.token = token;
    this.baseUrl = baseUrl;
  }
  verify(request: Request): boolean {
    const content =
      JSON.stringify(request.body) + `${this.baseUrl}${request.originalUrl}`;
    console.log(`TrelloWebhookAuthHandler: content to hash: ${content}`);
    const doubleHash = crypto
      .createHmac('sha1', this.token)
      .update(content)
      .digest('base64');
    console.log(`TrelloWebhookAuthHandler: actual hash: ${doubleHash}`);
    const headerHash = request.headers['x-trello-webhook'];
    console.log(`TrelloWebhookAuthHandler: given hash: ${headerHash}`);
    return doubleHash == headerHash;
  }
}

export default TrelloWebhookAuthHandler;
