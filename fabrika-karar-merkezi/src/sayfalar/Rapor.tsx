import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { IconPrinter, IconInfoCircle } from '@tabler/icons-react';
import { useDurum } from '../durum/depo';
import { useTuretilen } from '../durum/kanca';
import { tumDiyagramlar } from '../diyagram/uretec';
import { MermaidGorunum } from '../diyagram/MermaidGorunum';
import { KARARLAR } from '../veri/kararlar';
import { AKIS_SIRASI, ASAMALAR, asamaBul } from '../veri/asamalar';
import { KURALLAR } from '../veri/kurallar';
import { SKILLER, MCP_SUNUCULARI } from '../veri/ajanlar';
import { BELGELER } from '../veri/belgeler';
import { CERCEVELER } from '../veri/teknolojiler';
import { KAYNAK_ADI } from '../veri/sorunlar';
import { HUKUM, SEVIYE_AD, useSayfa } from '../bilesenler/ortak';
import { secenekOlcut } from '../veri/olcut';
import { kanitAra } from '../veri/kanit';

const bugun = () => new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });

export function Rapor() {
  const { durum } = useDurum();
  const t = useTuretilen();
  const { param } = useSayfa();
  const diyagramlar = useMemo(() => tumDiyagramlar(durum, t), [durum, t]);
  const [cizilen, setCizilen] = useState<Set<string>>(new Set());
  const yazdirildi = useRef(false);
  const yazdir = param.get('yazdir') === '1';

  useEffect(() => {
    if (!yazdir || yazdirildi.current) return;
    const bitti = cizilen.size >= diyagramlar.length;
    const calis = () => {
      if (yazdirildi.current) return;
      yazdirildi.current = true;
      history.replaceState(null, '', '#/rapor');
      setTimeout(() => window.print(), 150);
    };
    if (bitti) { calis(); return; }
    const yedek = setTimeout(calis, 8000);
    return () => clearTimeout(yedek);
  }, [yazdir, cizilen, diyagramlar.length]);

  const kararDegeri = (id: string) => {
    const k = KARARLAR.find((x) => x.id === id)!;
    const v = durum.kararlar[id];
    const liste = Array.isArray(v) ? v : [v];
    return liste.map((x) => k.secenekler.find((s) => s.deger === x)?.etiket ?? x).join(', ') || '—';
  };
  const acikRiskGruplari = Object.entries(KAYNAK_ADI).map(([k, ad]) => ({ ad, liste: t.kapsam.acikSorunlar.filter((s) => s.kaynak === k) })).filter((g) => g.liste.length);
  const kullanilanSkill = SKILLER.filter((s) => AKIS_SIRASI.includes(s.asama) || t.aktifKurallar.some((k) => k.asama === s.asama));

  return (
    <Stack gap="md">
      <Group justify="space-between" className="ekran-yalniz">
        <Text size="sm" c="dimmed">Bu sayfa PDF'in kendisidir. Düğmeye bas; açılan pencerede hedef olarak "PDF olarak kaydet"i seç.</Text>
        <Button leftSection={<IconPrinter size={16} />} onClick={() => window.print()}>PDF olarak kaydet</Button>
      </Group>
      {yazdir && cizilen.size < diyagramlar.length && (
        <Alert className="ekran-yalniz" icon={<IconInfoCircle size={16} />} color="blue">Diyagramlar hazırlanıyor ({cizilen.size}/{diyagramlar.length}); hazır olunca yazdırma penceresi açılacak.</Alert>
      )}
      <article className="rapor">
        <p className="alt">Fabrika Karar Raporu · {bugun()}</p>
        <h1>{t.senaryo.ad}</h1>
        <p>{t.senaryo.ozet}</p>
        <p><span className="rozet">Hedef faz: Faz {durum.hedefFaz}</span> <span className="rozet">{t.aktifKurallar.length}/{KURALLAR.length} ECA kuralı açık</span> <span className="rozet">Kataloglanan sorunlardan {t.kapsam.kapsanan}/{t.kapsam.toplam} açık bir kurala ya da karara bağlı</span></p>

        <h2>1. Kararlar ve dayanakları</h2>
        <p className="alt">Her satırda seçilen seçenek, o seçeneğin kaynaklı olguları ve kaynaklarda o seçenekle ilgili bulgu sayısı var. Olgular öneri değildir.</p>
        <table>
          <thead><tr><th style={{ width: '22%' }}>Karar</th><th style={{ width: '20%' }}>Seçim</th><th>Dayanak olgular</th><th style={{ width: 70 }}>Bulgu</th></tr></thead>
          <tbody>{KARARLAR.filter((k) => k.id !== 'gorunum').map((k) => {
            const v = durum.kararlar[k.id];
            const secili = k.secenekler.filter((x) => (Array.isArray(v) ? v.includes(x.deger) : v === x.deger));
            const olgular = [...(k.olgular ?? []).slice(0, 1), ...secili.flatMap((x) => x.olgular ?? [])];
            const n = secili.reduce((a, x) => a + secenekOlcut(k.id, x.deger).bulgular.length, 0) || kanitAra(k.kanit ?? []).length;
            return (
              <tr key={k.id}>
                <th>{k.baslik}</th>
                <td>{kararDegeri(k.id)}{secili.some((x) => x.dikkat) && <div className="alt" style={{ marginTop: 4 }}>⚠ {secili.map((x) => x.dikkat).filter(Boolean).join(' ')}</div>}</td>
                <td>{olgular.length ? <ul style={{ margin: 0, paddingLeft: 16 }}>{olgular.map((o, i) => <li key={i}>{o.metin} <span className="alt">({o.kaynak})</span></li>)}</ul> : '—'}</td>
                <td>{n || '—'}</td>
              </tr>
            );
          })}</tbody>
        </table>

        <h2>2. Dikkat çeken bulgular</h2>
        {t.uyarilar.length ? (
          <table><tbody>{t.uyarilar.map((u, i) => <tr key={i}><td style={{ width: 76 }}><span className={`rozet ${u.seviye}`}>{u.seviye === 'kritik' ? 'Çakışma' : u.seviye === 'uyari' ? 'Dikkat' : 'Bulgu'}</span></td><td>{u.metin}{u.kaynak ? <span className="alt"> · {u.kaynak}</span> : null}</td></tr>)}</tbody></table>
        ) : <p>Dikkat çeken bulgu yok.</p>}

        {t.gorunum === 'kume' && durum.kumeler.length > 0 && (
          <>
            <h2>3. Kümeler</h2>
            <table>
              <thead><tr><th>Küme</th><th>Teknoloji</th><th>Aşamalar</th><th>Devir olayı</th></tr></thead>
              <tbody>{durum.kumeler.map((k, i) => (
                <tr key={k.id}><td><span style={{ display: 'inline-block', width: 10, height: 10, background: k.renk, borderRadius: 2, marginRight: 6 }} />{i + 1}. {k.ad}</td><td>{k.teknoloji}</td>
                  <td>{AKIS_SIRASI.filter((a) => t.kumeOf(a) === k.id).map((a) => asamaBul(a).ad).join(', ') || '—'}</td><td>{k.devir || '—'}</td></tr>
              ))}</tbody>
            </table>
          </>
        )}

        <h2>4. Somut iş akışı</h2>
        <table>
          <thead><tr><th>Aşama</th><th>Teknoloji</th><th>Ajan</th><th>Skill</th><th>MCP</th><th>Açık kurallar</th></tr></thead>
          <tbody>{ASAMALAR.map((a) => {
            const acik = KURALLAR.filter((k) => k.asama === a.id && t.aktif(k.id)).map((k) => k.id);
            return (
              <tr key={a.id}>
                <td><b>{a.kod !== '—' ? `${a.kod} · ` : ''}{a.ad}</b></td>
                <td>{t.asamaTeknoloji(a.id) || '—'}</td>
                <td>{a.ajanlar.join(', ') || '—'}</td>
                <td>{a.skill.join(', ') || '—'}</td>
                <td>{a.mcp.join(', ') || '—'}</td>
                <td>{acik.join(', ') || '—'}</td>
              </tr>
            );
          })}</tbody>
        </table>

        <h2 className="yeni-sayfa">5. Diyagramlar</h2>
        {diyagramlar.map((d) => (
          <figure key={d.id}>
            <figcaption><b>{d.baslik}.</b> {d.aciklama}</figcaption>
            <MermaidGorunum kod={d.kod} notlar={d.notlar} onSvg={() => setCizilen((s) => (s.has(d.id) ? s : new Set(s).add(d.id)))} />
          </figure>
        ))}

        <h2 className="yeni-sayfa">6. Açık ECA kuralları</h2>
        <table>
          <thead><tr><th style={{ width: 44 }}>Kural</th><th>Olay</th><th>Koşul</th><th>Eylem</th><th style={{ width: 40 }}>Faz</th></tr></thead>
          <tbody>{t.aktifKurallar.map((k) => (
            <tr key={k.id}><td><b>{k.id}</b><br /><span className="alt">{k.baslik}</span></td><td>{t.metin(k, 'olay')}</td><td>{t.metin(k, 'kosul')}</td><td>{t.metin(k, 'eylem')}</td><td>{k.faz}</td></tr>
          ))}</tbody>
        </table>

        <h2>7. Kapalı kurallar ve bağlı sorunları</h2>
        <p>Kapalı kurallar: {t.kapaliKurallar.map((k) => `${k.id} ${k.baslik}`).join('; ') || 'yok'}.</p>
        {acikRiskGruplari.map((g) => (
          <div key={g.ad}>
            <h3>{g.ad} ({g.liste.length})</h3>
            <p>{g.liste.map((s) => `${s.id} ${s.baslik}`).join(' · ')}</p>
          </div>
        ))}

        <h2>8. Teknolojiler ve çerçeveler</h2>
        <table>
          <thead><tr><th>Teknoloji</th><th>Rolü</th><th>Katalog hükmü</th><th>Risk puanı</th></tr></thead>
          <tbody>{t.teknolojiler.map((x) => (
            <tr key={x.ad}><td><b>{x.ad}</b></td><td>{x.rol}</td><td>{x.hukum ? HUKUM[x.hukum]?.ad : '—'}</td><td>{x.riskPuani !== undefined ? `${x.riskPuani} (${SEVIYE_AD[x.riskSeviye ?? ''] ?? ''})` : '—'}</td></tr>
          ))}</tbody>
        </table>
        <p>{CERCEVELER.map((c) => <span key={c.ad}><b>{c.ad}:</b> {c.rol}. </span>)}</p>

        <h2>9. Skill'ler ve MCP sunucuları</h2>
        <table>
          <thead><tr><th>Skill</th><th>Aşama</th><th>Ne yapar</th></tr></thead>
          <tbody>{kullanilanSkill.map((s) => <tr key={s.id}><td><b>{s.id}</b></td><td>{asamaBul(s.asama).ad}</td><td>{s.ne}</td></tr>)}</tbody>
        </table>
        <table>
          <thead><tr><th>MCP sunucusu</th><th>Kullanım</th><th>Yetki</th></tr></thead>
          <tbody>{MCP_SUNUCULARI.map((m) => <tr key={m.ad}><td><b>{m.ad}</b></td><td>{m.kullanim}</td><td>{m.yetki}</td></tr>)}</tbody>
        </table>

        <h2>10. Hazırlanacak dosyalar (CLAUDE.md hariç)</h2>
        <table>
          <thead><tr><th>Dosya</th><th>Ne işe yarar</th><th>Ne zaman</th></tr></thead>
          <tbody>{BELGELER.map((b) => <tr key={b.yol}><td><b>{b.yol}</b></td><td>{b.neIse}</td><td>{b.zorunluluk}</td></tr>)}</tbody>
        </table>

        <p className="alt" style={{ marginTop: 24 }}>Kaynaklar: senin panoların (agentic-stack-docs, 23.09), araştırma dosyaları A0–E6, risk, araç ve ihtiyaç haritaları, Codex incelemesi (salt okunur kopya). Bu rapordaki olgular karar önerisi değildir; kararlar kullanıcıya aittir.</p>
      </article>
    </Stack>
  );
}
