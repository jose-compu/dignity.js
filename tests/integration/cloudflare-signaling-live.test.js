const { DEFAULT_CLOUDFLARE_SIGNALING_URLS } = require('../../src/signaling/default-signaling-config');

const LIVE_TESTS_ENABLED = process.env.RUN_CLOUDFLARE_LIVE_TESTS === '1';
const LIVE_TIMEOUT_MS = Number(process.env.CLOUDFLARE_LIVE_TIMEOUT_MS || 15000);
const LIVE_INPUTS_READY = LIVE_TESTS_ENABLED;

function withTimeout(promise, timeoutMs, label) {
  let timer;
  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
    })
  ]);
}

function buildPeerJsUrl(baseUrl, id, token) {
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}id=${id}&token=${token}`;
}

async function openPeerSocket(baseUrl, id) {
  const token = Math.random().toString(36).slice(2, 10);
  const url = buildPeerJsUrl(baseUrl, id, token);

  return await new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const messageQueue = [];
    const waiters = [];

    socket.onmessage = (event) => {
      const raw = String(event.data);
      let payload = raw;
      try {
        payload = JSON.parse(raw);
      } catch (error) {
        payload = raw;
      }

      const waiter = waiters.shift();
      if (waiter) {
        waiter(payload);
      } else {
        messageQueue.push(payload);
      }
    };

    const timeout = setTimeout(() => {
      try {
        socket.close();
      } catch (error) {
        // ignore close errors during timeout cleanup
      }
      reject(new Error(`connect ${url} timed out after ${LIVE_TIMEOUT_MS}ms`));
    }, LIVE_TIMEOUT_MS);

    socket.onopen = () => {
      clearTimeout(timeout);
      resolve({
        socket,
        async nextMessage(label) {
          if (messageQueue.length > 0) {
            return messageQueue.shift();
          }

          return await withTimeout(
            new Promise((resolveMessage) => {
              waiters.push(resolveMessage);
            }),
            LIVE_TIMEOUT_MS,
            label
          );
        }
      });
    };

    socket.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Unable to connect to signaling url ${baseUrl}`));
    };
  });
}

const describeLive = LIVE_INPUTS_READY ? describe : describe.skip;

describeLive('Cloudflare signaling live integration', () => {
  test(
    'all configured PeerJS endpoints accept live websocket sessions',
    async () => {
      if (!globalThis.WebSocket) {
        throw new Error('Global WebSocket implementation is not available in this runtime');
      }

      for (const baseUrl of DEFAULT_CLOUDFLARE_SIGNALING_URLS) {
        const peerId = `dignityjs_${Math.random().toString(36).slice(2, 10)}`;
        const peer = await openPeerSocket(baseUrl, peerId);
        try {
          const openMessage = await peer.nextMessage(`OPEN from ${baseUrl}`);
          expect(openMessage).toMatchObject({ type: 'OPEN' });
        } finally {
          peer.socket.close();
        }
      }
    },
    45000
  );

  test(
    'at least one configured PeerJS endpoint relays OFFER messages between peers',
    async () => {
      if (!globalThis.WebSocket) {
        throw new Error('Global WebSocket implementation is not available in this runtime');
      }

      let relaySuccessCount = 0;
      const relayFailures = [];

      for (const baseUrl of DEFAULT_CLOUDFLARE_SIGNALING_URLS) {
        const senderId = `sender_${Math.random().toString(36).slice(2, 10)}`;
        const receiverId = `receiver_${Math.random().toString(36).slice(2, 10)}`;
        const sender = await openPeerSocket(baseUrl, senderId);
        const receiver = await openPeerSocket(baseUrl, receiverId);

        try {
          const senderOpen = await sender.nextMessage(`sender OPEN from ${baseUrl}`);
          const receiverOpen = await receiver.nextMessage(`receiver OPEN from ${baseUrl}`);
          expect(senderOpen).toMatchObject({ type: 'OPEN' });
          expect(receiverOpen).toMatchObject({ type: 'OPEN' });

          const offer = {
            type: 'OFFER',
            src: senderId,
            dst: receiverId,
            payload: { type: 'offer', sdp: 'dignity-live-test' }
          };
          sender.socket.send(JSON.stringify(offer));

          const received = await receiver.nextMessage(`relayed OFFER from ${baseUrl}`);
          expect(received).toMatchObject(offer);
          relaySuccessCount += 1;
        } catch (error) {
          relayFailures.push(`${baseUrl}: ${error.message}`);
        } finally {
          sender.socket.close();
          receiver.socket.close();
        }
      }

      if (relaySuccessCount === 0) {
        throw new Error(`No live PeerJS endpoint relayed OFFER traffic. Failures: ${relayFailures.join(' | ')}`);
      }
    },
    60000
  );
});
