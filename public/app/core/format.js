const MONTHS_GENITIVE = [
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек'
];
export function formatShortDate(isoString) {
  if (!isoString) return '';

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = MONTHS_GENITIVE[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}
export function progressDotsHtml(reviewCount, max = 5) {
  const filled = Math.min(reviewCount, max);

  return Array.from(
    { length: max },
    (_, i) => `<span class="${i < filled ? 'filled' : ''}"></span>`
  ).join('');
}

export function pluralizeRu(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
