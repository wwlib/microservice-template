import { Request, Response, Handler } from 'express'
import { AuthRequest } from '@types'
import { StatusCodes } from 'http-status-codes'

export class ExampleHandlers {
  private static instance: ExampleHandlers;

  private constructor() {
  }

  public static getInstance(): ExampleHandlers {
    if (!ExampleHandlers.instance) {
      ExampleHandlers.instance = new ExampleHandlers()
    }
    return ExampleHandlers.instance
  }

  public getHandler: Handler = async (req: AuthRequest, res: Response) => {
    console.info('ExampleHandler: req.query:', req.query)
    const utterance = req.query?.utterance
    let accountId = '';
    if (req.auth && req.auth.accessTokenPayload) {
      accountId = req.auth.accessTokenPayload.accountId
    }
    const result = { status: 'OK', utterance: utterance || 'na', accountId }
    res.status(StatusCodes.OK).json(result)
  }

  public postHandler: Handler = async (req: AuthRequest, res: Response) => {
    console.info('ExampleHandler: req.body:', req.body)
    const utterance = req.body?.utterance
    let accountId = '';
    if (req.auth && req.auth.accessTokenPayload) {
      accountId = req.auth.accessTokenPayload.accountId
    }
    const result = { status: 'OK', utterance: utterance || 'na', accountId }
    res.status(StatusCodes.OK).json(result)
  }
}
