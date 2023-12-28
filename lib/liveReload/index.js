// @ts-check

const fs = require('fs');
const path = require('path');

/**
 * @param {Request} req
 * @returns {boolean}
 */
module.exports.isHtmlRequest = function (req) {
  if (req.method !== "GET") {
    return false
  };
  
  /** @type {string[]} */
  const mimeTypes = req.headers['accept']?.split(',');
  if (!mimeTypes.includes('text/html')) {
    return false;
  }

  return true;
};

/**
 * @param {string} dir
 * @param {string} requestPath
 * @returns {string}
 */
module.exports.readStaticHtml = function (dir, requestPath) {
  // ignore vulnerability like "../../etc/passwd"
  // because this is for local development

  const indexFile = requestPath.endsWith('/') ? 'index.html' : '';
  const filePath = path.join(dir, `.${requestPath}`, indexFile);
  const content = fs.readFileSync(filePath, 'utf8');

  return content;
};

module.exports.getInjectionHtml = function () {
  return fs.readFileSync(path.join(__dirname, 'injection-code.html'), 'utf8');
};
