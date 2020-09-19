import { Request, Response, Router } from 'express';

abstract class AuthHandler {
  protected readonly path: string;
  protected constructor(path: string) {
    this.path = path;
  }
  protected abstract verify(request: Request): boolean;
  mount(router: Router): void {
    router.use(this.path, (request: Request, response: Response, next) => {
      if (this.verify(request)) {
        next();
      } else {
        response.status(401);
      }
    });
  }
}

export default AuthHandler;
