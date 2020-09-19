class TrelloApiKey {
  readonly key: string;
  readonly token: string;
  constructor(key: string, token: string) {
    this.key = key;
    this.token = token;
  }
}

export default TrelloApiKey;
