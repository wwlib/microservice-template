import { Request, Response, Handler } from 'express'
import { AuthRequest } from '@types'
import { StatusCodes } from 'http-status-codes'
import { Model } from '@model'

// handlebars templates are loaded by WebPack using handlebars-loader
// https://www.npmjs.com/package/handlebars-loader
// see webpack.config.js for handlebars-loader config
const signin_handlebars = require('./signin.handlebars.html');
const dashboard_handlebars = require('./dashboard.handlebars.html');
const console_handlebars = require('./console.handlebars.html');

export class SiteHandlers {

    static redirectToDashboardHandler: Handler = async (req: AuthRequest, res: Response) => {
        res.status(StatusCodes.OK).redirect('/dashboard/');
    }

    static redirectToConsoleHandler: Handler = async (req: AuthRequest, res: Response) => {
        res.status(StatusCodes.OK).redirect('/console/');
    }

    static signinHandler: Handler = async (req: AuthRequest, res: Response) => {
        console.log('signinHandler')
        Model.getInstance().onRequest()
        res.status(StatusCodes.OK).send(SiteHandlers.getSigninContent(req.auth?.accountId))
    }

    static getSigninContent(accountId?: string) {
        return signin_handlebars({ accountId: accountId })
    }

    static dashboardHandler: Handler = async (req: AuthRequest, res: Response) => {
        console.log('dashboardHandler')
        Model.getInstance().onRequest()
        res.status(StatusCodes.OK).send(SiteHandlers.getDashboardContent(req.auth?.accountId))
    }

    static getDashboardContent(accountId?: string) {
        const data = []
        for (let i=0; i<7; i++) {
            data.push(15000 + Math.floor(Math.random()*5000))
        }
        return dashboard_handlebars({ linkStates: { dashboard: 'active', console: '' }, accountId: accountId, requestCount: Model.getInstance().requestCount, chartData: data.join(',') })
    }

    static consoleHandler: Handler = async (req: AuthRequest, res: Response) => {
        console.log('consoleHandler')
        Model.getInstance().onRequest()
        const command: string = req.query?.command ? `${req.query?.command}` : ''
        let summary = ''
        let details = ''
        if (command === 'reset') {
            Model.getInstance().resetRequestCount()
            summary = 'Model:resetRequestCount.'
            details = 'requestCount reset successfully.'
        }
        res.status(StatusCodes.OK).send(SiteHandlers.getConsoleContent(req.auth?.accountId, command, summary, details))
    }

    static getConsoleContent(accountId: string | undefined, command: string, summary: string, details: string) {
        return console_handlebars({ linkStates: { dashboard: '', console: 'active' }, accountId: accountId, command, requestCount: Model.getInstance().requestCount, summary, details })
    }

    static forbiddenHandler: Handler = async (req: AuthRequest, res: Response) => {
        console.log('forbiddenHandler')
        Model.getInstance().onRequest()
        res.status(StatusCodes.OK).json({ error: 'Forbidden.' })
    }
}
