### __xX_MY_CHAT_Xx__ is a simple chat website where users can connect and chat in real-time.

## How it Works

- **Login Page:** When you first visit the website, you'll see the login page. Here, users are prompted to enter their username and the chat room they want to join. This information is essential for connecting to the chat server. Initially hidden, the chat page is displayed after successful login.

- **Establishing Connection:** Upon submitting the login form, the client-side JavaScript code establishes a WebSocket connection with the chat server using the SillyClient library. The server URL is hardcoded in the script.

- **Handling User Interaction:** 
  - When a user successfully connects to the server, they're redirected to the chat page.
  - The client-side code listens for events such as user connection, disconnection, and message reception from the server.
  - Messages are sent and received as JSON objects containing the username, message content, and timestamp.

- **Displaying Chat History:** 
  - When a new user joins the chat room, the client requests the chat history from the server.
  - The server sends the chat history to the new user, allowing them to see previous messages.

- **Real-time Messaging:** 
  - Users can send messages in real-time, and the client-side code displays received messages immediately without requiring a page refresh.
  - Each message is appended to the chat window along with the sender's username and a timestamp indicating when the message was sent.

- **Online Users Pannel**
    - The pannel on the left of the chat shows the selected room online users.