import { useEffect, useMemo, useState } from 'react';
import { Accordion, Anchor, Badge, Button, Checkbox, Collapse, Group, NumberInput, Paper, Radio, SegmentedControl, Stack, Switch, Text, TextInput, UnstyledButton } from '@mantine/core';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { sorunBul, KAYNAK_ADI } from '../veri/sorunlar';
import type { EcaKural, Kontrol } from '../veri/tipler';
import { KURALLAR } from '../veri/kurallar';
import { ASAMALAR, BOLUMLER } from '../veri/asamalar';
import { useDurum } from '../durum/depo';
import { useTuretilen } from '../durum/kanca';
import { useSayfa } from './ortak';

const FAZ_RENK = ['teal', 'blue', 'grape', 'orange'];

function KontrolAlani({ k, c, pasif }: { k: EcaKural; c: Kontrol; pasif: boolean }) {
  const { durum, gonder } = useDurum();
  const v = durum.kurallar[k.id].degerler[c.id];
  const ata = (deger: number | string | string[]) => gonder({ tur: 'kuralDeger', id: k.id, kontrol: c.id, deger });
  if (c.tur === 'sayi')
    return (
      <NumberInput size="xs" w={220} label={c.etiket} value={Number(v)} min={c.min} max={c.max} step={c.adim ?? 1} suffix={c.birim ? ` ${c.birim}` : undefined}
        onChange={(x) => ata(typeof x === 'number' ? x : Number(x) || c.min)} disabled={pasif} clampBehavior="strict" />
    );
  if (c.tur === 'radyo')
    return (
      <Radio.Group size="xs" label={c.etiket} value={String(v)} onChange={ata}>
        <Group gap="md" mt={4}>{c.secenekler.map((s) => <Radio key={s.deger} value={s.deger} label={s.etiket} disabled={pasif} />)}</Group>
      </Radio.Group>
    );
  return (
    <Checkbox.Group size="xs" label={c.etiket} value={(v as string[]) ?? []} onChange={ata}>
      <Group gap="md" mt={4}>{c.secenekler.map((s) => <Checkbox key={s.deger} value={s.deger} label={s.etiket} disabled={pasif} />)}</Group>
    </Checkbox.Group>
  );
}

function DayanakBulgular({ k }: { k: EcaKural }) {
  const [acik, setAcik] = useState(false);
  const { git } = useSayfa();
  const liste = k.onler.map((id) => sorunBul(id)).filter((x): x is NonNullable<typeof x> => !!x);
  return (
    <div className="dayanak">
      <UnstyledButton onClick={() => setAcik((x) => !x)} className="olgu-ac">
        <Group gap={6}>
          <IconChevronDown size={14} style={{ transform: acik ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }} />
          <Text size="xs" fw={700}>Dayanak bulgular ({liste.length})</Text>
          <Text size="xs" c="dimmed">bu kuralın bağlandığı gerçek kayıtlar ve öngörüler</Text>
        </Group>
      </UnstyledButton>
      <Collapse in={acik}>
        <Stack gap={8} mt={8}>
          {liste.map((s) => (
            <div key={s.id} className="dayanak-ogesi">
              <Group gap={6} mb={2}>
                <Badge size="xs" variant="default" style={{ cursor: 'pointer' }} onClick={() => git(`sorunlar?id=${s.id}`)}>{s.id}</Badge>
                <Text size="xs" c="dimmed">{KAYNAK_ADI[s.kaynak]}</Text>
              </Group>
              <Text size="sm" fw={600}>{s.baslik}</Text>
              <Text size="xs" c="dimmed" lineClamp={3}>{s.ozet}</Text>
              {s.kayitlar?.[0]?.url && <Anchor size="xs" href={s.kayitlar[0].url} target="_blank" rel="noreferrer">İlk kayıt</Anchor>}
            </div>
          ))}
        </Stack>
      </Collapse>
    </div>
  );
}

export function KuralKarti({ k, vurgu }: { k: EcaKural; vurgu?: boolean }) {
  const { durum, gonder } = useDurum();
  const t = useTuretilen();
  const acik = durum.kurallar[k.id].acik;
  const ust = acik && k.faz > durum.hedefFaz;
  const degisti = t.degisenKurallar.includes(k.id);
  return (
    <Paper withBorder p="sm" radius="md" id={`kural-${k.id}`} className={`kural-karti${acik ? '' : ' kapali'}${ust ? ' faz-ustu' : ''}${vurgu ? ' vurgu' : ''}`}>
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Group gap="sm" wrap="nowrap" align="flex-start">
          <Switch checked={acik} onChange={(e) => gonder({ tur: 'kuralAc', id: k.id, acik: e.currentTarget.checked })} aria-label={`${k.id} ${k.baslik}`} mt={2} color="teal" />
          <div>
            <Group gap={6}>
              <Badge variant="default" radius="sm">{k.id}</Badge>
              <Text fw={650}>{k.baslik}</Text>
            </Group>
            <Group gap={6} mt={4}>
              <Badge size="xs" variant="light" color={FAZ_RENK[k.faz]}>Faz {k.faz}</Badge>
              {ust && <Badge size="xs" color="orange">hedef fazın üstünde</Badge>}
              {!acik && k.faz <= durum.hedefFaz && <Badge size="xs" color="gray" variant="light">bu fazın kuralı, kapalı</Badge>}
              {degisti && <Badge size="xs" color="grape" variant="light">senaryodan farklı</Badge>}
            </Group>
          </div>
        </Group>
      </Group>
      <div className="eca">
        <span className="eca-etiket">OLAY</span><span>{t.metin(k, 'olay')}</span>
        <span className="eca-etiket">KOŞUL</span><span>{t.metin(k, 'kosul')}</span>
        <span className="eca-etiket">EYLEM</span><span><b>{t.metin(k, 'eylem')}</b></span>
      </div>
      {k.kontroller && (
        <Stack gap="xs" mt="sm" pl={{ base: 0, sm: 74 }}>
          {k.kontroller.map((c) => <KontrolAlani key={c.id} k={k} c={c} pasif={!acik} />)}
        </Stack>
      )}
      <Text size="sm" mt={10} className="kural-dayanak-metni"><b>Dayanak:</b> {k.neden}</Text>
      <Text size="xs" c="dimmed" mt={4}><b>Kaynak:</b> {k.kaynak.join(' · ')}</Text>
      <DayanakBulgular k={k} />
    </Paper>
  );
}

export function KuralPaneli({ hedef }: { hedef?: string | null }) {
  const { durum, gonder } = useDurum();
  const t = useTuretilen();
  const [ara, setAra] = useState('');
  const [faz, setFaz] = useState('hepsi');
  const [yalnizAcik, setYalnizAcik] = useState(false);
  const [yalnizDegisen, setYalnizDegisen] = useState(false);
  const hedefAsama = hedef ? KURALLAR.find((k) => k.id === hedef)?.asama : undefined;
  const [acikGruplar, setAcikGruplar] = useState<string[]>(hedefAsama ? [hedefAsama] : ['GIR', 'TET']);

  useEffect(() => {
    if (!hedef) return;
    const a = KURALLAR.find((k) => k.id === hedef)?.asama;
    if (a) setAcikGruplar((g) => (g.includes(a) ? g : [...g, a]));
    const zaman = setTimeout(() => document.getElementById(`kural-${hedef}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
    return () => clearTimeout(zaman);
  }, [hedef]);

  const suz = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase('tr-TR');
    return KURALLAR.filter((k) =>
      (faz === 'hepsi' || String(k.faz) === faz) &&
      (!yalnizAcik || durum.kurallar[k.id].acik) &&
      (!yalnizDegisen || t.degisenKurallar.includes(k.id)) &&
      (!q || `${k.id} ${k.baslik} ${k.olay} ${k.kosul} ${k.eylem} ${k.onler.join(' ')} ${k.kaynak.join(' ')}`.toLocaleLowerCase('tr-TR').includes(q)));
  }, [ara, faz, yalnizAcik, yalnizDegisen, durum.kurallar, t.degisenKurallar]);

  return (
    <Stack gap="sm">
      <Text size="sm" c="dimmed">
        Her kural: <b>OLAY</b> (ne olunca) → <b>KOŞUL</b> (hangi durumda) → <b>EYLEM</b> (ne yapılır). Anahtar kuralı açar/kapatır; sayı, seçenek ve kutular koşulu değiştirir.
        Her kartta kuralın dayandığı gerçek kayıtlar var. Kapattığın kurala bağlı sorunlar "açık" sayılır ve diyagramda kırmızı notla görünür.
      </Text>
      <Group gap="sm" wrap="wrap">
        <TextInput size="xs" placeholder="Kural ara (ör. insan, 137, webhook)" leftSection={<IconSearch size={14} />} value={ara} onChange={(e) => setAra(e.currentTarget.value)} w={260} />
        <SegmentedControl size="xs" value={faz} onChange={setFaz} data={[{ label: 'Hepsi', value: 'hepsi' }, { label: 'Faz 0', value: '0' }, { label: 'Faz 1', value: '1' }, { label: 'Faz 2', value: '2' }]} />
        <Switch size="xs" label="Yalnız açık" checked={yalnizAcik} onChange={(e) => setYalnizAcik(e.currentTarget.checked)} />
        <Switch size="xs" label="Yalnız değişen" checked={yalnizDegisen} onChange={(e) => setYalnizDegisen(e.currentTarget.checked)} />
        <Text size="xs" c="dimmed">{suz.length} kural</Text>
      </Group>
      <Accordion multiple value={acikGruplar} onChange={setAcikGruplar} variant="separated" radius="md">
        {ASAMALAR.map((a) => {
          const ks = suz.filter((k) => k.asama === a.id);
          if (!ks.length) return null;
          const tumu = KURALLAR.filter((k) => k.asama === a.id);
          const acikSayi = tumu.filter((k) => durum.kurallar[k.id].acik).length;
          const bolum = BOLUMLER.find((b) => b.id === a.bolum)!;
          return (
            <Accordion.Item key={a.id} value={a.id}>
              <Accordion.Control>
                <Group justify="space-between" wrap="nowrap" pr="sm">
                  <div>
                    <Text fw={650} size="sm">{a.kod !== '—' ? `${a.kod} · ` : ''}{a.ad}</Text>
                    <Text size="xs" c="dimmed">{bolum.ad}</Text>
                  </div>
                  <Badge variant="light" color={acikSayi === tumu.length ? 'teal' : acikSayi ? 'yellow' : 'gray'}>{acikSayi}/{tumu.length} açık</Badge>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Group gap="xs" mb="xs">
                  <Button size="compact-xs" variant="subtle" onClick={() => gonder({ tur: 'topluKural', ids: tumu.map((k) => k.id), acik: true })}>Hepsini aç</Button>
                  <Button size="compact-xs" variant="subtle" color="gray" onClick={() => gonder({ tur: 'topluKural', ids: tumu.map((k) => k.id), acik: false })}>Hepsini kapat</Button>
                  <Button size="compact-xs" variant="subtle" color="gray" onClick={() => gonder({ tur: 'topluKural', ids: tumu.filter((k) => k.faz <= durum.hedefFaz).map((k) => k.id), acik: true })}>Faz {durum.hedefFaz} çekirdeğini aç</Button>
                </Group>
                <Stack gap="sm">{ks.map((k) => <KuralKarti key={k.id} k={k} vurgu={k.id === hedef} />)}</Stack>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </Stack>
  );
}
