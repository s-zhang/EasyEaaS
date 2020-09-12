import { Request, Response } from 'express';

import EvalRequestData from '../models/EvalRequestData';

function postEval(req: Request, res: Response) {
  const data = req.body as EvalRequestData;
  console.log(`Evaluating: ${data.code}`);
  const value = eval(data.code);
  console.log(`Result: ${value}`);
  res.json(value);
}

export { postEval };
