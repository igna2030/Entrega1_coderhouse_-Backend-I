import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
export const environment = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI,
      { dbName: "coderhouse" }
    );
  } catch (error) {
    console.error(' Error al conectarse a la base de datos MongoDB:', error.message);

  } 


}

export default environment;
