import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please provide the MONGODB_URI environment variable');
}

console.log('Initialising mongodb connection.');

mongoose.connect(MONGODB_URI);

export const checkMongoConnected = new Promise((res) => {
  mongoose.connection.on('connected', () => {
    res(1);
  });
});
