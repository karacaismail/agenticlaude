// Mermaid etiketleri için güvenli metin (mermaid paketine bağımlı değil).
export const temizle = (s: string) =>
  String(s)
    .replace(/"/g, '”')
    .replace(/`/g, '\'')
    .replace(/#/g, 'no. ')
    .replace(/</g, '‹')
    .replace(/>/g, '›')
    .replace(/&/g, '+')
    .replace(/[{}]/g, '')
    .replace(/\|/g, '/');
