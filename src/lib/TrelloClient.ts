import axios from 'axios';

import TrelloApiKey from '../models/TrelloApiKey';

interface ITrelloClient {
  moveCardToList(cardId: string, listId: string): Promise<void>;
}

class TrelloClient implements ITrelloClient {
  private readonly trelloEndpoint: string = 'https://api.trello.com/1';
  private readonly trelloAuthParams: string;
  constructor(trelloApiKey: TrelloApiKey) {
    this.trelloAuthParams = `key=${trelloApiKey.key}&token=${trelloApiKey.token}`;
  }
  async moveCardToList(cardId: string, listId: string): Promise<void> {
    const url = `${this.trelloEndpoint}/cards/${cardId}?${this.trelloAuthParams}`;
    console.log(`TrelloClient: POST ${url}`);
    await axios.put(url, {
      idList: listId,
    });
  }
}

export { TrelloClient, ITrelloClient };
