const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 5000;

let groups = {};

app.use(express.json());

// Créer un groupe
app.post('/create-group', (req, res) => {
    const { maxParticipants } = req.body;
    const groupId = uuidv4();
    groups[groupId] = { participants: [], maxParticipants, createdAt: Date.now() };
    res.json({ groupId });
});

// Rejoindre un groupe
app.post('/join-group', (req, res) => {
    const { groupId } = req.body;
    if (groups[groupId] && groups[groupId].participants.length < groups[groupId].maxParticipants) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Group not found or full.' });
    }
});

// Socket.IO pour la communication en temps réel
io.on('connection', (socket) => {
    socket.on('join', ({ groupId, userId }) => {
        if (groups[groupId]) {
            groups[groupId].participants.push(userId);
            socket.join(groupId);
            io.to(groupId).emit('user-joined', { userId });

            // Supprimer le groupe si vide pendant 5 minutes
            const checkEmptyGroup = setInterval(() => {
                if (groups[groupId].participants.length === 0) {
                    clearInterval(checkEmptyGroup);
                    delete groups[groupId];
                    console.log(`Group ${groupId} deleted`);
                }
            }, 300000); // 5 minutes
        }
    });

    socket.on('leave', ({ groupId, userId }) => {
        if (groups[groupId]) {
            groups[groupId].participants = groups[groupId].participants.filter(id => id !== userId);
            socket.leave(groupId);
            io.to(groupId).emit('user-left', { userId });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
