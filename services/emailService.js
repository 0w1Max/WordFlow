const { Resend } = require('resend');

// Без указанного домена в Resend можно слать только с onboarding@resend.dev —
// этого достаточно для старта; для продакшна стоит подтвердить свой домен
// в Resend и указать его через RESEND_FROM_EMAIL.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'WordFlow <onboarding@resend.dev>';

let resendClient = null;

function getClient() {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

async function sendPasswordResetEmail(to, resetUrl) {
  const client = getClient();

  if (!client) {
    // Без ключа письмо отправить нельзя — печатаем ссылку в лог, чтобы
    // локальная разработка/тестирование не блокировались отсутствием
    // настроенного Resend.
    console.warn(
      '[email] RESEND_API_KEY не задан — письмо не отправлено. ' +
      `Ссылка для сброса пароля (для локальной отладки): ${resetUrl}`
    );
    return;
  }

  await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Восстановление пароля WordFlow',
    html: `
      <p>Вы запросили восстановление пароля в WordFlow.</p>
      <p><a href="${resetUrl}">Придумать новый пароль</a></p>
      <p>Ссылка действительна 1 час. Если вы не запрашивали восстановление — просто проигнорируйте это письмо.</p>
    `
  });
}

module.exports = { sendPasswordResetEmail };
