// Path: backend\server.js
import dotenv from 'dotenv'
dotenv.config();
import http from 'http';
import { Server} from 'socket.io';

const PORT = process.env.PORT;


import app from './src/app.js'


//map for storing the userId and socketId
export const userSocketMap = new Map();
const startServer = ()=>{
    try{

        const server = http.createServer(app);

        //attching socket.io's severver and our server
        const io = new Server(server , {
            cors : {
                origin : "http://localhost:5173",
                credentials : true,
            }
        });

        //server spinning up
        server.listen(PORT , ()=>{
            console.log(`server is running : http://localhost:${PORT}`);
        })

        io.on("connection", (socket) => {
    console.log("A client connected");
    console.log("Socket ID:", socket.id);

            socket.on("join" , (userId)=>{
                console.log("User joined with ID:", userId);
                userSocketMap.set(userId , socket.id);
                 // Store userId on the socket for disconnect
                socket.userId = userId;
            })

            socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);

                if (socket.userId) {
            userSocketMap.delete(socket.userId);
                    }
                });
            });



    }catch(err){
        console.log(err);
    }
}




startServer();



