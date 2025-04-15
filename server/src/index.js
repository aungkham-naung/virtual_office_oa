const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
const PORT = process.env.PORT || 8080;
app.get('/', (req, res) => {
        res.send('Hello World');
});

io.on("connection", (socket) => {
    socket.emit("me", socket.id); // testing socket connection
    
    // Server getting signal from client A under "sendSignal" event
    socket.on("sendSignal", ({toUser, fromUser, offer}) => {
        // Logging the signal received from the client A
        console.log("Signal is received in server from client", fromUser, " to ", toUser);
        
        // Server forwarding the signal to the intended recipient
        io.to(toUser).emit("forwardSignal", {offer: offer, fromUser: fromUser});
    })
    
    // Server getting returned signal from client B under "sendReturnedSignal" event
    socket.on("sendReturnedSignal", ({toUser, fromUser, offer}) => {
        // Logging the signal returned received from the client B
        console.log("Signal is received in server from client", fromUser, " to ", toUser);
        
        // Server forwarding the signal back to the intended recipient
        io.to(toUser).emit("forwardReturnedSignal", {offer: offer, fromUser: fromUser});
    })

});
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
