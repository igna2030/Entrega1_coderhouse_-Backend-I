import ProductModel from '../models/ProductModel.js';
import mongoose from 'mongoose';
import 'dotenv/config';

const environment = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      { dbName: "coderhouse" }
    );
  } catch (error) {
    console.error(' Error al conectarse a la base de datos MongoDB:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }


}

export default environment;
