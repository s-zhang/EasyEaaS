import * as bodyParser from 'body-parser';
import express from 'express';
import helmet from 'helmet';

import * as RootController from './controllers/RootController';

const router: express.Router = express.Router();
/* Secure with Helmet */
router.use(helmet());

/* Parse request bodies as JSON */
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/* Mount REST API routes */
router.post('/eval', RootController.postEval);

const app: express.Express = express();
app.use('/api', router);

export default app;
