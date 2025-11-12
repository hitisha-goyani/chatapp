// import express from "express"
// import{fileURLToPath} from "url";
// import{dirname,join} from "path";
// import{createServer} from "http"; 
// import { Server } from "socket.io";                                                                      
// import { generateMessage, locationMessage } from "./utils/messages.js";
// import { addUser, getUser, getUserInChatRoom, removeUser } from "./utils/users.js";

 
// const app = express ();


// const __fileName = fileURLToPath(import.meta.url);
// const __dirName = dirname(__fileName);
// const publicDirectory = join(__dirName,"./public");

// app.use(express.static(publicDirectory));

// const server = createServer(app);

// const io = new Server(server);


// io.on("connection",(socket)=>{
//     console.log("new websocket connection established");
//       //   io.emit("message", "welcome");

//       socket.on("join",({username,room},callback)=>{

//           const{error,user} = addUser({id:socket.id,username,room});

//           if(error){
//                return callback(error);
//           }

//           if(user){
//                socket.join(user.room);
//           }
     
//           // socket.to(user.room)
//           // .emit("newConnection",generateMessage(`${user.username} has joined`));

//            socket.emit("message",generateMessage(`welcome ${user.username}`));

//           socket.to(user.room).emit("message",generateMessage(`${user.username} has joined`));
     

      


//      //  io.emit("newConnection",generateMessage(" a new user joined"));

//      //  socket.emit("message",generateMessage("welcome"));


//      io.emit("roomData",{
//           room:user.room,
//           users:getUserInChatRoom(user.room),
//      });

//       });
//      socket.on("sendMessage",(msg,callback)=>{
//         const user = getUser(socket.id);

//         if(user){
//            io.to(user.room)
//            .emit("message",generateMessage(user.username,msg));
//           callback("message a received");
//         }
         
//      });

//      socket.on("location",(lat,lon,callback)=>{

//           const user= getUser(socket.id);

//           if(user){

//                 socket.to(user.room)
//                 .emit("location",
//                locationMessage(
//                user.username,`https://google.com/maps?q=${lat},${lon}`));

//           callback("location received");
//           }
//      });

//       socket.on("disconnect", () => {

//           const user = getUser(socket.id);
          
//           if(user){
//           socket.broadcast.to(user.room)
//           .emit("message", `${user.username} has left`);

//            removeUser(socket.id); 

//            io.emit("roomData",{
//                room:user.room,
//                users:getUserInChatRoom(user.room)
//            })
//           }
//   });
// })


// const port = 5000;

// server.listen(port,()=>{
//      console.log(`server running on port`, port);
// });

import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { generateMessage, locationMessage } from "./utils/messages.js";
import { getUser, addUser, removeUser, getUserInChatRoom } from "./utils/users.js";

const app = express();

const __fileName = fileURLToPath(import.meta.url);
const __dirName = dirname(__fileName);
const publicDirectory = join(__dirName, "./public");

app.use(express.static(publicDirectory));

const server = createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
  console.log("New websocket connection established");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) return callback(error);

    // Join the socket to the room
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", generateMessage(`Welcome ${user.username}`));

    // Notify others in the room
    socket.to(user.room).emit("message", generateMessage(`${user.username} has joined`));

    // Send room data only to this room
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUserInChatRoom(user.room),
    });

    callback();
  });

  // Send chat messages
  socket.on("sendMessage", (msg, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", generateMessage(user.username, msg));
      callback("Message delivered");
    }
  });

  // Send location messages
  socket.on("location", (lat, lon, callback) => {
    const user = getUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "location",
        locationMessage(user.username, `https://google.com/maps?q=${lat},${lon}`)
      );
      callback("Location shared");
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    const user = removeUser(socket.id); // remove user first
    if (user) {
      // Notify others in the same room
      socket.to(user.room).emit("message", generateMessage(`${user.username} has left`));

      // Update room data only for this room
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUserInChatRoom(user.room),
      });
    }
  });
});

const port = 5000;
server.listen(port, () => {
  console.log(`Server running on port`, port);
});