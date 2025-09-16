const express = require("express");
const socketIo = require("socket.io");

const port = 8080

const app = express()
const expressServer = app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

const usersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray
    }
}

const io = socketIo(expressServer, {
    cors: {
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST"]
    }
})

io.on("connection", socket => {
    console.log(`User ${socket.id} connected`)

    // Set username and add it to the usersState
    socket.on("setUserName", (name) => {
        socket.username = name

        // Add the user to the list of users
        usersState.setUsers([
            ...usersState.users,
            { id: socket.id, name, room: null }
        ])
        console.log(usersState.users);

        socket.emit("message", `Welcome to the IRC ${name} !`)
        socket.broadcast.emit("message", `User ${name} has joined the IRC !`)

        // Send usersList to the front
        io.emit("usersList", usersState.users);
    })

    // Handle messages
    socket.on("message", data => {
        //console.log(data)
        const user = usersState.users.find(user => user.id === socket.id)
        userName = user.name
        io.emit("message", `${userName} (sent: ${data.time}) : ${data.text}`)
    })

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log(" Does it work ?");
        const user = usersState.users.find(u => u.id === socket.id);
        if (user) {
            console.log(`User ${user.name} (${socket.id}) disconnected`);

            usersState.setUsers(usersState.users.filter(u => u.id !== socket.id));

            io.emit("usersList", usersState.users);
            io.emit("message", `User ${user.name} has left the IRC!`);
        }
    });
})