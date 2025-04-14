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
    
    socket.on("sendSignal", ({toUser, fromUser, offer}) => {
        // Logging the signal received from the client
        console.log("Signal is receivied in server from client", fromUser, " to ", toUser);
        
        // Server forwarding the signal to the intended recipient
        io.to(toUser).emit("forwardSignal", {offer: offer, fromUser: fromUser});
    })

});
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
