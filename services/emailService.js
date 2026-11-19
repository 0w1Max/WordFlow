const { Resend } = require('resend');
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
    if (process.env.NODE_ENV === 'production') throw new Error('Email delivery is not configured');
    console.warn(
      '[email] RESEND_API_KEY не задан — письмо не отправлено. ' +
        `Ссылка для сброса пароля (для локальной отладки): ${resetUrl}`
    );
    return;
  }

  const { error } = await client.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Восстановление пароля WordFlow',
    html: `
      <p>Вы запросили восстановление пароля в WordFlow.</p>
      <p><a href="${resetUrl}">Придумать новый пароль</a></p>
      <p>Ссылка действительна 1 час. Если вы не запрашивали восстановление — просто проигнорируйте это письмо.</p>
    `
  });
  if (error) throw new Error('Password reset email delivery failed');
}

module.exports = { sendPasswordResetEmail };
