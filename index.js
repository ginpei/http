#!/usr/bin/env node
const express = require('express');
const expressWs = require('express-ws');
const fs = require('fs');
const { getInjectionHtml, readStaticHtml, isHtmlRequest, watch } = require('./lib/liveReload');

const port = process.env.PORT || 3000;
const filePath = '.';

const app = express();
expressWs(app);

app.ws('/liveReload', function(ws) {
  watch(filePath, () => {
    ws.send('changed');
  });
});

app.all('*', (req, res, next) => {
  if (!isHtmlRequest(req)) {
    next();
    return;
  }

  const original = readStaticHtml(__dirname, req.path);
  const injection = getInjectionHtml();
  const modified = `${original}\n${injection}`;
  res.send(modified);
});

app.use(express.static(filePath)); // working dir

app.listen(port, () => {
  console.log(`http://localhost:${port}/`);
});
