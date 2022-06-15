import express from 'express'
import asyncHandler from 'express-async-handler'
import { authHttp, noAuthHttp } from '../auth/ExpressAuthFunctions' // Example jwt auth-handling

export class ExpressRouterWrapper {
  private router: express.Router
  public path: string
  
  private _authFunction: any = noAuthHttp

  constructor (path: string, options?: any) {
    this.path = path
    this.router = express.Router({ mergeParams: true })
    if (options && options.useAuth) {
      this._authFunction = authHttp
    }
  }

  public addGetHandler (path: string, handler: express.Handler, permissions: string[] = []) {
    this.router.get(path, this._authFunction(permissions), asyncHandler(handler))
  }

  public addPostHandler (path: string, handler: express.Handler, permissions: string[] = []) {
    this.router.post(path, this._authFunction(permissions), asyncHandler(handler))
  }

  // some paths should never be authenticated: i.e. signin pages and requests
  public addGetHandlerNoAuth (path: string, handler: express.Handler) {
    this.router.get(path, asyncHandler(handler))
  }

  public addPostHandlerNoAuth (path: string, handler: express.Handler) {
    this.router.post(path, asyncHandler(handler))
  }

  public getRouter (): express.Router {
    return this.router
  }
}
