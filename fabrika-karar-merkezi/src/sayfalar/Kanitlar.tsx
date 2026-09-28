import { useMemo, useState } from 'react';
import { Grid, Group, MultiSelect, Paper, SegmentedControl, Stack, Text, useComputedColorScheme } from '@mantine/core';
import { KANITLAR, KAYNAK_AD, ETIKET_AD, TUR_AD, TUR_ACIKLAMA, TUR_SIRA, type Kanit } from '../veri/kanit';
import { KanitListesi } from '../bilesenler/Kanit';
import { SayfaBasligi } from '../bilesenler/SayfaBasligi';
import { GrafikKarti } from '../bilesenler/GrafikKarti';
import { yatayCubuk } from '../grafik/secenekler';
import { grafikTemasi } from '../tema';
import { useSayfa } from '../bilesenler/ortak';

export function Kanitlar() {
  const { param } = useSayfa();
  const koyu = useComputedColorScheme('light') === 'dark';
  const g = grafikTemasi(koyu);
  const [etiketler, setEtiketler] = useState<string[]>(param.get('konu') ? [param.get('konu')!] : []);
  const [mod, setMod] = useState<'veya' | 've'>('veya');
  const [siralama, setSiralama] = useState<'onem' | 'yeni'>('onem');
  const liste = useMemo(() => {
    let l: Kanit[] = KANITLAR;
    if (etiketler.length) l = l.filter((k) => (mod === 'veya' ? etiketler.some((e) => k.etiket.includes(e)) : etiketler.every((e) => k.etiket.includes(e))));
    const s = [...l];
    if (siralama === 'yeni') s.sort((a, b) => String(b.tarih ?? '').localeCompare(String(a.tarih ?? '')));
    else s.sort((a, b) => TUR_SIRA.indexOf(a.tur) - TUR_SIRA.indexOf(b.tur) || String(b.tarih ?? '').localeCompare(String(a.tarih ?? '')));
    return s;
  }, [etiketler, mod, siralama]);
  const kaynakSayilari = useMemo(() => {
    const m: Record<string, number> = {};
    for (const k of liste) m[k.kod] = (m[k.kod] ?? 0) + 1;
    return Object.entries(m).sort((a, b) => b[1] - a[1]);
  }, [liste]);
  const etiketSecenek = Object.entries(ETIKET_AD).map(([value, label]) => ({ value, label: `${label} (${KANITLAR.filter((k) => k.etiket.includes(value)).length})` }));

  return (
    <Stack gap="lg" className="sayfa">
      <SayfaBasligi ust="Kanıt" baslik="Bulgular"
        aciklama={`Araştırma dosyalarından çıkarılan ${KANITLAR.length.toLocaleString('tr-TR')} kaynaklı ifade. Öneri, sentez ve hüküm alanları alınmadı; her kayıt bir olgu, ölçüm, vaka, hata kaydı ya da belge ifadesi.`} />
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder p="lg">
            <Stack gap="sm">
              <Group gap="sm" align="flex-end" wrap="wrap">
                <MultiSelect label="Konu" placeholder="Konu seç (boşsa hepsi)" data={etiketSecenek} value={etiketler} onChange={setEtiketler} searchable clearable w={420} maxDropdownHeight={320} />
                <SegmentedControl size="xs" value={mod} onChange={(v) => setMod(v as 'veya' | 've')} data={[{ label: 'Konulardan biri', value: 'veya' }, { label: 'Hepsi birden', value: 've' }]} />
                <SegmentedControl size="xs" value={siralama} onChange={(v) => setSiralama(v as 'onem' | 'yeni')} data={[{ label: 'Tür sırası', value: 'onem' }, { label: 'En yeni', value: 'yeni' }]} />
              </Group>
              <KanitListesi key={`${etiketler.join(',')}-${mod}-${siralama}`} liste={liste} adim={30} />
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md" style={{ position: 'sticky', top: 74 }}>
            <GrafikKarti baslik="Kaynak dosyaya göre" aciklama="Seçili konulardaki bulguların dağılımı." kaynak="scripts/kanit-uret.mjs"
              secenek={yatayCubuk(g, kaynakSayilari.map(([k]) => KAYNAK_AD[k] ?? k), kaynakSayilari.map(([, n]) => n), { etiketGenislik: 170 })}
              yukseklik={Math.max(200, kaynakSayilari.length * 22)}
              tablo={{ basliklar: ['Kaynak', 'Bulgu'], satirlar: kaynakSayilari.map(([k, n]) => [KAYNAK_AD[k] ?? k, n]) }} />
            <Paper withBorder p="md">
              <Text fw={650} mb={6}>Türler ne demek</Text>
              <Stack gap={4}>
                {TUR_SIRA.map((t) => <Text key={t} size="xs"><b>{TUR_AD[t]}:</b> <Text span c="dimmed" size="xs">{TUR_ACIKLAMA[t]}</Text></Text>)}
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
