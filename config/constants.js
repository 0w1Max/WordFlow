// Версионируем API сразу — WordFlow задуман как модуль экосистемы KeyStep,
// и другие модули будут дёргать этот API. Версионирование убережёт их от поломок
// при будущих изменениях контракта.
const API_PREFIX = '/api/v1';

// Раньше порт был захардкожен в server.js, хотя docker-compose.yml уже
// передавал переменные окружения (NODE_ENV), которые никто не читал.
// Теперь порт можно переопределить через .env / docker-compose.
const PORT = process.env.PORT || 3000;

// Секрет для подписи JWT. В проде ОБЯЗАТЕЛЬНО должен быть задан через
// переменную окружения — иначе токены разных деплоев/разработчиков будут
// подписаны одним и тем же дефолтным значением, что небезопасно.
// Для локальной разработки без .env даём запасной вариант, чтобы не
// блокировать быстрый старт, но громко предупреждаем в логах.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';

if (!process.env.JWT_SECRET) {
  console.warn(
    '[config] JWT_SECRET не задан в переменных окружения — используется ' +
    'небезопасное значение по умолчанию. Обязательно задайте JWT_SECRET ' +
    'перед деплоем в прод (Vercel → Settings → Environment Variables).'
  );
}

const JWT_EXPIRES_IN = '30d';
const AUTH_COOKIE_NAME = 'wordflow_token';

module.exports = {
  API_PREFIX,
  PORT,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  AUTH_COOKIE_NAME
};
