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
    let userId = '';
    if (req.auth && req.auth.accessTokenPayload) {
      userId = req.auth.accessTokenPayload.userId
    }
    const result = { status: 'OK', utterance: utterance || 'na', userId }
    res.status(StatusCodes.OK).json(result)
  }

  public postHandler: Handler = async (req: AuthRequest, res: Response) => {
    console.info('ExampleHandler: req.body:', req.body)
    const utterance = req.body?.utterance
    let userId = '';
    if (req.auth && req.auth.accessTokenPayload) {
      userId = req.auth.accessTokenPayload.userId
    }
    const result = { status: 'OK', utterance: utterance || 'na', userId }
    res.status(StatusCodes.OK).json(result)
  }
}
