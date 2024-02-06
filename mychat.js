// Define variables for server connection, message history, and user ID mapping
var server;
var msgHistory = [];
var idUsernameMap = {};

// Event listener for the login form submission
document.getElementById('logCredentials').addEventListener('submit', function(event) {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var room = document.getElementById('room').value;

    // Store username and room in localStorage
    localStorage.setItem('username', username);
    localStorage.setItem('room', room);
    document.getElementById('room-name-display').textContent = "Room: " + room;

    // Establish WebSocket connection with the chat server
    server = new SillyClient();
    server.connect("wss://ecv-etic.upf.edu/node/9000/ws", room);
    server.username = username;

    server.on_connect = function() {
        console.log("Connected to the server in room:", room);
        // Add current user to contact list
        updateContactList(server.username, "add");
};

server.on_user_connected = function(new_user_id) {
    console.log("New user connected:", new_user_id);
    // Send message history to new user
    if (new_user_id !== server.user_id) {
      var historyMessage = {
          type: "history",
          content: msgHistory
      };
      server.sendMessage(JSON.stringify(historyMessage), [new_user_id]);
      
      // Send join message to new user
      var joinMessage = {
          type: "join",
          username: server.username,
      };
      console.log("Sending join message for:", server.username);
      server.sendMessage(JSON.stringify(joinMessage));
  }
};

server.on_user_disconnected = function(user_id) {
    console.log("User disconnected:", user_id);
    if (idUsernameMap[user_id]) {
      var username = idUsernameMap[user_id].username;
      updateContactList(username, "remove"); // Remove user from contact list
      delete idUsernameMap[user_id]; // Remove user from mapping
    }
  };
server.on_message = function(author_id, msg) {
      var parsedMsg;
      try {
          parsedMsg = JSON.parse(msg);
      } catch (e) {
          console.error("Error parsing message:", msg);
          return;
      }
      if (parsedMsg.type === "text") {
        // Handling real-time chat messages
        appendMessageToChat(parsedMsg.username, parsedMsg.message);
        // Add message to history
        msgHistory.push(parsedMsg);
      } else if (parsedMsg.type === "history") {
        // Here's what to do when you receive a history message,
        parsedMsg.content.forEach(function(historyMsg) {
          appendMessageToChat(historyMsg.username, historyMsg.message);
          });
      } else if (parsedMsg.type === "join") {
        // Handling of accession type messages1
        console.log("Processing join message for:", parsedMsg.username);
        idUsernameMap[author_id] = { username: parsedMsg.username };
        updateContactList(parsedMsg.username, "add"); //  Updating the contact list
      } else if (parsedMsg.type === "myInfo") {
        // Handling of accession type messages2
        console.log("Processing myInfo message for:", parsedMsg.username);
        idUsernameMap[author_id] = { username: parsedMsg.username };
        updateContactList(parsedMsg.username, "add"); //  Updating the contact list
      } else {
        console.log("Received unknown type of message:", parsedMsg);
      }
  };

server.on_ready = function(my_id) {
    server.user_id = my_id; // Store the user's ID
    var joinMessage = {
          type: "text",
          username: username,
          message: username + " joined the chat.",
    };
    server.sendMessage(JSON.stringify(joinMessage));
    // Creating a message with new user information
    var myInfoMessage = {
          type: "myInfo",
          username: localStorage.getItem('username'),
    };
    // Sending a message using the broadcast function
    server.sendMessage(JSON.stringify(myInfoMessage)); 
};

// Hide login page and display chat page
document.querySelector('.loginPage').style.display = 'none';
document.getElementById('chatPage').style.display = 'grid';

// Enter key press => send message
document.getElementById('messageInput').addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
      sendMessage();
      event.preventDefault();
    }
  });
});

function sendMessage() {
    var input = document.getElementById('messageInput');
    var message = input.value.trim();
    var username = localStorage.getItem('username');

    if (message !== "") {
        var timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}); // Get current time (hours and minutes)
        var msgObject = {
            type: "text",
            username: username,
            message: message,
            timestamp: timestamp // Include timestamp in the message object
        };
        server.sendMessage(JSON.stringify(msgObject));
        msgHistory.push(msgObject);
        appendMessageToChat(username, message, timestamp); // Pass timestamp to the appendMessageToChat function
        input.value = '';
    }
}

function appendMessageToChat(username, message, timestamp) {
    var chatMessages = document.querySelector('.chat-messages');
    var messageElement = document.createElement('div');
    messageElement.classList.add('message');

    var messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    var usernameElement = document.createElement('span');
    usernameElement.classList.add('message-username');
    usernameElement.textContent = username + ": ";
    usernameElement.style.fontWeight = "bold";
    messageContent.appendChild(usernameElement);

    var textElement = document.createElement('span');
    textElement.classList.add('message-text');
    textElement.textContent = message;
    messageContent.appendChild(textElement);

    // Create a container for the message content and timestamp
    var contentContainer = document.createElement('div');
    contentContainer.classList.add('message-content-container');
    contentContainer.appendChild(messageContent);

    // Create a separate element for the timestamp
    var timestampElement = document.createElement('div');
    timestampElement.classList.add('message-timestamp');
    timestampElement.textContent = timestamp; // Display timestamp
    contentContainer.appendChild(timestampElement);
    
    // Append message to chat window
    messageElement.appendChild(contentContainer);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updateContactList(username, action) {
    var contactsDiv = document.querySelector('.Contacts');
    console.log("Updating contact list for:", username, "Action:", action);
    if (action === "add") {
      var contactElement = document.createElement("div");
      contactElement.classList.add("contact");
      contactElement.textContent = username;
      contactsDiv.appendChild(contactElement);
    } else if (action === "remove") {
      // Remove user from contact list
      var contacts = contactsDiv.getElementsByClassName("contact");
      for (var i = 0; i < contacts.length; i++) {
        if (contacts[i].textContent === username) {
          contactsDiv.removeChild(contacts[i]);
          break;
        }
      }
    }
}