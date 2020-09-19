import * as bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';

import EvalController from './controllers/EvalController';
import IController from './controllers/IController';
import TrelloController from './controllers/TrelloController';
import TrelloWebhookAuthHandler from './handlers/TrelloWebhookAuthHandler';
import { TrelloClient } from './lib/TrelloClient';
import AppConfig from './models/AppConfig';

class App {
  readonly config: AppConfig;
  constructor(config: AppConfig) {
    this.config = config;
  }
  setup(): express.Express {
    const router: express.Router = express.Router();
    /* Secure with Helmet */
    router.use(helmet());

    /* Parse request bodies as JSON */
    router.use(bodyParser.urlencoded({ extended: false }));
    router.use(bodyParser.json());

    /* Mount REST API routes */
    const controllers: IController[] = [
      new EvalController(),
      new TrelloController(new TrelloClient(this.config.trelloApiKey)),
    ];
    for (const controller of controllers) {
      controller.mount(router);
    }

    const handlers = [
      new TrelloWebhookAuthHandler(
        '/trello',
        this.config.trelloApiKey.token,
        'https://stevenzps.duckdns.org/api/trello/'
      ),
    ];
    for (const handler of handlers) {
      handler.mount(router);
    }

    const app: express.Express = express();
    app.use('/api', router);
    return app;
  }
  run(app: express.Express) {
    app.listen(this.config.port, () => {
      console.log(`Server is listening on ${this.config.port}`);
    });
  }
}

export default App;
