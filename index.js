'use strict';
require('dotenv').config();
const StreamingClient = require('./streamingClient.js');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const expressWs = require('express-ws')(app);
const axios = require('axios');
const { Readable } = require('stream');
const jwt = require('jsonwebtoken');
const speech = require('@google-cloud/speech');

app.use(bodyParser.json());
app.use(express.static('public'));

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.header('Access-Control-Allow-Methods', 'OPTIONS,GET,POST,PUT,DELETE');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With'
  );
  next();
});

app.post('/startStreaming', async (req, res) => {
  try {
    console.log('someone wants to stream');
    const streamId = req.body.streamId;
    // console.log(streamId);
    const response = await startStreamer(streamId);
    res.send(response);
  } catch (e) {
    console.log(e);
  }
});

app.ws('/socket', async (ws, req) => {
  console.log('someone connected');
  const uuid = req?.query?.uuid ? req.query.uuid : 'dummyuuid';
  // let uuid = 'dummyuuid';
  let sc = new StreamingClient(uuid, 'en-US', 'es');
  await sc.init();
  const aWss = expressWs.getWss().clients;

  // aWss.forEach(function (client) {
  //   console.log(client);
  // });

  // Array.from(expressWs.getWss().clients).map((sock) => {
  //   console.log(sock.route);
  // }); /* <- Your path */
  // }).forEach(function (client) {
  //   client.send(msg.data);
  // });

  // setTimeout(() => {
  //   ws.send('{"original":"mis huevos"}');
  // }, 3000);

  sc.setAudioChunkAvailableCallback(function (chunk) {
    console.log('audio available');
    const aWss = expressWs.getWss('/socket').clients;
    if (ws.readyState === 1) {
      aWss.forEach(function (client) {
        // console.log(client);

        client.send(chunk);
      });
      // ws.send(chunk);
    }
  });

  sc.setTranscriptionAvailableCallback(function (data) {
    console.log(data);
    const aWss = expressWs.getWss('/socket').clients;
    aWss.forEach(function (client) {
      // console.log(client);
      // console.log(client._socket.server);
      client.send(JSON.stringify(data));
    });
    // ws.send(JSON.stringify(data));
  });
  sc.startRecognizer();
  ws.on('message', (msg) => {
    try {
      if (typeof msg === 'string') {
        let config = JSON.parse(msg);
        console.log(config);
        sc.setId(config.from);
      } else {
        // console.log(msg);
        sc.sendMessage(msg);
      }
    } catch (err) {
      console.log('[' + uuid + '] ' + err);
      ws.removeAllListeners('message');
      ws.close();
    }
  });

  ws.on('close', () => {
    console.log('[' + uuid + '] Websocket closed');
    sc.closeConversation();
    sc = null;
  });
});

const generateRestToken = () => {
  return new Promise((res, rej) => {
    jwt.sign(
      {
        iss: process.env.apiKey,
        // iat: Date.now(),
        ist: 'project',
        exp: Date.now() + 200,
        jti: Math.random() * 132,
      },
      process.env.apiSecret,
      { algorithm: 'HS256' },
      function (err, token) {
        if (token) {
          console.log('\n Received token\n', token);
          res(token);
        } else {
          console.log('\n Unable to fetch token, error:', err);
          rej(err);
        }
      }
    );
  });
};

const startStreamer = async (streamId) => {
  try {
    // const { sessionId, token, apiKey } = await getCredentials();

    const data = JSON.stringify({
      sessionId: process.env.sessionId,
      token: process.env.token,
      websocket: {
        uri: `${process.env.websocket_url}/socket`,
        streams: [streamId],
        headers: {
          from: streamId,
        },
      },
    });

    const config = {
      method: 'post',
      url: `https://api.dev.opentok.com/v2/project/${process.env.apiKey}/connect`,
      headers: {
        'X-OPENTOK-AUTH': await generateRestToken(),
        'Content-Type': 'application/json',
      },
      data: data,
    };
    // console.log(config);
    const response = await axios(config);
    console.log(response.data);
    return response.data;
  } catch (e) {
    console.log(e);
    return e;
  }
};

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Server application listening on port ${port}!`)
);
