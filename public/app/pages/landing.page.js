import { navigate } from "../core/router.js";
import { checkAuth, post } from "../core/api.js";
import { escapeHtml, brandMark, stampIcon, compassIcon } from "../core/dom.js";
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

  app.innerHTML = `
    <div class="hero-cover">
      <div class="hero-cover-stamp">${compassIcon(420)}</div>
      <div class="landing-wrap">
        <nav class="landing-nav">
          ${brandMark()}
          <div class="landing-nav-actions">
            <button id="navLogin" class="btn-text">Войти</button>
            <button id="navRegister" class="btn btn-ghost">Регистрация</button>
          </div>
        </nav>

        <div class="hero-grid">
          <section class="hero">
            <h1 class="hero-headline">Не учите больше слов.<br><span class="hl-accent">Запоминайте нужные.</span></h1>
            <p class="hero-sub">WordFlow — личный каталог слов, который напоминает о них ровно тогда, когда вы вот-вот готовы забыть.</p>

            <div id="heroError"></div>

            <div class="hero-actions">
              <button id="tryFreeBtn" class="btn btn-primary">Начать бесплатно</button>
              <button id="heroRegister" class="btn btn-ghost">Зарегистрироваться</button>
            </div>
            <p class="hero-note">Без карты. Без подтверждения по почте. Начнёте через несколько секунд.</p>
          </section>

          <section class="showcase">
            <div class="specimen showcase-card" data-strength="learning" aria-hidden="true">
              <div class="specimen-bar"></div>
              <div class="specimen-body">
                <div class="specimen-stamp">${stampIcon(30)}</div>
                <div class="specimen-eyebrow">
                  <span>Из путешествий</span><span>·</span><span>Собрано 12 мар 2026</span>
                </div>
                <p class="specimen-word">Петрикор</p>
                <p class="specimen-meaning">запах земли после первого дождя</p>
                <p class="specimen-example">«После петрикора воздух в саду стал сладким».</p>
                <div class="specimen-footer">
                  <div class="specimen-progress" aria-label="Изучено 3 из 5">
                    <span class="filled"></span><span class="filled"></span><span class="filled"></span><span></span><span></span>
                  </div>
                  <span class="meta-line" style="margin:0;">№ 041</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div class="landing-wrap">
      <section class="editorial-quote" data-reveal>
        <p>Слова, которые остаются — <span>а не те, что забываются на следующий день.</span></p>
      </section>

      <section class="steps">
        <div class="step" data-reveal style="transition-delay: 0ms;">
          <div class="step-spotlight" style="animation-delay: 0s;"></div>
          <div class="step-icon">${findIcon()}</div>
          <p class="step-number">01</p>
          <h3 class="step-title">Найдите слово</h3>
          <p class="step-text">Необычное. Красивое. Или давно забытое.</p>
        </div>
        <div class="step" data-reveal style="transition-delay: 90ms;">
          <div class="step-spotlight" style="animation-delay: 3s;"></div>
          <div class="step-icon">${addIcon()}</div>
          <p class="step-number">02</p>
          <h3 class="step-title">Сохраните его</h3>
          <p class="step-text">Со значением, контекстом и своими заметками.</p>
        </div>
        <div class="step" data-reveal style="transition-delay: 180ms;">
          <div class="step-spotlight" style="animation-delay: 6s;"></div>
          <div class="step-icon">${reviewIcon()}</div>
          <p class="step-number">03</p>
          <h3 class="step-title">Встретьтесь снова</h3>
          <p class="step-text">WordFlow сам напомнит о слове тогда, когда повторение действительно поможет его запомнить.</p>
        </div>
      </section>

      <section class="value-grid">
        <div data-reveal style="transition-delay: 0ms;">
          <p class="value-eyebrow">Без регистрации</p>
          <p class="value-text">Попробуйте прямо сейчас, зарегистрируетесь позже — все слова останутся на месте.</p>
        </div>
        <div data-reveal style="transition-delay: 90ms;">
          <p class="value-eyebrow">Никакой рекламы</p>
          <p class="value-text">Мы не следим за вами и ничего не продаём вашему вниманию — всего один cookie, чтобы не выходить из аккаунта.</p>
        </div>
        <div data-reveal style="transition-delay: 180ms;">
          <p class="value-eyebrow">Ваш темп</p>
          <p class="value-text">Расписание повторений подстраивается под то, что вы уже помните.</p>
        </div>
      </section>

      <section class="landing-footer-cta" data-reveal>
        <h2 class="headline">Слова стоят того, чтобы их сохранить.</h2>
        <div class="actions" style="justify-content: center;">
          <button id="footerTryFree" class="btn btn-primary">Начать бесплатно</button>
        </div>
      </section>
    </div>

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
  document.getElementById("navRegister").onclick = () => navigate("/register");
  document.getElementById("heroRegister").onclick = () => navigate("/register");

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

  // flip-in — чистый CSS @keyframes (см. styles.css), стартует сам при
  // отрисовке, без JS-таймеров. После её завершения снимаем инлайновую
  // анимацию, чтобы hover (translateY при наведении) мог спокойно менять
  // transform — иначе animation-fill-mode:both держал бы своё значение.
  app.querySelectorAll(".showcase-card").forEach(card => {
    card.addEventListener("animationend", () => {
      card.style.animation = "none";
    }, { once: true });
  });

  initScrollReveal(app);
}

function findIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg>`;
}

function addIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
}

function reviewIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
}
