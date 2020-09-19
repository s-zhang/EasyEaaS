import TrelloApiKey from './TrelloApiKey';

class AppConfig {
  readonly port: number;
  readonly trelloApiKey: TrelloApiKey;
  constructor(port: number, trelloApiKey: TrelloApiKey) {
    this.port = port;
    this.trelloApiKey = trelloApiKey;
  }
}

export default AppConfig;
