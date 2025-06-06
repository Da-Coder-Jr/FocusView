const socket = io();
const createBtn = document.getElementById('createBtn');
const linkP = document.getElementById('link');
const copyBtn = document.getElementById('copy');
const expireP = document.getElementById('expire');
const video = document.getElementById('video');
const watchDiv = document.getElementById('watch');

async function requestId() {
  const res = await fetch('/api/create', { method: 'POST' });
  const data = await res.json();
  return data.id;
}

let roomId;
let pc;

createBtn.onclick = async () => {
  roomId = await requestId();
  const url = location.origin + location.pathname + '#share=' + roomId;
  linkP.textContent = url;
  expireP.textContent = 'Link expires in 10 minutes and works once.';
  copyBtn.style.display = 'inline';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(url);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
  };
  // viewer automatically starts watching
  location.hash = '#watch=' + roomId;
  startViewing();
};

async function startViewing() {
  watchDiv.style.display = 'block';
  createBtn.style.display = 'none';

  socket.emit('join', roomId);
  socket.on('errorMsg', (msg) => {
    alert(msg);
    window.location.hash = '';
    window.location.reload();
  });

  linkP.textContent = '';
  expireP.textContent = '';
  copyBtn.style.display = 'none';
  document.getElementById('info').textContent = 'Waiting for remote tab...';

  socket.on('joined', async () => {
    pc = new RTCPeerConnection();
    pc.ontrack = (e) => {
      video.srcObject = e.streams[0];
      document.getElementById('info').textContent = '';
    };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('signal', { room: roomId, data: { desc: pc.localDescription } });
  });

  socket.on('signal', async (data) => {
    if (data.desc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.desc));
      if (data.desc.type === 'offer') {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal', { room: roomId, data: { desc: pc.localDescription } });
      }
    } else if (data.candidate) {
      try { await pc.addIceCandidate(data.candidate); } catch(e) { console.error(e); }
    }
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('signal', { room: roomId, data: { candidate: event.candidate } });
    }
  };
}

function parseHash() {
  if (location.hash.startsWith('#watch=')) {
    roomId = location.hash.slice(7);
    startViewing();
  } else if (location.hash.startsWith('#share=')) {
    roomId = location.hash.slice(7);
    startSharing();
  }
}

async function startSharing() {
  watchDiv.style.display = 'block';
  createBtn.style.display = 'none';
  linkP.textContent = '';
  expireP.textContent = '';
  copyBtn.style.display = 'none';
  document.getElementById('info').textContent = 'Sharing this tab...';

  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  video.srcObject = stream;

  pc = new RTCPeerConnection();
  stream.getTracks().forEach(track => pc.addTrack(track, stream));

  socket.emit('join', roomId);
  socket.on('errorMsg', (msg) => {
    alert(msg);
    window.location.hash = '';
    window.location.reload();
  });

  socket.on('signal', async (data) => {
    if (data.desc) {
      await pc.setRemoteDescription(new RTCSessionDescription(data.desc));
      if (data.desc.type === 'offer') {
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal', { room: roomId, data: { desc: pc.localDescription } });
      }
    } else if (data.candidate) {
      try { await pc.addIceCandidate(data.candidate); } catch(e) { console.error(e); }
    }
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit('signal', { room: roomId, data: { candidate: event.candidate } });
    }
  };
}

parseHash();
