// Path: backend\server.js
import dotenv from 'dotenv'
dotenv.config();

const PORT = process.env.PORT;


import app from './src/app.js'

const startServer = ()=>{
    try{
    //DB connection

    //server spinning up
    app.listen(PORT , ()=>{
        console.log(`server is running : http://localhost:${PORT}`);
    })}catch(err){
        console.log(err);
    }
}




startServer();



