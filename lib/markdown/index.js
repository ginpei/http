// @ts-check

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js').default;

marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    if (lang === 'mermaid') {
      return code;
    }

    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
}));

marked.use({
  renderer: {
    code({ text, lang }) {
      if (lang !== 'mermaid') {
        return false;
      }

      return `<pre class="mermaid">${escapeHtml(text)}</pre>`;
    },
  },
});

const githubMarkdownCss = fs.readFileSync(
  require.resolve('github-markdown-css/github-markdown.css'),
  'utf8'
);
const highlightJsCss = fs.readFileSync(
  require.resolve('highlight.js/styles/github.css'),
  'utf8'
);

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (character) => {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[character];
  });
}

/**
 * @param {import('express').Request} req
 * @returns {boolean}
 */
module.exports.isMarkdownRequest = function (req) {
  if (req.method !== 'GET') {
    return false;
  }

  return req.path.endsWith('.md');
};

/**
 * Reads a markdown file and renders it as a full HTML document, styled like
 * GitHub's rendered markdown, with syntax highlighting for code blocks.
 * @param {string} dir
 * @param {string} requestPath
 * @returns {string}
 */
module.exports.renderMarkdownHtml = function (dir, requestPath) {
  // ignore vulnerability like "../../etc/passwd"
  // because this is for local development

  const filePath = path.join(dir, requestPath);
  const markdown = fs.readFileSync(filePath, 'utf8');
  const content = marked.parse(markdown);
  const title = path.basename(requestPath);
  const mermaidScript = content.includes('class="mermaid"')
    ? `<script type="module">
    import mermaid from "/_http/mermaid/mermaid.esm.min.mjs";
    mermaid.initialize({ startOnLoad: false });
    await mermaid.run({ querySelector: ".mermaid" });
  </script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
${githubMarkdownCss}
${highlightJsCss}
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
  </style>
</head>
<body>
  <article class="markdown-body">
${content}
  </article>
${mermaidScript}
</body>
</html>`;
};
