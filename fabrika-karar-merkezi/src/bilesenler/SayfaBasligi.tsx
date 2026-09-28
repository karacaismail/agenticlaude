import type { ReactNode } from 'react';
import { Group, Text, Title } from '@mantine/core';

// Bütün sayfalarda aynı başlık düzeni: üst etiket, başlık, kısa açıklama, sağda eylemler.
export function SayfaBasligi({ ust, baslik, aciklama, sag }: { ust?: string; baslik: string; aciklama?: ReactNode; sag?: ReactNode }) {
  return (
    <header className="sayfa-basligi">
      <div className="sayfa-basligi-metin">
        {ust && <Text className="ust-yazi">{ust}</Text>}
        <Title order={1}>{baslik}</Title>
        {aciklama && <Text className="sayfa-aciklama">{aciklama}</Text>}
      </div>
      {sag && <Group gap="xs" className="sayfa-eylemler">{sag}</Group>}
    </header>
  );
}

export function Bolum({ baslik, aciklama, sag, children }: { baslik: string; aciklama?: ReactNode; sag?: ReactNode; children: ReactNode }) {
  return (
    <section className="bolum">
      <Group justify="space-between" align="flex-end" mb="sm" wrap="wrap" gap="xs">
        <div>
          <Title order={2} className="bolum-baslik">{baslik}</Title>
          {aciklama && <Text size="sm" c="dimmed" maw={760}>{aciklama}</Text>}
        </div>
        {sag}
      </Group>
      {children}
    </section>
  );
}
