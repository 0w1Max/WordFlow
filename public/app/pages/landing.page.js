import { navigate } from "../core/router.js";
import { checkAuth, post } from "../core/api.js";
import { escapeHtml } from "../core/dom.js";

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
    <div class="landing-wrap">
      <nav class="landing-nav">
        <span class="masthead-mark">Wordflow</span>
        <div class="landing-nav-actions">
          <button id="navLogin" class="btn-text">Войти</button>
          <button id="navRegister" class="btn btn-ghost">Регистрация</button>
        </div>
      </nav>

      <section class="hero">
        <h1 class="hero-headline">
          Каждое слово, которое вы встретили, — это
          <span class="hl">экземпляр
            <svg class="hl-underline" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true">
              <path d="M2 9 C 40 2, 80 13, 120 6 S 180 2, 198 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
            </svg>
          </span>. Соберите его, пока не забыли.
        </h1>
        <p class="hero-sub">WordFlow — личный каталог слов и значений к ним с расписанием повторений, которое подстраивается под то, что вы уже помните.</p>

        <div id="heroError"></div>

        <div class="hero-actions">
          <button id="tryFreeBtn" class="btn btn-primary">Попробовать без регистрации</button>
          <button id="heroRegister" class="btn btn-ghost">Зарегистрироваться</button>
        </div>
        <p class="hero-note">Без карты и письма для подтверждения — начинаете сразу, данные сохранятся в этом браузере.</p>
      </section>

      <section class="showcase reveal">
        <div class="specimen-board">
          <div class="specimen pinned" data-strength="new" style="--tilt: -4deg;" aria-hidden="true">
            <div class="specimen-bar"></div>
            <div class="specimen-body">
              <div class="specimen-eyebrow"><span>Философия</span><span>·</span><span>0× повторено</span></div>
              <p class="specimen-word">Эфемерный</p>
              <p class="specimen-meaning">недолговечный, быстро исчезающий</p>
              <p class="specimen-example">«Красота эфемерна, но память о ней — нет».</p>
            </div>
          </div>

          <div class="specimen pinned" data-strength="learning" style="--tilt: 2.5deg;" aria-hidden="true">
            <div class="specimen-bar"></div>
            <div class="specimen-body">
              <div class="specimen-eyebrow"><span>Природа</span><span>·</span><span>2× повторено</span></div>
              <p class="specimen-word">Петрикор</p>
              <p class="specimen-meaning">запах земли после первого дождя</p>
              <p class="specimen-example">«После петрикора воздух в саду стал сладким».</p>
            </div>
          </div>

          <div class="specimen pinned" data-strength="known" style="--tilt: -1.5deg;" aria-hidden="true">
            <div class="specimen-bar"></div>
            <div class="specimen-body">
              <div class="specimen-eyebrow"><span>Английский</span><span>·</span><span>6× повторено</span></div>
              <p class="specimen-word">Serendipity</p>
              <p class="specimen-meaning">удачная случайность, счастливая находка</p>
              <p class="specimen-example">«Их встреча была чистой serendipity».</p>
            </div>
          </div>
        </div>
      </section>

      <section class="steps">
        <div class="step reveal" style="transition-delay: 0ms;">
          <p class="step-number">01</p>
          <h3 class="step-title">Добавьте слово</h3>
          <p class="step-text">Слово, значение, пример — и категория, если нужно.</p>
        </div>
        <div class="step reveal" style="transition-delay: 90ms;">
          <p class="step-number">02</p>
          <h3 class="step-title">Дайте ему отстояться</h3>
          <p class="step-text">Каждое слово получает своё расписание повторений — по алгоритму, похожему на Anki.</p>
        </div>
        <div class="step reveal" style="transition-delay: 180ms;">
          <p class="step-number">03</p>
          <h3 class="step-title">Повторите, когда пора</h3>
          <p class="step-text">Приложение само подскажет, что пора повторить — не раньше и не позже.</p>
        </div>
      </section>

      <section class="value-grid">
        <div class="reveal" style="transition-delay: 0ms;">
          <p class="value-eyebrow">Без регистрации</p>
          <p class="value-text">Попробуйте прямо сейчас, зарегистрируетесь позже — все слова останутся на месте.</p>
        </div>
        <div class="reveal" style="transition-delay: 90ms;">
          <p class="value-eyebrow">Один cookie</p>
          <p class="value-text">Только для входа. Никакой рекламы и слежки за вами.</p>
        </div>
        <div class="reveal" style="transition-delay: 180ms;">
          <p class="value-eyebrow">Ваш темп</p>
          <p class="value-text">Расписание повторений подстраивается под то, что вы уже помните.</p>
        </div>
      </section>

      <section class="landing-footer-cta reveal">
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

  setupScrollReveal(app);
}

// Лёгкое появление секций при прокрутке — только если браузер это умеет
// и пользователь не просил отключить анимации (prefers-reduced-motion).
function setupScrollReveal(app) {
  const items = app.querySelectorAll(".reveal");

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || prefersReduced) {
    items.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => observer.observe(el));
}
