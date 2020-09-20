import { NextFunction, Request, Response, Router } from 'express';

abstract class AuthHandler {
  protected readonly path: string;
  protected constructor(path: string) {
    this.path = path;
  }
  protected abstract handler(
    request: Request,
    response: Response,
    next: NextFunction
  ): // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any;
  mount(router: Router): void {
    router.use(this.path, this.handler);
  }
}

export default AuthHandler;
