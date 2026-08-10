#!/usr/bin/env node
const express = require('express');
const expressWs = require('express-ws');
const fs = require('fs');
const path = require('path');
const { getInjectionHtml, readStaticHtml, isHtmlRequest, watch } = require('./lib/liveReload');
const { isMarkdownRequest, renderMarkdownHtml } = require('./lib/markdown');

const port = process.env.PORT || 3000;
const cwd = path.resolve('.');
const mermaidDist = path.dirname(require.resolve('mermaid'));
const corsEnabled = process.argv.includes('--cors') || process.argv.includes('--cross-origin');

const app = express();
expressWs(app);

app.use('/_http/mermaid', express.static(mermaidDist));

if (corsEnabled) {
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });
}

app.ws('/liveReload', function(ws) {
  watch(cwd, () => {
    ws.send('changed');
  });
});

app.all('*', (req, res, next) => {
  if (isMarkdownRequest(req)) {
    try {
      const original = renderMarkdownHtml(cwd, req.path);
      const injection = getInjectionHtml();
      const modified = `${original}\n${injection}`;
      res.send(modified);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`File not found: ${error.path}`);
        // let express.static (and its default 404) handle the missing file
        next();
        return;
      }
      next(error);
    }
    return;
  }

  if (!isHtmlRequest(req)) {
    next();
    return;
  }

  try {
    const original = readStaticHtml(cwd, req.path);
    const injection = getInjectionHtml();
    const modified = `${original}\n${injection}`;
    res.send(modified);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`File not found: ${error.path}`);
      // let express.static (and its default 404) handle the missing file
      next();
      return;
    }
    next(error);
  }
});

app.use(express.static(cwd)); // working dir

app.listen(port, () => {
  console.log(`Current working directory: ${cwd}`);
  console.log(`End point: http://localhost:${port}/`);
  if (corsEnabled) {
    console.log('CORS: enabled (Access-Control-Allow-Origin: *)');
  }
});
