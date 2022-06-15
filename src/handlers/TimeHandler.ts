import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export const TimeHandler = (req: Request, res: Response) => {
  const time = new Date().toLocaleString()
  res.status(StatusCodes.OK).json({ time })
}
