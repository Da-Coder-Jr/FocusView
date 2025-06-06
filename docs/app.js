const createBtn = document.getElementById('createBtn');
const linkP = document.getElementById('link');
const copyBtn = document.getElementById('copy');
const video = document.getElementById('video');
const watchDiv = document.getElementById('watch');
const info = document.getElementById('info');

let peer;
let activeCall;

createBtn.onclick = () => {
  const id = Math.random().toString(16).slice(2, 10);
  const url = location.origin + location.pathname + '#share=' + id;
  linkP.textContent = url;
  copyBtn.style.display = 'inline';
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(url);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
  };
  startWatching(id);
};

function startWatching(id) {
  watchDiv.style.display = 'block';
  createBtn.style.display = 'none';
  peer = new Peer(id);
  let used = false;
  peer.on('open', () => {
    info.textContent = 'Waiting for remote tab...';
  });
  peer.on('call', call => {
    if (used) { call.close(); return; }
    used = true;
    activeCall = call;
    call.answer();
    call.on('stream', stream => {
      video.srcObject = stream;
      info.textContent = '';
    });
    call.on('close', () => {
      info.textContent = 'Share ended';
    });
  });
  setTimeout(() => {
    if (!used) { info.textContent = 'Link expired'; peer.destroy(); }
  }, 10 * 60 * 1000);
}

function startSharing(id) {
  watchDiv.style.display = 'block';
  createBtn.style.display = 'none';
  peer = new Peer();
  peer.on('open', async () => {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    video.srcObject = stream;
    info.textContent = 'Sharing this tab...';
    activeCall = peer.call(id, stream);
    activeCall.on('close', () => {
      info.textContent = 'Viewer disconnected';
    });
  });
}

function parseHash() {
  if (location.hash.startsWith('#watch=')) {
    startWatching(location.hash.slice(7));
  } else if (location.hash.startsWith('#share=')) {
    startSharing(location.hash.slice(7));
  }
}

parseHash();
