import { Request } from 'express'

export interface AuthRequestData {
  accountId: string
  accessTokenPayload: any
}
export interface AuthRequest extends Request {
  auth?: AuthRequestData
}
