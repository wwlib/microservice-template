# microservice-template

A template for creating node microservices with:
- express route handling
- get/post REST api routes
- WebSocket api routes
- http admin UI routes
- JWT auth
- docker support

### install

`npm install`

### build

`npm run build`

### run

`npm run start`


### docker

`docker build -t microservice-template .` 
- or `npm run docker:build`

Copy `.env-example` to `.env`
```
SERVER_PORT=8000
USE_AUTH=true
```

`docker run -it --rm -p 8000:8000 --env-file ./.env microservice-template` 
- or `npm run docker:run`


### curl

Without auth:

```sh
curl --location --request POST 'http://localhost:8000/post' \
     --header 'Content-Type: application/json' \
     --data-raw '{
       "utterance": "hello"
     }'
```

With auth

```sh
curl --location --request POST 'http://localhost:8000/post' \
     --header 'Content-Type: application/json' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMSIsImF1dGgiOnsicGVybWlzc2lvbnMiOlt7InNjb3BlcyI6WyJyZWFkIl0sInJlc291cmNlIjoiZXhhbXBsZSJ9XX0sImlhdCI6MTY1MzM2MTQ3OX0.WMbG7o7CaKOf6H7djUpZ7aylvUeYw3N8cdn1K1FrN8A' \
     --data-raw '{
       "utterance": "hello"
     }'
```

```json
{"status":"OK","utterance":"hello","userId":"user1"}
```



```sh
curl --location --request POST 'http://localhost:8000/auth' \
     --header 'Content-Type: application/json' \
     --data-raw '{
       "username": "user1",
       "password": "12345!"
     }'
```

```json
{"message":"Logged in successfully.","access_token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMSIsImF1dGgiOnsicGVybWlzc2lvbnMiOlt7InNjb3BlcyI6WyJyZWFkIl0sInJlc291cmNlIjoiZXhhbXBsZSJ9XX0sImlhdCI6MTY1NDM2NzQ5NSwiZXhwIjoxNjU0MzY3NTU1fQ.J7yxsSoOYTvNQtMkLrmlY_TEZT6x4jEvYvnI_Gqr64Q","refresh_toke":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyMSIsImlhdCI6MTY1NDM2NzQ5NSwiZXhwIjoxNjU0NDUzODk1fQ.Lj7fairF_ABjeXzIc_-38aMqfj3ce08fd33V3ymoa04","user_id":"user1"}
```

### http - dashboard

http://localhost:8000/


### socket client

```
cd tools
node socket-cli.js
```

Note; The socket client will authenticate using the credentials in the `tools/.env` file.

This will start a REPL that will accept and echo prompts.

```
client connected
ctrl-c to quit
> hello
hello
```

Anything typed at the `>` prompt will be echoed.
