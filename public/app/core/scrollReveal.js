// Плавное появление секций при прокрутке — используется только на лендинге.
// Элементы помечаются атрибутом data-reveal в разметке; здесь достаточно
// один раз вызвать initScrollReveal() после того, как разметка вставлена в DOM.
export function initScrollReveal(root = document) {
  const items = root.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
