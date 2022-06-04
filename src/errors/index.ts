import { StatusCodes, ReasonPhrases } from 'http-status-codes'

export interface WSErrorField {
  name: string,
  message: string
}

export interface WSErrorResponse {
  code: number,
  result: {
    message: string,
    properties?: WSErrorField[]
  }
}

export const NotFoundError = (message?: string): WSErrorResponse => {
  return {
    code: StatusCodes.NOT_FOUND,
    result: {
      message: message || ReasonPhrases.NOT_FOUND
    }
  }
}

export const InternalServerError = (message?: string): WSErrorResponse => {
  return {
    code: StatusCodes.INTERNAL_SERVER_ERROR,
    result: {
      message: message || ReasonPhrases.INTERNAL_SERVER_ERROR
    }
  }
}

export const ServiceUnavailableError = (message?: string): WSErrorResponse => {
  return {
    code: StatusCodes.SERVICE_UNAVAILABLE,
    result: {
      message: message || ReasonPhrases.SERVICE_UNAVAILABLE
    }
  }
}

export const UnauthorizedError = (message?: string): WSErrorResponse => {
  return {
    code: StatusCodes.UNAUTHORIZED,
    result: {
      message: message || ReasonPhrases.UNAUTHORIZED
    }
  }
}

export const ForbiddenError = (message?: string): WSErrorResponse => {
  return {
    code: StatusCodes.FORBIDDEN,
    result: {
      message: message || ReasonPhrases.FORBIDDEN
    }
  }
}
