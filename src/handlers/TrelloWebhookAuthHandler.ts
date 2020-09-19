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
    const doubleHash = crypto
      .createHmac('sha1', this.token)
      .update(content)
      .digest('base64');
    const headerHash = request.headers['x-trello-webhook'];
    return doubleHash == headerHash;
  }
}

export default TrelloWebhookAuthHandler;
