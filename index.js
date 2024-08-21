const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { startMirage } = require('./Utils/Socket');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define your other routes 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/Public/index.html'); 
});

// Improved Error Handling with More Detail
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the full error stack for debugging
    const statusCode = err.statusCode || 500; // Use a custom status code if set, otherwise 500
    const errorMessage = err.message || 'Internal Server Error'; // Use a custom message if set
    res.status(statusCode).send(errorMessage);
});

// Socket.IO Event Handling (Example)
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('message', (message) => {
        console.log('Received message:', message);
        // ... (send the message to other clients, process it, etc.)
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
(async () => {
    try {
        await startMirage(io); // Await the start of your news function
        server.listen(port, () => { // Use 'server' instead of 'app'
            console.log(`Server is listening on port ${port}`);
        });
    } catch (err) {
        console.error('Error starting server or news function:', err); // More descriptive error
    }
})();
