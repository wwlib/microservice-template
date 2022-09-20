# tools-notes

### install

`npm install`

### config

The default `.env` file includes an auth token (optional) as well as auth credentials. Auth is required if the microservice's auth mode is enabled (i.e. USE_AUTH=true) Auth is enabled by default.

Note: The microservice-template includes an `/auth` route that serves JWT tokens.

### run

`node socket-io-device-cli.js`

This will start a REPL that will accept prompts, turn them into Commands and send them to the server.

```
> hello
sent
```
A clock sync process (via socket.io) will start automatically.
