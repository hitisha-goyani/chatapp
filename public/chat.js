const socket = io();


const{username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix:true,
});

const messageTemplate = document.querySelector("#msg-template").innerHTML;

const messages = document.querySelector("#messages");

const autoScroll = ()=>{
     // Ensure there are messages
  const $newMessage = messages.lastElementChild;
  if (!$newMessage) return;

  // Get height of the new message
  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible height
  const visibleHeight = messages.offsetHeight;

  // Height of message container
  const containerHeight = messages.scrollHeight;

  // How far have I scrolled?
  const scrollOffset = messages.scrollTop + visibleHeight;

  // Auto-scroll if we're at the bottom
  if (containerHeight - newMessageHeight <= scrollOffset + 1) {
    messages.scrollTop = messages.scrollHeight;
  }
}

socket.emit("join",{username,room},(err)=>{
    if(err){
        alert(err);
        location.href="/";
    }
});

console.log("room",username,room);



socket.on("message",(message)=>{

    //  console.log("Message received:", message);

    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm:a"),
});

    messages.insertAdjacentHTML("beforeend",html);
    autoScroll();

});


// socket.on("newConnection",(msg)=>{
//     console.log(msg);
// });


const locationTemplate = document.querySelector("#location-template").innerHTML;

const locationMessage = document.querySelector("#location-msg");

socket.on("location",(url)=>{
    const html = Mustache.render(locationTemplate,{
        username:url.username,
        url:url.url,
    createdAt:moment(url.createdAt).format("h:mm:a")});

    locationMessage.insertAdjacentHTML("beforeend",html);
})

const $messageForm = document.querySelector("#msg-form");
const $messageInput = $messageForm.querySelector("input");
const $messageButton = $messageForm.querySelector("button");

// document.querySelector("#msg-form").addEventListener("submit",(e)=>{

//     e.preventDefault();


//     let message = e.target.elements.message.value;

//     console.log(message);

//     socket.emit("sendMessage",message);

//     e.target.elements.message.value = "";
// });


$messageForm.addEventListener("submit",(e)=>{

    e.preventDefault();

    $messageButton.setAttribute("disabled","disabled");

     let message = e.target.elements.message.value;

socket.emit("sendMessage", message ,(ack,error)=>{
            if(error){
                return console.log(error.message);
            }

            console.log(ack);
});



   $messageButton.removeAttribute("disabled");

    e.target.elements.message.value = "";

    $messageInput.focus();

});

const $locationButton = document.querySelector("#location");

$locationButton.addEventListener("click",()=>{

    $locationButton.setAttribute("disabled","disabled");

    if(!navigator.geolocation){
        return alert("your browser does not supported geo location");
    }

    navigator.geolocation.getCurrentPosition((position)=>{

        const lan = position.coords.latitude;
        const lon = position.coords.longitude;

        socket.emit("location",lan,lon,(ack,error)=>{
            if(error){
                return console.log(error.message)
            }
            console.log(ack)
        });

        $locationButton.removeAttribute("disabled");
    });
});




// document.querySelector("#location").addEventListener("click",() =>{
//     if(!navigator.geolocation){
//         return alert("your device is not supported to geo location");
//     }

//     navigator.geolocation.getCurrentPosition((position)=>{
//         const lat = position.coords.latitude;
//         const lon = position.coords.longitude;

//         socket.emit("location",lat,lon)

//     });
// });



const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

socket.on("roomData",({room,users})=>{
    const html = Mustache.render($sidebarTemplate,{room,users});

    console.log("room",room,users);
    
    document.querySelector("#sidebar").innerHTML = html
})


// const socket = io();

// // Read username & room from URL
// const { username, room } = Qs.parse(location.search, {
//   ignoreQueryPrefix: true,
// });


// // =========================
// // DOM ELEMENTS
// // =========================
// const $messages = document.querySelector("#messages");
// const messageTemplate = document.querySelector("#msg-template").innerHTML;
// const locationTemplate = document.querySelector("#location-template").innerHTML;
// const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// const $messageForm = document.querySelector("#msg-form");
// const $messageInput = document.querySelector("#msg");
// const $messageButton = $messageForm.querySelector("button[type='submit']");
// const $locationButton = document.querySelector("#location");


// // =========================
// // AUTO-SCROLL
// // =========================
// const autoScroll = () => {
//   const $newMessage = $messages.lastElementChild;
//   if (!$newMessage) return;

//   const newMsgHeight = $newMessage.offsetHeight;
//   const visibleHeight = $messages.offsetHeight;
//   const contentHeight = $messages.scrollHeight;
//   const scrollOffset = $messages.scrollTop + visibleHeight;

//   if (contentHeight - newMsgHeight <= scrollOffset + 10) {
//     $messages.scrollTo({ top: $messages.scrollHeight, behavior: "smooth" });
//   }
// };


// // =========================
// // JOIN ROOM
// // =========================
// socket.emit("join", { username, room }, (err) => {
//   if (err) {
//     alert(err);
//     location.href = "/";
//   }
// });


// // =========================
// // TEXT MESSAGE RECEIVED
// // =========================
// socket.on("message", (msg) => {
//   const isMine = msg.username === username;

//   const html = Mustache.render(messageTemplate, {
//     username: msg.username,
//     message: msg.text,
//     createdAt: moment(msg.createdAt).format("h:mm a"),
//     isMine,
//   });

//   $messages.insertAdjacentHTML("beforeend", html);
//   autoScroll();
// });


// // =========================
// // LOCATION MESSAGE RECEIVED
// // =========================
// socket.on("locationMessage", (msg) => {
//   const isMine = msg.username === username;

//   const html = Mustache.render(locationTemplate, {
//     username: msg.username,
//     url: msg.url,
//     createdAt: moment(msg.createdAt).format("h:mm a"),
//     isMine,
//   });

//   $messages.insertAdjacentHTML("beforeend", html);
//   autoScroll();
// });


// // =========================
// // SEND MESSAGE
// // =========================
// $messageForm.addEventListener("submit", (e) => {
//   e.preventDefault();

//   $messageButton.disabled = true;

//   const msg = $messageInput.value;

//   socket.emit("sendMessage", msg, (err) => {
//     $messageButton.disabled = false;
//     $messageInput.value = "";
//     $messageInput.focus();

//     if (err) console.log(err);
//   });
// });


// // =========================
// // SHARE LOCATION
// // =========================
// $locationButton.addEventListener("click", () => {
//   if (!navigator.geolocation) {
//     return alert("Geolocation not supported");
//   }

//   $locationButton.disabled = true;

//   navigator.geolocation.getCurrentPosition((pos) => {
//     socket.emit(
//       "sendLocation",
//       {
//         latitude: pos.coords.latitude,
//         longitude: pos.coords.longitude,
//       },
//       () => {
//         $locationButton.disabled = false;
//       }
//     );
//   });
// });


// // =========================
// // SIDEBAR UPDATE
// // =========================
// socket.on("roomData", ({ room, users }) => {
//   const html = Mustache.render(sidebarTemplate, { room, users });
//   document.querySelector("#sidebar").innerHTML = html;
// });
