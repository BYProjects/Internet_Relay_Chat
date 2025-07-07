const socket = io("ws://localhost:8080")

const msg = document.getElementById("message")
const chatRoom = document.getElementById("room")

const rooms = document.querySelector(".rooms")

let username = null;

document.addEventListener("DOMContentLoaded", () => {
    while (!username) {
        username = prompt("Please write your username");
    }
    socket.emit("setUserName", username);
})

function sendMessage(e) {
    e.preventDefault()
    if (msg.value) {
        socket.emit("message", {
            "text": msg.value,
            "time": new Intl.DateTimeFormat("default", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "numeric",
                minute: "numeric"
            }).format(new Date())
        })
        msg.value = ""
    }
    msg.focus()
}

function createNewUser(id, name) {
    const user = { id, name }
    usersState.setUsers([
        usersState.users,
        user
    ])
}

document.querySelector(".form-message").addEventListener("submit", sendMessage)

socket.on("message", (data) => {
    const li = document.createElement("li")
    li.textContent = data  
    document.querySelector("ul").appendChild(li)
})