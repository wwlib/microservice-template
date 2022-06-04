import { Request } from 'express'

export interface AuthRequestData {
  userId: string
  accessTokenPayload: any
}
export interface AuthRequest extends Request {
  auth?: AuthRequestData
}
