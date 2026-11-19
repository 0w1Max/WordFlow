const path = require('path');
const { API_PREFIX } = require('../config/constants');
function spaFallback(publicDir) {
  return function (req, res, next) {
    if (req.method !== 'GET' || req.path.startsWith(API_PREFIX)) {
      return next();
    }

    res.sendFile(path.join(publicDir, 'index.html'));
  };
}

module.exports = spaFallback;
