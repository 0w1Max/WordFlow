import { navigate } from "../core/router.js";
import { checkAuth, post } from "../core/api.js";
import { escapeHtml, brandMark, stampIcon } from "../core/dom.js";
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
      <div class="hero-cover-stamp">${stampIcon(420)}</div>
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
            <h1 class="hero-headline">Каждое слово, которое вы встретили, — <span class="headline-mark">экземпляр</span>. Соберите его, пока не забыли.</h1>
            <p class="hero-sub">WordFlow — личный каталог слов и значений к ним с расписанием повторений, которое подстраивается под то, что вы уже помните.</p>

            <div id="heroError"></div>

            <div class="hero-actions">
              <button id="tryFreeBtn" class="btn btn-primary">Попробовать без регистрации</button>
              <button id="heroRegister" class="btn btn-ghost">Зарегистрироваться</button>
            </div>
            <p class="hero-note">Без карты и письма для подтверждения — начинаете сразу, данные сохранятся в этом браузере.</p>
          </section>

          <section class="showcase">
            <div class="specimen showcase-card" data-strength="learning" aria-hidden="true">
              <div class="specimen-bar"></div>
              <div class="specimen-body">
                <div class="specimen-stamp">${stampIcon(30)}</div>
                <div class="specimen-eyebrow">
                  <span>Природа</span><span>·</span><span>Собрано 12 мар 2026</span>
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
      <section class="steps">
        <div class="step" data-reveal style="transition-delay: 0ms;">
          <div class="step-icon">${addIcon()}</div>
          <p class="step-number">01</p>
          <h3 class="step-title">Добавьте слово</h3>
          <p class="step-text">Слово, значение, пример — и категория, если нужно.</p>
        </div>
        <div class="step" data-reveal style="transition-delay: 90ms;">
          <div class="step-icon">${settleIcon()}</div>
          <p class="step-number">02</p>
          <h3 class="step-title">Дайте ему отстояться</h3>
          <p class="step-text">Каждое слово получает своё расписание повторений — по алгоритму, похожему на Anki.</p>
        </div>
        <div class="step" data-reveal style="transition-delay: 180ms;">
          <div class="step-icon">${reviewIcon()}</div>
          <p class="step-number">03</p>
          <h3 class="step-title">Повторите, когда пора</h3>
          <p class="step-text">Приложение само подскажет, что пора повторить — не раньше и не позже.</p>
        </div>
      </section>

      <section class="value-grid">
        <div data-reveal style="transition-delay: 0ms;">
          <p class="value-eyebrow">Без регистрации</p>
          <p class="value-text">Попробуйте прямо сейчас, зарегистрируетесь позже — все слова останутся на месте.</p>
        </div>
        <div data-reveal style="transition-delay: 90ms;">
          <p class="value-eyebrow">Один cookie</p>
          <p class="value-text">Только для входа. Никакой рекламы и слежки за вами.</p>
        </div>
        <div data-reveal style="transition-delay: 180ms;">
          <p class="value-eyebrow">Ваш темп</p>
          <p class="value-text">Расписание повторений подстраивается под то, что вы уже помните.</p>
        </div>
      </section>

      <section class="landing-footer-cta" data-reveal>
        <h2 class="headline">Начните собирать слова</h2>
        <div class="actions" style="justify-content: center;">
          <button id="footerTryFree" class="btn btn-primary">Попробовать бесплатно</button>
        </div>
      </section>
    </div>
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

function addIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`;
}

function settleIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c-4-1.5-7-4.5-7-9.5C5 7.5 8 4 12 2c4 2 7 5.5 7 9.5 0 5-3 8-7 9.5z"/><path d="M12 21V7"/></svg>`;
}

function reviewIcon() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
}
