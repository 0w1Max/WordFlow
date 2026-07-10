// Базовый класс ошибок приложения. Отличаем «ожидаемые» ошибки (валидация,
// «не найдено» и т.д.) от неожиданных багов — только первые безопасно
// показывать клиенту как есть, вторые всегда прячем за общим текстом.
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404);
  }
}

module.exports = { AppError, ValidationError, NotFoundError };
