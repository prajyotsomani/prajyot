
import express from 'express';
import cors from 'cors';
import "dotenv/config";
import http from 'http';
import main from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from "socket.io";

// Create Express app and HTTP server 
const app=express();
const server=http.createServer(app);


// Initialize socket.io server
export const io = new Server(server,{
    cors:{origin:"*"} // that allow all the origin 
})

// store online users
export const userSocketMap ={}; // {userId:socketId}

// socket.io connection handler
io.on("connection",(socket)=>{
    const userId=socket.handshake.query.userId;
    console.log("User Connected",userId);

    if(userId) userSocketMap[userId]=socket.id;

    //Emit online users to all connected client
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
    socket.on("disconnect",()=>{
        console.log("User Disconnected",userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})

// middleware setup 
app.use(express.json({limit: "4mb"}));
app.use(
  cors({
    origin: "https://giggle-chat-one.vercel.app"
  })
);

// Initialize database on first request (for Vercel)
app.use(async (req, res, next) => {
    await initializeDB();
    next();
});

// Routes setup
app.use("/api/status",(req,res)=>res.send("Server is live"));
app.use("/api/auth", (req, res, next) => {
    console.log("Auth route hit");
    next();
}, userRouter);
app.use("/api/messages", (req, res, next) => {
    console.log("Messages route hit");
    next();
}, messageRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ status: "Server is running", env: process.env.NODE_ENV });
});

// Initialize database connection once on startup
let dbInitialized = false;
async function initializeDB() {
    if (!dbInitialized) {
        try {
            await main();
            dbInitialized = true;
            console.log("Database initialized successfully");
        } catch (error) {
            console.error("Database initialization failed:", error.message);
            // Continue anyway, some routes might not need DB
        }
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({ 
        error: "Internal Server Error", 
        message: err.message 
    });
});

// Start server for local development
const PORT = process.env.PORT || 5000;

if(process.env.NODE_ENV === "development" || process.env.NODE_ENV === undefined) {
    (async () => {
        await initializeDB();
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })();
} else {
    // For production (including Vercel)
    (async () => {
        await initializeDB();
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })();
}

// Export for Vercel serverless functions
export default app;
