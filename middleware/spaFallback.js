const path = require('path');
const { API_PREFIX } = require('../config/constants');

// Клиентский роутер (public/app/core/router.js) знает про пути вроде /review
// и /add, но сервер про них ничего не знал: прямой переход или обновление
// страницы на /review отдавали 404, потому что express.static не находит
// такой файл. Эта middleware отдаёт index.html на любой не-API GET-запрос,
// а дальше JS на клиенте сам решает, какую страницу рендерить.
function spaFallback(publicDir) {
  return function (req, res, next) {
    if (req.method !== 'GET' || req.path.startsWith(API_PREFIX)) {
      return next();
    }

    res.sendFile(path.join(publicDir, 'index.html'));
  };
}

module.exports = spaFallback;
