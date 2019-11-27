## Reproducing express-openapi-validator issue 151

Link to issue: https://github.com/cdimascio/express-openapi-validator/issues/151

### How to reproduce

First, create a file called **.env** in the root of project.
It needs to have the following content:

```
SERVER_DB_CONNECTION_STR=*********
```

Fill in your MongoDB connection URI.

Then install all dependencies and execute this command to start the development server (port 3000).

```bash
npm i
npm run dev:api
```

In this state, everything should work as expected.

I've implemented one API endpoint: [POST] /pets, which should successfully create a new pet. You can test it at http://localhost:3000/api-docs

Now, go to the file **api/src/index.ts** and swap the 'setupRestServer' with the 'setupDatabase' call, so that the database gets set up first. Now, the express server shouldn't be able to start because express-openapi-validator is freezing the thread.

Hope this helps, maybe I'm just overlooking something very obvious.
