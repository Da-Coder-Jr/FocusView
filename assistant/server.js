const express = require('express');
const http = require('http');
const path = require('path');
const crypto = require('crypto');
const { Server } = require('socket.io');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(helmet());

// store room ids temporarily
const rooms = new Set();

app.use(express.json());
// create a temporary room id
app.post('/api/create', (req, res) => {
  const id = crypto.randomBytes(8).toString('hex');
  rooms.add(id);
  // expire after 10 minutes
  setTimeout(() => rooms.delete(id), 10 * 60 * 1000);
  res.json({ id });
});

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('join', (room) => {
    if (!rooms.has(room)) {
      socket.emit('errorMsg', 'Invalid or expired room');
      return;
    }
    rooms.delete(room); // one-time use
    socket.join(room);
    socket.to(room).emit('joined');
  });

  socket.on('signal', ({ room, data }) => {
    socket.to(room).emit('signal', data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
