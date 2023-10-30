let AudioContext = window.AudioContext;
let translationPlaying = false;
let userId = null;
let timePlayingLeft = 0;
let captions = 'Say something...';
let originalCaptions = '';
let ws = null;
let ctx = null;
let gainNode = null;

let wsUrl = `wss://${window.location.origin.split('//')[1]}/socket`;

ws = new WebSocket(wsUrl);
ws.binaryType = 'arraybuffer';
startListeners();

function startListeners() {
  if (ws) {
    ctx = new AudioContext();
    gainNode = ctx.createGain();
    ctx.createMediaStreamDestination();
    gainNode.connect(ctx.destination);
    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        const info = JSON.parse(event.data);
      } else {
        console.log(event.data);

        ctx.decodeAudioData(event.data).then(function (decodedData) {
          // use the decoded data here
          const source = ctx.createBufferSource();
          source.buffer = decodedData;
          source.connect(gainNode);
          source.start();
          source.addEventListener('ended', endedHandler);
          function endedHandler(event) {
            console.log('Your audio has finished playing');
            source.disconnect();
          }
        });
      }
    };

    // Simulate WebSocket error and close events
    ws.onerror = (err) => {
      console.error(err);
    };
    ws.onclose = (event) => {
      console.info('Connection to websocket closed');
      console.log(event);
    };
    ws.onopen = (event) => {
      console.log('Connected');
    };
  }
}
