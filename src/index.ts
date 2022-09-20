import express from 'express'
import http, { Server } from 'http'
// import { WebSocketServer } from 'ws'
import dotenv from 'dotenv'
import * as handlers from '@handlers'
import { ExpressRouterWrapper } from './util/ExpressRouterWrapper'
// import { WSSRoutes, setupWebSocketServer } from './util/WebSocketServerWrapper'
import { setupSocketIoDeviceServer } from './SocketIoDeviceServer'

const cors = require('cors');
const cookieParser = require("cookie-parser");

dotenv.config()

const main = async () => {
  const app = express()

  // Set expected Content-Types
  app.use(express.json())
  app.use(express.text())
  app.use(express.static('public'));
  app.use(cookieParser());

  // https://www.section.io/engineering-education/how-to-use-cors-in-nodejs-with-express/
  app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));

  // HealthCheck
  app.get('/healthcheck', handlers.HealthCheckHandler)

  const serviceOptions = { useAuth: false }
  if (process.env.USE_AUTH === 'true') {
    serviceOptions.useAuth = true;
    console.info('(USE_AUTH === true) so using mock JWT auth.')
  } else {
    console.info('(USE_AUTH !== true) so NOT using mock JWT auth.')
  }

  // http routes

  const expressRouterWrapper = new ExpressRouterWrapper('', serviceOptions)
  expressRouterWrapper.addGetHandler('/get', handlers.ExampleHandlers.getInstance().getHandler, ['example:read'])
  expressRouterWrapper.addPostHandler('/post', handlers.ExampleHandlers.getInstance().postHandler, ['example:read'])

  expressRouterWrapper.addGetHandlerNoAuth('/auth', handlers.MockAuthHandlers.getInstance().authHandler)
  expressRouterWrapper.addGetHandlerNoAuth('/refresh', handlers.MockAuthHandlers.getInstance().refreshHandler)
  expressRouterWrapper.addPostHandlerNoAuth('/auth', handlers.MockAuthHandlers.getInstance().authHandler)

  expressRouterWrapper.addGetHandler('/dashboard', handlers.SiteHandlers.getInstance().dashboardHandler, ['example:read'])
  expressRouterWrapper.addGetHandler('/console', handlers.SiteHandlers.getInstance().consoleHandler, ['example:admin'])
  expressRouterWrapper.addGetHandlerNoAuth('/signin', handlers.SiteHandlers.getInstance().signinHandler)
  expressRouterWrapper.addGetHandlerNoAuth('/forbidden', handlers.SiteHandlers.getInstance().forbiddenHandler)
  expressRouterWrapper.addGetHandlerNoAuth('/', handlers.SiteHandlers.getInstance().redirectToDashboardHandler)

  // expressRouterWrapper.addGetHandler('/time', handlers.TimeHandler, ['example:read'])

  if (expressRouterWrapper) {
    const routerPath = expressRouterWrapper.path !== '' ? `/${expressRouterWrapper.path}` : ''
    app.use(`${routerPath}`, expressRouterWrapper.getRouter())
  }

  const port = parseInt(<string>process.env.SERVER_PORT) || 8000
  const httpServer: Server = http.createServer(app)

  // socket routes

  // const wssRoutes: WSSRoutes = [
  //   { path: '/ws-echo', handler: handlers.wsEchoHandler, permissions: ['example:read'] },
  //   { path: '/ws-silent', handler: handlers.wsSilentHandler, permissions: ['example:read'] },
  // ]
  // const wss: WebSocketServer = setupWebSocketServer(httpServer, wssRoutes, serviceOptions)

  setupSocketIoDeviceServer(httpServer, '/socket-device/')

  process.on('SIGINT', () => {
    console.warn('Received interrupt, shutting down')
    httpServer.close()
    process.exit(0)
  })

  httpServer.listen(port, () => {
    console.info(`HTTP/WS server is ready and listening at port ${port}!`)
  })
}

main().catch((error) => {
  console.error('Detected an unrecoverable error. Stopping!')
  console.error(error)
})
