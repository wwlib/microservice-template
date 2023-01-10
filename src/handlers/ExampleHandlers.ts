import { Request, Response, Handler } from 'express'
import { AuthRequest } from '@types'
import { StatusCodes } from 'http-status-codes'

export class ExampleHandlers {

  static getHandler: Handler = async (req: AuthRequest, res: Response) => {
    console.info('ExampleHandler: req.query:', req.query)
    const utterance = req.query?.utterance
    let accountId = '';
    if (req.auth && req.auth.accessTokenPayload) {
      accountId = req.auth.accessTokenPayload.accountId
    }
    const result = { status: 'OK', utterance: utterance || 'na', accountId }
    res.status(StatusCodes.OK).json(result)
  }

  static postHandler: Handler = async (req: AuthRequest, res: Response) => {
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
