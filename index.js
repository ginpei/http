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

const app = express();
expressWs(app);

app.use('/_http/mermaid', express.static(mermaidDist));

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
});
