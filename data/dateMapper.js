function toIsoDate(value) {
  if (!value) return null;
  const text = String(value);
  return text.includes('T') ? text : `${text.replace(' ', 'T')}Z`;
}

module.exports = { toIsoDate };
