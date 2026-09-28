import { Badge, Button, Drawer, Modal, Paper, Tooltip, createTheme, rem } from '@mantine/core';

// Grafik paleti: veri görselleştirme rehberinin doğrulanmış varsayılanı (sıra değiştirilmez).
export const KATEGORIK = {
  light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#4a3aa7', '#e34948'],
  dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};
// Tek renk sıralı ölçek (mavi, açık → koyu). Karanlık modda ters kullanılır.
export const SIRALI = ['#cde2fb', '#b7d3f6', '#9ec5f4', '#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf', '#1c5cab', '#184f95', '#104281', '#0d366b'];
// Sıralı kategoriler (öncelik, önem) için: yüzeye en yakın adım bile 2:1 kontrastı geçer.
export const SIRALI_KADEME = { light: ['#86b6ef', '#3987e5', '#1c5cab', '#0d366b'], dark: ['#184f95', '#2a78d6', '#6da7ec', '#b7d3f6'] };
export const DURUM_RENK = { iyi: '#0ca30c', uyari: '#fab219', ciddi: '#ec835a', kritik: '#d03b3b' };
export const GRAFIK = {
  light: { yuzey: '#fcfcfb', metin: '#0b0b0b', ikincil: '#52514e', soluk: '#898781', izgara: '#e1e0d9', eksen: '#c3c2b7', notr: '#c3c2b7' },
  dark: { yuzey: '#1a1a19', metin: '#ffffff', ikincil: '#c3c2b7', soluk: '#898781', izgara: '#2c2c2a', eksen: '#383835', notr: '#52514e' },
};
export type GrafikTema = typeof GRAFIK.light & { seri: string[]; kademe: string[]; sirali: string[] };
export const grafikTemasi = (koyu: boolean): GrafikTema => ({
  ...(koyu ? GRAFIK.dark : GRAFIK.light),
  seri: koyu ? KATEGORIK.dark : KATEGORIK.light,
  kademe: koyu ? SIRALI_KADEME.dark : SIRALI_KADEME.light,
  sirali: koyu ? [...SIRALI].reverse() : SIRALI,
});

// Diyagram rolleri (aktör türü): renk + şekil + etiket birlikte taşır, yalnız renge dayanmaz.
export const AKTOR_RENK = {
  insan: { dolgu: '#fff4e6', kenar: '#e8590c', ad: 'İnsan' },
  ajan: { dolgu: '#f3f0ff', kenar: '#6741d9', ad: 'Ajan' },
  deterministik: { dolgu: '#e7f5ff', kenar: '#1c7ed6', ad: 'Deterministik (yapay zekâ yok)' },
  olay: { dolgu: '#e6fcf5', kenar: '#0ca678', ad: 'Olay' },
  karma: { dolgu: '#f8f9fa', kenar: '#495057', ad: 'Karma' },
};

export const tema = createTheme({
  primaryColor: 'indigo',
  primaryShade: { light: 6, dark: 5 },
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  fontSizes: { xs: rem(12), sm: rem(13.5), md: rem(15), lg: rem(17), xl: rem(19) },
  lineHeights: { xs: '1.45', sm: '1.5', md: '1.55', lg: '1.55', xl: '1.5' },
  radius: { xs: rem(4), sm: rem(6), md: rem(10), lg: rem(14), xl: rem(20) },
  defaultRadius: 'md',
  shadows: {
    xs: '0 1px 2px rgba(15, 23, 42, 0.05)',
    sm: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)',
    md: '0 8px 20px rgba(15, 23, 42, 0.08)',
    lg: '0 16px 36px rgba(15, 23, 42, 0.12)',
    xl: '0 24px 48px rgba(15, 23, 42, 0.16)',
  },
  headings: {
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    fontWeight: '680',
    sizes: {
      h1: { fontSize: rem(30), lineHeight: '1.2' },
      h2: { fontSize: rem(23), lineHeight: '1.25' },
      h3: { fontSize: rem(18), lineHeight: '1.3' },
      h4: { fontSize: rem(15.5), lineHeight: '1.35' },
    },
  },
  components: {
    Paper: Paper.extend({ defaultProps: { radius: 'lg' } }),
    Badge: Badge.extend({ defaultProps: { radius: 'sm', tt: 'none', fw: 600 } }),
    Button: Button.extend({ defaultProps: { radius: 'md' } }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true, openDelay: 250, multiline: true, maw: 320 } }),
    Drawer: Drawer.extend({ defaultProps: { radius: 'lg', overlayProps: { backgroundOpacity: 0.35, blur: 2 } } }),
    Modal: Modal.extend({ defaultProps: { radius: 'lg', overlayProps: { backgroundOpacity: 0.35, blur: 2 } } }),
  },
});


// Rengi beyazla karıştırıp açık ton üretir (küme zeminleri için).
export function acikTon(hex: string, oran = 0.88): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  const m = (c: number) => Math.round(c + (255 - c) * oran).toString(16).padStart(2, '0');
  return `#${m(r)}${m(g)}${m(b)}`;
}
