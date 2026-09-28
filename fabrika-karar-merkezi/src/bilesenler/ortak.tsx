import { useEffect, useState } from 'react';
import { Badge, Tooltip } from '@mantine/core';
import { kuralBul } from '../veri/kurallar';

// Hash tabanlı sayfa gezinmesi: #/sayfa?anahtar=değer
export function useSayfa(): { sayfa: string; param: URLSearchParams; git: (s: string) => void } {
  const oku = () => {
    const [yol, sorgu] = window.location.hash.replace(/^#\/?/, '').split('?');
    return { sayfa: yol || 'baslangic', param: new URLSearchParams(sorgu ?? '') };
  };
  const [d, setD] = useState(oku);
  useEffect(() => {
    const f = () => { setD(oku()); window.scrollTo({ top: 0 }); };
    window.addEventListener('hashchange', f);
    return () => window.removeEventListener('hashchange', f);
  }, []);
  return { ...d, git: (s: string) => { window.location.hash = `/${s}`; } };
}

export function indir(dosya: string, icerik: string, tur = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([icerik], { type: tur }));
  const a = document.createElement('a');
  a.href = url; a.download = dosya;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function KuralRozeti({ id, aktif, onClick }: { id: string; aktif: boolean; onClick?: () => void }) {
  const k = kuralBul(id);
  return (
    <Tooltip label={k ? `${k.baslik} · ${aktif ? 'açık' : 'kapalı'}` : id} withArrow>
      <Badge variant={aktif ? 'light' : 'outline'} color={aktif ? 'teal' : 'red'} style={{ cursor: onClick ? 'pointer' : undefined }} onClick={onClick} tt="none">
        {aktif ? '✓' : '✗'} {id}
      </Badge>
    </Tooltip>
  );
}

export const SEVIYE_RENK: Record<string, string> = { kritik: 'red', yuksek: 'orange', orta: 'yellow', dusuk: 'green' };
export const SEVIYE_AD: Record<string, string> = { kritik: 'kritik', yuksek: 'yüksek', orta: 'orta', dusuk: 'düşük' };
export const HUKUM: Record<string, { ad: string; renk: string }> = {
  kullan: { ad: 'Önerilen', renk: 'teal' }, aday: { ad: 'Aday', renk: 'blue' }, sinirli: { ad: 'Sınırlı rol', renk: 'yellow' },
  kullanma: { ad: 'Önerilmez', renk: 'red' }, disi: { ad: 'Bu hat için gereksiz', renk: 'gray' },
};
