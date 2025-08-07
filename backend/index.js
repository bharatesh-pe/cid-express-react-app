const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require("path");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('./controllers/alertCronJob');  // Load cron jobs

const routes = require('./routes/index');
//const redisClient = require('./config/redisConfig');
// require('../../da-react/')

const app = express();
const server = http.createServer(app);
// const io = new Server(server);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins
        methods: ['GET', 'POST'],
    },
});

app.set('io', io);

app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
app.use(cookieParser());

// Serve static files from the 'public' directory
app.use('/files', express.static(path.join(__dirname, 'public/files')));
app.use('/helpVideos', express.static(path.join(__dirname, 'data/helpVideos')));

// Example route to serve a PDF file
app.get('/files/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public/files', filename);
    res.sendFile(filePath);
});

// Serve static files from the React app's build directory
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle requests for React router  
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
    next();
});

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: "404 - Not Found"
    });
});

// General error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);  // Log the error for debugging
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error"
    });
});


/*redisClient.connect()
    .then(() => console.log('Redis client connected'))
    .catch((err) => console.error('Redis connection error:', err));
*/

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Export Socket.IO instance for use in controllers
app.set('socketio', io);


// Server listens on port 3001
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = app;
