#!/usr/bin/env node
const express = require('express');
const expressWs = require('express-ws');
const fs = require('fs');

const port = process.env.PORT || 3000;
const filePath = '.';

const app = express();
expressWs(app);

app.ws('/liveReload', function(ws) {
  fs.watch(filePath, () => {
    ws.send('changed');
  });
});

app.use(express.static(filePath)); // working dir

app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
