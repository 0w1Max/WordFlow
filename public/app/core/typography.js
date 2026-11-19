import { escapeHtml } from './html.js';

export const ACCENTABLE_LETTERS = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ';

const RU_VOWELS = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ';
const RU_NEVER_START_LINE = 'ьъйЬЪЙ';
export function findHyphenationBreakpoints(text) {
  const vowelIndexes = [];
  for (let i = 0; i < text.length; i++) {
    if (RU_VOWELS.includes(text[i])) vowelIndexes.push(i);
  }
  if (vowelIndexes.length < 2) return [];

  const breakpoints = [];

  for (let k = 0; k < vowelIndexes.length - 1; k++) {
    const vowelA = vowelIndexes[k];
    const vowelB = vowelIndexes[k + 1];
    const consonantsBetween = vowelB - vowelA - 1;
    let index = consonantsBetween <= 1 ? vowelA : vowelA + 1;
    while (index + 1 < text.length && RU_NEVER_START_LINE.includes(text[index + 1])) {
      index += 1;
    }

    const breakPosition = index + 1; // вставляем перенос ПЕРЕД этим индексом

    if (breakPosition >= 2 && text.length - breakPosition >= 2) {
      breakpoints.push(breakPosition);
    }
  }

  return [...new Set(breakpoints)].sort((a, b) => a - b);
}
export function hyphenateRu(text) {
  if (!text || text.length < 6) return text;

  const breakpoints = findHyphenationBreakpoints(text);
  if (breakpoints.length === 0) return text;

  let result = '';
  let last = 0;
  for (const breakPosition of breakpoints) {
    result += text.slice(last, breakPosition) + '\u00AD';
    last = breakPosition;
  }
  result += text.slice(last);

  return result;
}
export function wordWithAccentHtml(text, accentIndex) {
  if (
    accentIndex === null ||
    accentIndex === undefined ||
    accentIndex < 0 ||
    accentIndex >= text.length
  ) {
    return escapeHtml(hyphenateRu(text));
  }
  // Compute syllables before wrapping the accent; keep its neighbours in one nowrap unit.
  const rawBreakpoints = text.length < 6 ? [] : findHyphenationBreakpoints(text);
  const breakpoints = rawBreakpoints.filter((bp) => bp !== accentIndex && bp !== accentIndex + 1);

  let hyphenated = '';
  let lastCut = 0;
  let shiftedAccentIndex = accentIndex;
  for (const bp of breakpoints) {
    hyphenated += text.slice(lastCut, bp) + '\u00AD';
    if (bp <= accentIndex) shiftedAccentIndex += 1;
    lastCut = bp;
  }
  hyphenated += text.slice(lastCut);

  const before = hyphenated.slice(0, shiftedAccentIndex);
  const letter = hyphenated[shiftedAccentIndex];
  const after = hyphenated.slice(shiftedAccentIndex + 1);
  const lastOfBefore = before.slice(-1);
  const restOfBefore = before.slice(0, -1);
  const firstOfAfter = after.slice(0, 1);
  const restOfAfter = after.slice(1);

  return (
    `${escapeHtml(restOfBefore)}` +
    `<span class="accent-mark-unit">${escapeHtml(lastOfBefore)}<span class="accent-mark">${escapeHtml(letter)}</span>${escapeHtml(firstOfAfter)}</span>` +
    `${escapeHtml(restOfAfter)}`
  );
}
export function accentPickerHtml(text, accentIndex) {
  if (!text) {
    return `<p class="accent-picker-hint">Начните вводить слово, чтобы отметить ударение</p>`;
  }

  let offset = 0;
  const letters = [...text]
    .map((char) => {
      const i = offset;
      offset += char.length;
      const isVowel = ACCENTABLE_LETTERS.includes(char);
      const isSelected = i === accentIndex;

      if (!isVowel) {
        return `<span class="accent-picker-letter is-inert">${escapeHtml(char)}</span>`;
      }

      return `<button type="button" class="accent-picker-letter${isSelected ? ' is-selected' : ''}" data-index="${i}" aria-pressed="${isSelected}" aria-label="Отметить ударение на букве ${escapeHtml(char)}">${escapeHtml(char)}</button>`;
    })
    .join('');

  return `
    <p class="accent-picker-hint">Отметьте ударение — необязательно, но карточка будет понятнее</p>
    <div class="accent-picker">${letters}</div>
  `;
}
export function attachAccentPicker(containerEl, currentIndex, onSelect) {
  containerEl.querySelectorAll('.accent-picker-letter[data-index]').forEach((btn) => {
    btn.onclick = () => {
      const index = Number(btn.dataset.index);
      onSelect(index === currentIndex ? null : index);
    };
  });
}
