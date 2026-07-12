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
        <h1 class="hero-headline">Каждое слово, которое вы встретили, — экземпляр. Соберите его, пока не забыли.</h1>
        <p class="hero-sub">WordFlow — личный каталог слов и понятий с расписанием повторений, которое подстраивается под то, что вы уже помните.</p>

        <div id="heroError"></div>

        <div class="hero-actions">
          <button id="tryFreeBtn" class="btn btn-primary">Попробовать без регистрации</button>
          <button id="heroRegister" class="btn btn-ghost">Зарегистрироваться</button>
        </div>
        <p class="hero-note">Без карты и письма для подтверждения — начинаете сразу, данные сохранятся в этом браузере.</p>
      </section>

      <section class="showcase">
        <div class="specimen" data-strength="learning" aria-hidden="true">
          <div class="specimen-bar"></div>
          <div class="specimen-body">
            <div class="specimen-eyebrow">
              <span>Природа</span><span>·</span><span>2× повторено</span>
            </div>
            <p class="specimen-word">Петрикор</p>
            <p class="specimen-meaning">запах земли после первого дождя</p>
            <p class="specimen-example">«После петрикора воздух в саду стал сладким».</p>
          </div>
        </div>
      </section>

      <section class="steps">
        <div class="step">
          <p class="step-number">01</p>
          <h3 class="step-title">Добавьте слово</h3>
          <p class="step-text">Слово, значение, пример — и категория, если нужно.</p>
        </div>
        <div class="step">
          <p class="step-number">02</p>
          <h3 class="step-title">Дайте ему отстояться</h3>
          <p class="step-text">Каждое слово получает своё расписание повторений — по алгоритму, похожему на Anki.</p>
        </div>
        <div class="step">
          <p class="step-number">03</p>
          <h3 class="step-title">Повторите, когда пора</h3>
          <p class="step-text">Приложение само подскажет, что пора повторить — не раньше и не позже.</p>
        </div>
      </section>

      <section class="value-grid">
        <div>
          <p class="value-eyebrow">Без регистрации</p>
          <p class="value-text">Попробуйте прямо сейчас, зарегистрируетесь позже — все слова останутся на месте.</p>
        </div>
        <div>
          <p class="value-eyebrow">Один cookie</p>
          <p class="value-text">Только для входа. Никакой рекламы и слежки за вами.</p>
        </div>
        <div>
          <p class="value-eyebrow">Ваш темп</p>
          <p class="value-text">Расписание повторений подстраивается под то, что вы уже помните.</p>
        </div>
      </section>

      <section class="landing-footer-cta">
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
}
