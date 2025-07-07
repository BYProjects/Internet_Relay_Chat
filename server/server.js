const express = require("express");
const socketIo = require("socket.io");

const port = 8080

const app = express()
const expressServer = app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

const usersState = {
    users: [],
    setUsers: function(newUsersArray) {
        this.users = newUsersArray
    }
}

const io = socketIo(expressServer, {
    cors: {
        origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
        methods: ["GET", "POST"]
    }
})

io.on("connection", socket => {
    console.log(`User ${socket.id} connected`)

    socket.on("setUserName", (name) => {
        socket.username = name
        usersState.setUsers([
            ...usersState.users,
            { id: socket.id, name, room: null }
        ])
        console.log(usersState)


    socket.emit("message", `Welcome to the IRC ${name} !`)
    socket.broadcast.emit("message", `User ${name} has joined the IRC !`)
    })


    socket.on("message", data => {
        console.log(data)
        const user = usersState.users.find(user => user.id === socket.id)
        userName = user.name
        io.emit("message", `${userName} (sent: ${data.time}) : ${data.text}`)
    })

    socket.on("disconnect", () => {
        const user = usersState.users.find(user => user.id === socket.id)
        userName = user.name
        socket.broadcast.emit("message", `User ${userName} has left the IRC ! `)
    })
})