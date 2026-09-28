import mermaid from 'mermaid';

let hazir = false;
function baslat() {
  if (hazir) return;
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    themeVariables: {
      fontSize: '14px',
      primaryColor: '#f8f9fa',
      primaryBorderColor: '#868e96',
      primaryTextColor: '#0b0b0b',
      lineColor: '#868e96',
      textColor: '#0b0b0b',
      clusterBkg: '#fcfcfb',
      clusterBorder: '#c3c2b7',
      edgeLabelBackground: '#ffffff',
      noteBkgColor: '#fff3a3',
      noteBorderColor: '#c9a400',
      actorBkg: '#f3f0ff',
      actorBorder: '#6741d9',
      signalColor: '#495057',
      labelBoxBkgColor: '#f8f9fa',
    },
    flowchart: { htmlLabels: true, curve: 'basis', padding: 10, nodeSpacing: 28, rankSpacing: 38, useMaxWidth: true, wrappingWidth: 240, subGraphTitleMargin: { top: 6, bottom: 14 } },
    sequence: { useMaxWidth: true, wrap: true, actorMargin: 36, messageMargin: 28, mirrorActors: false },
    state: { useMaxWidth: true },
    mindmap: { useMaxWidth: true, padding: 12 },
  });
  hazir = true;
}

let sayac = 0;
export async function ciz(kod: string): Promise<string> {
  baslat();
  const id = `mmd-${Date.now().toString(36)}-${sayac++}`;
  const { svg } = await mermaid.render(id, kod);
  return svg;
}

export { temizle } from './metin';
