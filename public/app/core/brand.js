function bookMarkIcon(size = 15) {
  return `<svg width="${size}" height="${size * 0.8}" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 3.4C8.1 1.9 5.4 1.2 1.6 1.6v11.8c3.8-.4 6.5.3 8.4 1.8V3.4z" fill="currentColor" opacity="0.5"/><path d="M10 3.4c1.9-1.5 4.6-2.2 8.4-1.8v11.8c-3.8-.4-6.5.3-8.4 1.8V3.4z" fill="currentColor"/></svg>`;
}
export function bookmarkIcon() {
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10a1 1 0 0 1 1 1v17l-6-4-6 4V4a1 1 0 0 1 1-1z"/></svg>`;
}

export function sproutIcon() {
  return `<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21V10"/><path d="M12 10C8 10 6 7 6 4c3 0 6 2 6 6z"/><path d="M12 13C16 13 18 10 18 7c-3 0-6 2-6 6z"/></svg>`;
}

export function stampIcon(size = 15) {
  return bookMarkIcon(size);
}
export function brandMark(variant = 'masthead') {
  const cls = variant === 'auth' ? 'auth-mark' : 'masthead-mark';
  return `<a href="/" class="${cls}" data-spa-link><span class="brand-icon">${bookMarkIcon()}</span>WordFlow</a>`;
}
