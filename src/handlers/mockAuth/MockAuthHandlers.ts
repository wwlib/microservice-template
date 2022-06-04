import { Request, Response, Handler } from 'express'
import { AuthRequest } from '@types'
import { StatusCodes } from 'http-status-codes'
import { JwtAuth, AuthResult, ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '@auth';

export class MockAuthHandlers {
  private static instance: MockAuthHandlers;

  private constructor() {
  }

  public static getInstance(): MockAuthHandlers {
    if (!MockAuthHandlers.instance) {
      MockAuthHandlers.instance = new MockAuthHandlers()
    }
    return MockAuthHandlers.instance
  }

  public authHandler: Handler = async (req: AuthRequest, res: Response) => {
    const username = req.body?.username || req.query?.username
    const password = req.body?.password || req.query?.password
    // signIn
    if (username && password) {
      const authResult: AuthResult = await JwtAuth.signIn(username, password)
      console.info('authHandler: access_token:', authResult.access_token)
      res.cookie(ACCESS_TOKEN_NAME, authResult.access_token, {
        httpOnly: true,
        secure: false,
      }).cookie(REFRESH_TOKEN_NAME, authResult.refresh_token, {
        httpOnly: false,
        secure: false,
      }).status(StatusCodes.OK).json({ message: 'Logged in successfully.', access_token: authResult.access_token, refresh_token: authResult.refresh_token, user_id: authResult.user_id })
    } else {
      // signOut
      res.clearCookie(ACCESS_TOKEN_NAME).clearCookie(REFRESH_TOKEN_NAME).status(StatusCodes.OK).json({ message: 'Invalid credentials. Logged out.' })
    }
  }

  public refreshHandler: Handler = async (req: AuthRequest, res: Response) => {
    const refreshToken = req.cookies ? req.cookies[REFRESH_TOKEN_NAME] as string : ''
    if (refreshToken) {
      try {
        const refreshTokenPayload = JwtAuth.decodeRefreshToken(refreshToken)
        if (refreshTokenPayload.userId) {
          const refreshResult: AuthResult = await JwtAuth.refresh(refreshTokenPayload.userId)
          const decodedUrl = req.query?.destination as string ? decodeURIComponent(req.query?.destination as string) : ''
          const destination = decodedUrl || '/console/'
          console.info(`Refreshed successfully. userId: ${refreshResult.user_id}, destination: ${destination}`)
          res.cookie(ACCESS_TOKEN_NAME, refreshResult.access_token, {
            httpOnly: true,
            secure: false,
          }).status(StatusCodes.OK).redirect(destination) // json({ message: 'Refreshed successfully.', user_id: refreshResult.user_id })
        } else {
          console.error('refreshHandler: error: invalid userId in refresh token.')
          res.clearCookie(ACCESS_TOKEN_NAME).clearCookie(REFRESH_TOKEN_NAME).status(StatusCodes.OK).json({ message: 'Invalid userId in refresh token. Logged out.' })
        }
      } catch (error) {
        console.error('refreshHandler: error:', error)
        console.info(`Error decoding refresh token. Logged out.`)
        res.clearCookie(ACCESS_TOKEN_NAME).clearCookie(REFRESH_TOKEN_NAME).status(StatusCodes.OK).redirect('/signin/') // json({ message: 'Error decoding refresh token. Logged out.' })
      }

    } else {
      console.info(`Invalid refresh token. Logged out.`)
      res.clearCookie(ACCESS_TOKEN_NAME).clearCookie(REFRESH_TOKEN_NAME).status(StatusCodes.OK).redirect('/signin/') // json({ message: 'Invalid refresh token. Logged out.' })
    }
  }
}
