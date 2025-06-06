# FocusView Demo
This directory contains a small Node.js/WebRTC example. It lets you generate a temporary, one-use sharing link and watch a browser tab in real time.

### Running locally
1. Install dependencies with `npm install`.
2. Start the server using `npm start`.
3. Open `http://localhost:3000` in your browser.
4. Click **Create Share Link** and send the URL to the person who will share.

### Tests
Run `npm test` to perform a tiny self-check that verifies Node is working. No dependencies are required for this.

### Hosting
Any Node-friendly host will work (Render, Railway or a small VPS). The server is stateless so it can easily run on inexpensive free tiers.

For GitHub Pages, use the `docs/` folder in the repository instead – it contains a purely client-side version powered by PeerJS Cloud.

This demo is for educational purposes only; you must obtain consent from anyone whose screen you watch.
