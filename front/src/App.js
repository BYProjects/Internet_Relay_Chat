import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:8080");

function App() {

  const [username, setUsername] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  // Handle user creation
  useEffect(() => {
    const user = prompt("Please write your username");
    if (user) {
      setUsername(user);
      socket.emit("setUserName", user);
    }
  }, []);


  useEffect(() => {
    // Listen for user updates
    socket.on("usersList", (usersList) => {
      setUsers(usersList);
    });

    // Listen to messages from server
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Prevent duplicates
    return () => {
      socket.off("message");
      socket.off("usersList");
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (message) {
      const formattedTime = new Intl.DateTimeFormat("default", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date());

      socket.emit("message", {
        text: message,
        time: formattedTime,
      });

      setMessage("");
    }
  };

  return (
    <div className="p-5 max-w-4xl mx-auto bg-white flex gap-5">
      <div className="flex-1 flex flex-col">
        <h2 className="text-xl font-bold mb-2">Chat Room</h2>
        <ul className="list-none p-3 border h-72 overflow-y-auto">
          {messages.map((msg, index) => (
            <li key={index} className="mb-2">{msg}</li>
          ))}
        </ul>

        <form className="flex gap-2 mt-3" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 p-2 border"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white">
            Send
          </button>
        </form>
      </div>

      <div className="w-48 flex flex-col">
        <h2 className="text-xl font-bold mb-2">Users</h2>
        <ul className="list-none p-3 border h-72 overflow-y-auto">
          {users.map((user) => (
            <li key={user.id} className="mb-2">{user.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );

};

export default App;
