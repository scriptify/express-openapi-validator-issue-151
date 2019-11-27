import mongoose from 'mongoose';

export async function setupDatabase() {
  await mongoose.connect(process.env.DB_CONNECTION_STR as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'pets',
    useFindAndModify: false,
  });
}

export async function databaseTeardown() {
  await mongoose.disconnect();
}
