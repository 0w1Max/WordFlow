import { navigate } from "../core/router.js";
import { checkAuth, post } from "../core/api.js";
import { escapeHtml, brandMark, compassIcon } from "../core/dom.js";
import { initScrollReveal } from "../core/scrollReveal.js";

export async function renderLanding() {
  const app = document.getElementById("app");

  // Если сессия уже есть (обычный или гостевой аккаунт) — незачем показывать
  // рекламную страницу повторно, сразу ведём в приложение.
  const user = await checkAuth();
  if (user) {
    navigate("/dashboard");
    return;
  }

  // Страница построена не по компонентам, а по впечатлению: тёмная
  // обложка (история) → яркая полоса с огромной карточкой (демонстрация)
  // → тёмная акцентная полоса (эмоция) → тихая строка доверия → финальный
  // призыв. Каждая полоса — свой тон, чтобы страница "дышала", а не
  // повторяла один и тот же бумажный фон блок за блоком.
  app.innerHTML = `
    <div class="hero-cover">
      <div class="hero-cover-stamp">${compassIcon(420)}</div>
      <div class="landing-wrap">
        <nav class="landing-nav">
          ${brandMark()}
          <div class="landing-nav-actions">
            <button id="navLogin" class="btn-text">Войти</button>
          </div>
        </nav>

        <section class="hero">
          <h1 class="hero-headline">Есть слова,<br>которые хочется<br>сохранить.</h1>
          <p class="hero-sub">Редкие. Точные. Ваши. WordFlow помогает им остаться — а не потеряться в блокноте и забыться через неделю.</p>

          <div id="heroError"></div>

          <div class="hero-actions">
            <button id="tryFreeBtn" class="btn btn-primary">Начать бесплатно</button>
            <button id="heroRegister" class="btn-text">Уже пользуюсь — войти</button>
          </div>
          <p class="hero-note">Без карты. Без подтверждения по почте. Начнёте через несколько секунд.</p>
        </section>
      </div>
    </div>

    <section class="band-bright">
      <div class="landing-wrap">
        <p class="catalog-caption">Так может выглядеть слово в вашей коллекции</p>
        <div class="catalog-card" data-reveal>
          <p class="catalog-card-label">Коллекция № 041</p>
          <p class="catalog-card-word">Петрикор</p>
          <p class="catalog-card-pos">существительное</p>
          <p class="catalog-card-meaning">Запах земли после первого дождя.</p>
          <p class="catalog-card-example">«После петрикора воздух в саду стал сладким».</p>
          <div class="catalog-card-meta">
            <div>
              <span class="catalog-card-meta-label">Коллекция</span>
              <span class="catalog-card-meta-value">Из путешествий</span>
            </div>
            <div>
              <span class="catalog-card-meta-label">Добавлено</span>
              <span class="catalog-card-meta-value">12 марта 2026</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="band-accent">
      <div class="landing-wrap">
        <div class="editorial-quote" data-reveal>
          <p>Слова, которые остаются — <span>а не те, что забываются на следующий день.</span></p>
        </div>
      </div>
    </section>

    <section class="band-quiet">
      <div class="landing-wrap">
        <p class="trust-line" data-reveal>Без регистрации · Один cookie для входа · Ваш темп повторений</p>
      </div>
    </section>

    <section class="band-final">
      <div class="landing-wrap">
        <div class="landing-footer-cta" data-reveal>
          <h2 class="headline">Слова стоят того, чтобы их сохранить.</h2>
          <div class="actions" style="justify-content: center;">
            <button id="footerTryFree" class="btn btn-primary">Начать бесплатно</button>
          </div>
        </div>
      </div>
    </section>

    <footer class="landing-footer">
      <div class="landing-wrap footer-wrap">
        <div class="footer-top">
          <div class="footer-brand">
            ${brandMark()}
            <p class="footer-tagline">Личный гербарий слов. Откройте страницу и продолжите с того места, где остановились.</p>
          </div>

          <div class="footer-links">
            <div class="footer-col">
              <p class="footer-col-title">Аккаунт</p>
              <a href="/login" data-spa-link>Вход</a>
              <a href="/register" data-spa-link>Регистрация</a>
            </div>
            <div class="footer-col">
              <p class="footer-col-title">Начать</p>
              <button id="footerFooterTryFree" class="footer-link-btn">Без регистрации</button>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} WordFlow</span>
          <span>Один cookie для входа. Никакой рекламы и слежки.</span>
        </div>
      </div>
    </footer>
  `;

  document.getElementById("navLogin").onclick = () => navigate("/login");
  document.getElementById("heroRegister").onclick = () => navigate("/login");

  const startTrial = async (btn) => {
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Открываем…";
    document.getElementById("heroError").innerHTML = "";

    try {
      await post("/auth/guest");
      navigate("/dashboard");
    } catch (err) {
      btn.disabled = false;
      btn.textContent = original;
      document.getElementById("heroError").innerHTML =
        `<p class="error-banner">Не удалось начать пробную сессию: ${escapeHtml(err.message)}</p>`;
    }
  };

  document.getElementById("tryFreeBtn").onclick = (e) => startTrial(e.currentTarget);
  document.getElementById("footerTryFree").onclick = (e) => startTrial(e.currentTarget);
  document.getElementById("footerFooterTryFree").onclick = (e) => startTrial(e.currentTarget);

  initScrollReveal(app);
}
