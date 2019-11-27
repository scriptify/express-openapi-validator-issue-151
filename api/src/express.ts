import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';

import validateAPI from './spec';
import PetModel, { Pet } from './Pet';

export default async function setupRestServer() {
  const app = express();

  app.use(cors());
  app.use(bodyParser.json());
  app.use(
    session({
      secret: 'very secret session',
      cookie: { maxAge: 60000 },
      resave: false,
      saveUninitialized: true,
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    const YAML = require('yamljs');
    const swaggerDocument = YAML.load('api/src/spec/spec.yaml');
    console.log('Interactive API docs can be found under "/api-docs"');
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }

  validateAPI(app);

  app.post('/v1/pets', async (req, res) => {
    const data: Pet = req.body;
    const newPet = await PetModel.create(data);

    const retData = {
      ...newPet.toJSON(),
      _id: newPet._id.toString(),
    };

    res.status(200);
    res.json(retData);
  });

  app.use((err: any, req: any, res: any, next: any) => {
    // format error
    res.status(err.status || 500).json({
      message: err.message,
      errors: err.errors,
    });
  });

  app.listen(3000, function() {
    console.log(`Server running on port ${3000}!`);
  });
}
