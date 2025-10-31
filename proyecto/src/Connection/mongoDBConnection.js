
import mongoose from 'mongoose';

const connectDB = async()=>{
  const mongoURI="mongodb+srv://imalaguti05_db_user:<db_password>@cluster0.p4xbmbw.mongodb.net/?appName=Cluster0"
  try {
    await mongoose.connect(mongoURI);
    
  } catch (error) {
    console.error('Error al conectarse a la base de datos MongoDB:',error);
    process.exit(1);
  }


}

export default connectDB;