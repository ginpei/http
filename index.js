#!/usr/bin/env node
const express = require('express');
const expressWs = require('express-ws');
const fs = require('fs');
const path = require('path');
const { getInjectionHtml, readStaticHtml, isHtmlRequest, watch } = require('./lib/liveReload');
const { isMarkdownRequest, renderMarkdownHtml } = require('./lib/markdown');

const port = process.env.PORT || 3000;
const cwd = path.resolve('.');

const app = express();
expressWs(app);

app.ws('/liveReload', function(ws) {
  watch(cwd, () => {
    ws.send('changed');
  });
});

app.all('*', (req, res, next) => {
  if (isMarkdownRequest(req)) {
    const original = renderMarkdownHtml(cwd, req.path);
    const injection = getInjectionHtml();
    const modified = `${original}\n${injection}`;
    res.send(modified);
    return;
  }

  if (!isHtmlRequest(req)) {
    next();
    return;
  }

  const original = readStaticHtml(cwd, req.path);
  const injection = getInjectionHtml();
  const modified = `${original}\n${injection}`;
  res.send(modified);
});

app.use(express.static(cwd)); // working dir

app.listen(port, () => {
  console.log(`Current working directory: ${cwd}`);
  console.log(`End point: http://localhost:${port}/`);
});
