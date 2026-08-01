import { navigate } from "../core/router.js";
import { checkAuth, post } from "../core/api.js";
import { escapeHtml, brandMark } from "../core/dom.js";
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

  // ВАЖНО: цифры в превью dashboard'а ниже — иллюстративный пример (как и
  // слово "Петрикор" в карточке), а не случайные красивые числа. Они
  // намеренно ограничены тем, что приложение реально умеет считать сейчас
  // (слова, категории, к повторению) — без выдуманных метрик вроде
  // "% запоминания" или "серии дней", которых в продукте нет.
  app.innerHTML = `
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
          <p class="hero-eyebrow">Ваш личный архив слов</p>
          <h1 class="hero-headline">Сохраняйте слова, которые хочется помнить.</h1>
          <p class="hero-sub">WordFlow — личный каталог слов и значений к ним с расписанием повторений, которое подстраивается под то, что вы уже помните. Приложение напомнит о слове именно тогда, когда повторение действительно поможет его запомнить.</p>

          <div id="heroError"></div>

          <div class="hero-actions">
            <button id="tryFreeBtn" class="btn btn-primary">Начать бесплатно →</button>
            <button id="howItWorksBtn" class="btn btn-ghost">Как это работает</button>
          </div>
          <p class="hero-register-note">Регистрация — тоже бесплатно: <a href="/register" data-spa-link id="heroRegisterLink">зарегистрируйтесь</a>, чтобы слова остались с вами на любом устройстве.</p>

          <div class="trust-row">
            <div class="trust-item">
              <span class="trust-item-icon">${lockIcon()}</span>
              <div>
                <p class="trust-item-title">Без регистрации</p>
                <p class="trust-item-sub">Начните за 10 секунд</p>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-item-icon">${shieldIcon()}</span>
              <div>
                <p class="trust-item-title">Без рекламы</p>
                <p class="trust-item-sub">Никакого лишнего</p>
              </div>
            </div>
            <div class="trust-item">
              <span class="trust-item-icon">${clockIcon()}</span>
              <div>
                <p class="trust-item-title">Ваш темп</p>
                <p class="trust-item-sub">Расписание под вас</p>
              </div>
            </div>
          </div>
        </section>

        <div class="card-stack" data-reveal>
          <div class="mini-card mini-card-1" data-strength="new">
            <p class="mini-card-label">№ 014</p>
            <p class="mini-card-word">Сериндипность</p>
            <p class="mini-card-meaning">случайная удачная находка</p>
          </div>
          <div class="mini-card mini-card-2" data-strength="learning">
            <p class="mini-card-label">№ 041</p>
            <p class="mini-card-word">Петрикор</p>
            <p class="mini-card-meaning">запах земли после первого дождя</p>
          </div>
          <div class="mini-card mini-card-3" data-strength="known">
            <p class="mini-card-label">№ 128</p>
            <p class="mini-card-word">Апломб</p>
            <p class="mini-card-meaning">самоуверенная манера держаться</p>
          </div>
        </div>
      </div>
    </div>

    <section class="band-dark" id="how-it-works">
      <div class="landing-wrap">
        <p class="band-eyebrow">Простой процесс</p>
        <h2 class="headline">Три шага к прочным знаниям</h2>
        <p class="band-sub">Спокойно и эффективно. Без стресса и зубрёжки.</p>

        <div class="steps">
          <div class="step" data-reveal style="transition-delay: 0ms;">
            <div class="step-icon">${findIcon()}</div>
            <p class="step-number">01</p>
            <h3 class="step-title">Найдите слово</h3>
            <p class="step-text">Необычное, красивое или давно забытое — добавьте его в свой словарь.</p>
          </div>
          <div class="step" data-reveal style="transition-delay: 90ms;">
            <div class="step-icon">${addIcon()}</div>
            <p class="step-number">02</p>
            <h3 class="step-title">Сохраните</h3>
            <p class="step-text">Значение, пример и заметки. Создайте карточку, к которой захочется вернуться.</p>
          </div>
          <div class="step" data-reveal style="transition-delay: 180ms;">
            <div class="step-icon">${reviewIcon()}</div>
            <p class="step-number">03</p>
            <h3 class="step-title">Встретьтесь снова</h3>
            <p class="step-text">WordFlow напомнит о слове именно тогда, когда повторение действительно поможет его запомнить.</p>
          </div>
        </div>
      </div>
    </section>

    <div class="landing-wrap">
      <div class="editorial-quote" data-reveal>
        <p>Слова, которые остаются — <span>а не те, что забываются на следующий день.</span></p>
      </div>
    </div>

    <section class="progress-section" id="features">
      <div class="landing-wrap">
        <div class="progress-grid">
          <div class="progress-text" data-reveal>
            <p class="hero-eyebrow">Ваш прогресс</p>
            <h2 class="headline">Видите результат. Чувствуете уверенность.</h2>
            <p class="hero-sub">Каждое собранное слово, каждая категория, каждое повторение — часть одной растущей коллекции.</p>

            <div class="stat-row">
              <div>
                <div class="stat-item-icon">${bookIconSvg()}</div>
                <span class="stat-item-number">1 248</span>
                <span class="stat-item-label">слов в коллекции</span>
              </div>
              <div>
                <div class="stat-item-icon">${folderIcon()}</div>
                <span class="stat-item-number">14</span>
                <span class="stat-item-label">категорий</span>
              </div>
              <div>
                <div class="stat-item-icon">${targetIcon()}</div>
                <span class="stat-item-number">12</span>
                <span class="stat-item-label">к повторению сегодня</span>
              </div>
              <div>
                <div class="stat-item-icon">${refreshIcon()}</div>
                <span class="stat-item-number">4 302</span>
                <span class="stat-item-label">повторений всего</span>
              </div>
            </div>
          </div>

          <div data-reveal>
            <div class="dashboard-preview" aria-hidden="true">
              <div class="dashboard-preview-top">
                <span class="dashboard-preview-greeting">Добрый день</span>
                <span class="masthead-mark" style="pointer-events: none;">WordFlow</span>
              </div>
              <div class="dashboard-preview-stats">
                <div class="dashboard-preview-stat is-primary">
                  <span class="dashboard-preview-stat-number">12</span>
                  <span class="dashboard-preview-stat-label">К повторению сегодня</span>
                </div>
                <div class="dashboard-preview-stat is-secondary">
                  <span class="dashboard-preview-stat-number">1 248</span>
                  <span class="dashboard-preview-stat-label">Всего в коллекции</span>
                </div>
              </div>
              <div class="dashboard-preview-list">
                <p class="dashboard-preview-list-title">Недавно собрано</p>
                <div class="dashboard-preview-row">
                  <span class="dashboard-preview-row-word">luminous</span>
                  <span class="dashboard-preview-row-meaning">светящийся, лучистый</span>
                </div>
                <div class="dashboard-preview-row">
                  <span class="dashboard-preview-row-word">ephemeral</span>
                  <span class="dashboard-preview-row-meaning">мимолётный</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="landing-wrap">
      <div class="final-cta-box" data-reveal>
        <h2 class="headline">Начните собирать слова, которые останутся с вами.</h2>
        <div class="final-cta-actions">
          <button id="footerTryFree" class="btn btn-primary">Начать бесплатно →</button>
          <p class="hero-note" style="margin: 0;">Без карты. Без подтверждения. Начните прямо сейчас.</p>
        </div>
      </div>

      <div class="account-benefits" data-reveal>
        <p class="account-benefits-title">Регистрация — тоже бесплатно. Она даёт больше:</p>
        <ul class="account-benefits-list">
          <li>Слова сохраняются навсегда, а не только в этом браузере</li>
          <li>Доступ с любого устройства — телефон, ноутбук, другой браузер</li>
          <li>Восстановление доступа по email, если забудете пароль</li>
        </ul>
        <button id="benefitsRegisterBtn" class="btn-text">Зарегистрироваться →</button>
      </div>
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
  document.getElementById("benefitsRegisterBtn").onclick = () => navigate("/register");

  document.getElementById("howItWorksBtn").onclick = () => {
    document.getElementById("how-it-works").scrollIntoView({ behavior: "smooth", block: "start" });
  };

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

function lockIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="9" rx="1.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
}

function shieldIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5 4 5.5v6c0 5 3.4 8.3 8 10 4.6-1.7 8-5 8-10v-6z"/></svg>`;
}

function clockIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3.2 2"/></svg>`;
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

function bookIconSvg() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5C6 3.3 9 3 12 4v16c-3-1-6-.7-8 .5z"/><path d="M12 4c2-1 5-1.3 8 0v16.5c-2-1.2-5-1.5-8-.5z"/></svg>`;
}

function folderIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h4l2 2.5h9A1.5 1.5 0 0 1 21 9v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z"/></svg>`;
}

function targetIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>`;
}

function refreshIcon() {
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11a9 9 0 0 1 15.3-5.8L21 8"/><path d="M21 3v5h-5"/><path d="M21 13a9 9 0 0 1-15.3 5.8L3 16"/><path d="M3 21v-5h5"/></svg>`;
}
