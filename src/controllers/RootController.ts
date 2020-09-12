import { Request, Response } from 'express';

import { AppVersion } from '../models/AppVersion';

/**
 * GET /
 * Provide application information.
 */
export const getRoot = (req: Request, res: Response) => {
  res.json(new AppVersion('1.0'));
};
