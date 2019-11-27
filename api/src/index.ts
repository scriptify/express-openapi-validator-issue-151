import setupRestServer from './express';
import { setupDatabase } from './db';

/**
 * Replace function bootstrap with the following:
 * 
 * 
  async function bootstrap() {
    await setupDatabase();
    setupRestServer();
  }


 */

async function bootstrap() {
  setupRestServer();
  await setupDatabase();
}

bootstrap();
