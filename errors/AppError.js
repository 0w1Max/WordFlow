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
  // field — необязательное имя конкретного поля формы, к которому относится
  // ошибка (например, "email" или "text"). Позволяет фронтенду подсветить
  // именно то поле, где проблема, а не только показать общий баннер сверху —
  // раньше это различие терялось на пути к клиенту.
  constructor(message, field = null) {
    super(message, 400);
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ресурс не найден') {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Требуется авторизация') {
    super(message, 401);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Конфликт данных') {
    super(message, 409);
  }
}

module.exports = { AppError, ValidationError, NotFoundError, UnauthorizedError, ConflictError };
