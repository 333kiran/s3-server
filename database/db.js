import mongoose from 'mongoose';

mongoose.set('strictQuery', true);

export const connection = async(Url) => {
    try{
    await mongoose.connect(Url,{
        useNewUrlParser: true,
        useUnifiedTopology:true
     });
    
     console.log("successfully connected with database");

    }catch(error){
        console.log("error while connecting with database",error.message);
    }
}

export default connection;