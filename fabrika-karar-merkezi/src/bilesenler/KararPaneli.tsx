import { useMemo, useState } from 'react';
import { Badge, Button, Checkbox, Collapse, Group, Modal, Paper, Radio, SimpleGrid, Stack, Table, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { IconAlertTriangle, IconArrowsDiff, IconChevronDown, IconListDetails, IconStarFilled } from '@tabler/icons-react';
import { KARARLAR } from '../veri/kararlar';
import { kanitAra, TUR_AD, TUR_RENK, type Kanit } from '../veri/kanit';
import { HUKUM_AD, SEVIYE_AD, SEVIYE_RENK, kanitEtiketleri, secenekOlcut, type Olcut } from '../veri/olcut';
import type { Karar, KararSecenek } from '../veri/tipler';
import { useDurum } from '../durum/depo';
import { useTuretilen } from '../durum/kanca';
import { KanitSayilari, OlguListesi, useKanit } from './Kanit';

const sayi = (n?: number) => (n === undefined ? '—' : n.toLocaleString('tr-TR'));

// Seçenek ölçütleri: yalnız veride olanlar gösterilir.
function OlcutRozetleri({ o }: { o: Olcut }) {
  return (
    <Group gap={6} wrap="wrap">
      {o.risk && <Tooltip label={`Risk haritası puanı (0–100) · ${o.risk.bulgu} bulgu`}><Badge size="sm" variant="light" color={SEVIYE_RENK[o.risk.seviye]}>Risk {o.risk.puan} · {SEVIYE_AD[o.risk.seviye]}</Badge></Tooltip>}
      {o.d1 && <Tooltip label="D1: dünyadaki orkestratör hata kayıtları (açık issue)"><Badge size="sm" variant="light" color="gray">D1 {o.d1.toplam} kayıt · {o.d1.acik} açık</Badge></Tooltip>}
      {o.d2 && <Tooltip label="D2: ajan platformu hata kayıtları"><Badge size="sm" variant="light" color="gray">D2 {o.d2.toplam} kayıt</Badge></Tooltip>}
      {o.c1 && <Tooltip label={`C1: 12 gereksinimde toplam puan (en fazla 24) · ${o.c1.tam} gereksinimde tam puan`}><Badge size="sm" variant="light" color="gray">C1 {o.c1.toplam}/24</Badge></Tooltip>}
      {o.depo && <Tooltip label={`${o.depo.ad} · son push ${o.depo.sonPush}${o.depo.arsiv ? ' · arşiv' : ''}`}><Badge size="sm" variant="light" color="gray" leftSection={<IconStarFilled size={10} />}>{sayi(o.depo.yildiz)}</Badge></Tooltip>}
    </Group>
  );
}

function SecenekKarti({ k, s, secili, onSec, tip }: { k: Karar; s: KararSecenek; secili: boolean; onSec: () => void; tip: 'radyo' | 'kutu' }) {
  const { kanitAc } = useKanit();
  const o = useMemo(() => secenekOlcut(k.id, s.deger), [k.id, s.deger]);
  const bulgular = o.bulgular;
  return (
    <Paper withBorder p="md" className={`secenek-karti${secili ? ' secili' : ''}`}
      onClick={(e) => { if (!(e.target as HTMLElement).closest('button, a, input, label')) onSec(); }}>
      <Group wrap="nowrap" align="flex-start" gap="sm">
        {tip === 'radyo'
          ? <Radio value={s.deger} aria-label={s.etiket} mt={2} />
          : <Checkbox value={s.deger} aria-label={s.etiket} mt={2} />}
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <div>
            <Text fw={650} lh={1.3}>{s.etiket}</Text>
            {s.ozet && <Text size="sm" c="dimmed">{s.ozet}</Text>}
          </div>
          {s.dikkat && (
            <Group gap={6} wrap="nowrap" align="flex-start" className="dikkat-satiri">
              <IconAlertTriangle size={15} style={{ flexShrink: 0, marginTop: 2 }} />
              <Text size="sm">{s.dikkat}</Text>
            </Group>
          )}
          {!!s.olgular?.length && <OlguListesi olgular={s.olgular} sinir={2} />}
          {(o.risk || o.d1 || o.d2 || o.c1 || o.depo) && <OlcutRozetleri o={o} />}
          {(!!bulgular.length || (s.olgular?.length ?? 0) > 2) && (
            <Group gap="xs" justify="space-between" wrap="wrap">
              {bulgular.length ? <KanitSayilari liste={bulgular} enFazla={3} /> : <span />}
              <Button size="compact-xs" variant="light" leftSection={<IconListDetails size={13} />}
                onClick={() => kanitAc({ baslik: `${k.baslik} · ${s.etiket}`, alt: `${bulgular.length} bulgu`, liste: bulgular, olgular: s.olgular })}>
                {bulgular.length ? `Bulgular (${bulgular.length})` : `Olgular (${s.olgular?.length ?? 0})`}
              </Button>
            </Group>
          )}
        </Stack>
      </Group>
    </Paper>
  );
}

function Karsilastirma({ k, acik, kapat }: { k: Karar; acik: boolean; kapat: () => void }) {
  const { durum } = useDurum();
  const { kanitAc } = useKanit();
  const olcutler = useMemo(() => k.secenekler.map((s) => ({ s, o: secenekOlcut(k.id, s.deger) })), [k]);
  const secili = (d: string) => (Array.isArray(durum.kararlar[k.id]) ? (durum.kararlar[k.id] as string[]).includes(d) : durum.kararlar[k.id] === d);
  const turler = ['pilot', 'olcum', 'vaka', 'hata', 'guvenlik', 'belge'];
  const satir = (ad: string, f: (x: { s: KararSecenek; o: Olcut }) => React.ReactNode, ipucu?: string) => (
    <Table.Tr>
      <Table.Th className="kars-ilk">{ipucu ? <Tooltip label={ipucu}><span>{ad}</span></Tooltip> : ad}</Table.Th>
      {olcutler.map((x) => <Table.Td key={x.s.deger} className={secili(x.s.deger) ? 'kars-secili' : undefined}>{f(x)}</Table.Td>)}
    </Table.Tr>
  );
  const teknolojiVar = olcutler.some((x) => x.o.teknoloji);
  const say = (l: Kanit[], t: string) => l.filter((b) => b.tur === t).length || '—';
  return (
    <Modal opened={acik} onClose={kapat} size="90%" title={<Text fw={700}>{k.baslik}: seçenekleri karşılaştır</Text>}>
      <Text size="sm" c="dimmed" mb="sm">Hücreler araştırma verisinden sayılır. Sayıların anlamı: kaynaklarda o seçenekle ilgili kaç bulgu var. Karar sende.</Text>
      <div className="kars-kap">
        <Table withTableBorder withColumnBorders fz="sm" verticalSpacing="xs" className="kars-tablo">
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="kars-ilk">Ölçüt</Table.Th>
              {olcutler.map((x) => <Table.Th key={x.s.deger} className={secili(x.s.deger) ? 'kars-secili' : undefined}>{x.s.etiket}{secili(x.s.deger) && <Badge size="xs" ml={6}>seçili</Badge>}</Table.Th>)}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {satir('Kaynaklardaki bulgu', (x) => x.o.bulgular.length
              ? <Button size="compact-xs" variant="subtle" onClick={() => kanitAc({ baslik: `${k.baslik} · ${x.s.etiket}`, liste: x.o.bulgular, olgular: x.s.olgular })}>{x.o.bulgular.length}</Button> : '—',
              'Bu seçeneğin adını ya da konusunu taşıyan bulgu sayısı')}
            {turler.map((t) => satir(TUR_AD[t], (x) => <Text size="sm" c={TUR_RENK[t]}>{say(x.o.bulgular, t)}</Text>))}
            {teknolojiVar && satir('Risk puanı (0–100)', (x) => x.o.risk ? <Badge variant="light" color={SEVIYE_RENK[x.o.risk.seviye]}>{x.o.risk.puan} · {SEVIYE_AD[x.o.risk.seviye]}</Badge> : '—', 'Risk haritasının yöntemiyle hesaplanan puan')}
            {teknolojiVar && satir('Risk bulguları (öne çıkan)', (x) => x.o.risk?.enOnemli.length ? <ul className="kars-liste">{x.o.risk.enOnemli.slice(0, 3).map((b, i) => <li key={i}>{b.baslik} <Text span size="xs" c="dimmed">({SEVIYE_AD[b.siddet] ?? b.siddet})</Text></li>)}</ul> : '—')}
            {teknolojiVar && satir('Dünya hata kaydı (D1/D2)', (x) => x.o.d1 ? `${x.o.d1.toplam} kayıt · ${x.o.d1.acik} açık issue` : x.o.d2 ? `${x.o.d2.toplam} kayıt` : '—')}
            {teknolojiVar && satir('C1 gereksinim puanı', (x) => x.o.c1 ? `${x.o.c1.toplam}/24 · ${x.o.c1.tam} gereksinimde tam` : '—', 'C1: hazır sistemlerin 12 gereksinime göre puanı')}
            {teknolojiVar && satir('Depo', (x) => x.o.depo ? `★ ${sayi(x.o.depo.yildiz)} · son push ${x.o.depo.sonPush}${x.o.depo.arsiv ? ' · arşiv' : ''}` : '—')}
            {teknolojiVar && satir('Lisans', (x) => x.o.lisans ?? '—')}
            {teknolojiVar && satir('23.09 raporundaki hüküm', (x) => x.o.hukum ? HUKUM_AD[x.o.hukum] ?? x.o.hukum : '—', 'Senin panolarından türetilen 23.09 raporunun değerlendirmesi; bulgu değil, geçmiş bir hüküm')}
            {satir('Dikkat çeken olgu', (x) => x.s.dikkat ?? '—')}
            {satir('Olgular', (x) => x.s.olgular?.length ? <OlguListesi olgular={x.s.olgular} /> : '—')}
          </Table.Tbody>
        </Table>
      </div>
    </Modal>
  );
}

function KararKarti({ k }: { k: Karar }) {
  const { durum, gonder } = useDurum();
  const t = useTuretilen();
  const { kanitAc } = useKanit();
  const [olguAcik, setOlguAcik] = useState(false);
  const [kars, setKars] = useState(false);
  const kararBulgulari = useMemo(() => kanitAra(k.kanit ?? []), [k]);
  const degisti = t.degisenKararlar.includes(k.id);
  const deger = durum.kararlar[k.id];
  const secenekler = (
    <SimpleGrid cols={{ base: 1, md: k.secenekler.length > 3 ? 2 : k.secenekler.length === 1 ? 1 : 2 }} spacing="sm">
      {k.secenekler.map((s) => (
        <SecenekKarti key={s.deger} k={k} s={s} tip={k.tur}
          secili={Array.isArray(deger) ? deger.includes(s.deger) : deger === s.deger}
          onSec={() => {
            if (k.tur === 'radyo') gonder({ tur: 'karar', id: k.id, deger: s.deger });
            else { const l = (deger as string[]) ?? []; gonder({ tur: 'karar', id: k.id, deger: l.includes(s.deger) ? l.filter((x) => x !== s.deger) : [...l, s.deger] }); }
          }} />
      ))}
    </SimpleGrid>
  );
  return (
    <Paper withBorder p="lg" className="karar-karti" id={`karar-${k.id}`}>
      <Group justify="space-between" align="flex-start" mb="sm" wrap="wrap" gap="xs">
        <div>
          <Group gap="xs"><Text fw={700} size="lg">{k.baslik}</Text>{degisti && <Badge size="sm" color="grape" variant="light">senaryodan farklı</Badge>}</Group>
          <Text size="sm" c="dimmed">{k.soru}</Text>
        </div>
        <Group gap="xs">
          {k.secenekler.length > 1 && k.id !== 'gorunum' && <Button size="xs" variant="default" leftSection={<IconArrowsDiff size={14} />} onClick={() => setKars(true)}>Karşılaştır</Button>}
          {!!kararBulgulari.length && (
            <Button size="xs" variant="light" leftSection={<IconListDetails size={14} />}
              onClick={() => kanitAc({ baslik: k.baslik, alt: `Konu etiketleri: ${kanitEtiketleri(k.id).join(', ')}`, liste: kararBulgulari, olgular: k.olgular })}>
              Konu bulguları ({kararBulgulari.length})
            </Button>
          )}
        </Group>
      </Group>
      {!!k.olgular?.length && (
        <div className="karar-olgulari">
          <UnstyledButton onClick={() => setOlguAcik((x) => !x)} className="olgu-ac">
            <Group gap={6}><ThemeIcon size="sm" variant="light" color="gray"><IconChevronDown size={14} style={{ transform: olguAcik ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }} /></ThemeIcon>
              <Text size="sm" fw={600}>Bu karara dair olgular ({k.olgular.length})</Text></Group>
          </UnstyledButton>
          <Collapse in={olguAcik}><div style={{ paddingTop: 8 }}><OlguListesi olgular={k.olgular} /></div></Collapse>
        </div>
      )}
      {k.tur === 'radyo'
        ? <Radio.Group value={String(deger)} onChange={(v) => gonder({ tur: 'karar', id: k.id, deger: v })}>{secenekler}</Radio.Group>
        : <Checkbox.Group value={(deger as string[]) ?? []} onChange={(v) => gonder({ tur: 'karar', id: k.id, deger: v })}>{secenekler}</Checkbox.Group>}
      {k.kaynak.length > 0 && <Text size="xs" c="dimmed" mt="sm">Kaynak: {k.kaynak.join(' · ')}</Text>}
      <Karsilastirma k={k} acik={kars} kapat={() => setKars(false)} />
    </Paper>
  );
}

// Bütün kararlar ve şu anki seçimler tek bakışta; tıklayınca ilgili karar kartına gider.
function KararDizini() {
  const { durum } = useDurum();
  const kararlar = KARARLAR.filter((k) => k.id !== 'gorunum');
  const git = (id: string) => document.getElementById(`karar-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  return (
    <Paper withBorder p="md" className="karar-dizini">
      <Group justify="space-between" mb={8} gap="xs">
        <Text fw={650} size="sm">Seçimlerin</Text>
        <Text size="xs" c="dimmed">{kararlar.length} karar · karta gitmek için tıkla</Text>
      </Group>
      <div className="karar-dizini-izgara">
        {kararlar.map((k, i) => {
          const v = durum.kararlar[k.id];
          const degerler = Array.isArray(v) ? v.map(String) : v !== undefined && v !== '' ? [String(v)] : [];
          const secilenler = k.secenekler.filter((s) => degerler.includes(s.deger));
          const dikkat = secilenler.some((s) => s.dikkat);
          return (
            <UnstyledButton key={k.id} className="karar-dizini-ogesi" onClick={() => git(k.id)}>
              <span className="karar-dizini-no">{String(i + 1).padStart(2, '0')}</span>
              <span className="karar-dizini-metin">
                <span className="karar-dizini-baslik">{k.baslik}</span>
                <span className="karar-dizini-secim">{secilenler.length ? secilenler.map((s) => s.etiket).join(', ') : 'Seçilmedi'}</span>
              </span>
              {dikkat && <Tooltip label="Seçilen seçenekte dikkat çeken bir bulgu var"><IconAlertTriangle size={15} className="karar-dizini-dikkat" /></Tooltip>}
            </UnstyledButton>
          );
        })}
      </div>
    </Paper>
  );
}

export function KararPaneli() {
  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed" maw={820}>
        Her seçenekte kaynaklı olgular, dikkat çeken bulgu ve ölçütler var. "Bulgular" düğmesi o seçeneğe ait bütün kayıtları açar; "Karşılaştır" seçenekleri yan yana koyar.
        Burada öneri yok; karar sende.
      </Text>
      <KararDizini />
      {KARARLAR.filter((k) => k.id !== 'gorunum').map((k) => <KararKarti key={k.id} k={k} />)}
    </Stack>
  );
}
