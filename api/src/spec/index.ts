import express from 'express';
import path from 'path';
import { OpenApiValidator } from 'express-openapi-validator';

export default function validateAPI(app: express.Application) {
  const apiSpec = path.resolve('api/src/spec/spec.yaml');
  const validator = new OpenApiValidator({
    apiSpec,
    validateRequests: true,
    /** Only validate responses during development */
    validateResponses: process.env.NODE_ENV === 'development',
  });
  validator.install(app);
}
