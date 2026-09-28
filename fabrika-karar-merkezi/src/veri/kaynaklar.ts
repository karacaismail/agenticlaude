// Kaynak dizini. Bağlantılar bu HTML dosyasının konumuna göredir (fabrika-karar-merkezi/ klasörü).
export interface Kaynak { kod: string; ad: string; ne: string; yol: string; grup: string }

const ar = (dosya: string) => `../mimari-haritasi/arastirma/${dosya}`;

export const KAYNAKLAR: Kaynak[] = [
  { grup: 'Senin kaynakların', kod: 'Pano', ad: 'Agentic Stack referansı (panolardan)', ne: 'STARK hattı, A0–L aşamaları, policy.yaml, 21 ajan, 127 araçlık katalog', yol: '../agentic-stack-docs/dist/index.html' },
  { grup: 'Senin kaynakların', kod: 'Rapor', ad: 'Agentic geliştirme karar raporu (23.09)', ne: '54 PDF envanteri, Temporal ve Hermes değerlendirmesi', yol: '../agentic-stack-report-2026-09-23/rapor.html' },
  { grup: 'Senin kaynakların', kod: 'S-096', ad: 'İlk kapı panosu', ne: 'Talep → backlog → In Progress → ajanlar → insan testi', yol: 'file:///Users/w6x/Desktop/Agentic%20first%20development-first-gate.pdf' },
  { grup: 'Senin kaynakların', kod: 'S-097', ad: 'Belirsizlikler panosu', ne: 'Rol adayları ve açık sorular', yol: 'file:///Users/w6x/Desktop/Agentic%20first%20development-belirsizlikler.pdf' },
  { grup: 'Araştırma', kod: 'A0', ad: 'Önceki Kestra pilotu', ne: '20 kök neden (E6 ekleriyle)', yol: ar('A0-mevcut-pilot-inceleme.md') },
  { grup: 'Araştırma', kod: 'A1', ad: 'Kurum örnekleri', ne: 'Üretimde ajan kullananlar', yol: ar('A1-ozet.md') },
  { grup: 'Araştırma', kod: 'A2', ad: 'Platform ve kapasite', ne: 'Plane, Temporal, kapasite', yol: ar('A2-ozet.md') },
  { grup: 'Araştırma', kod: 'A3', ad: 'Havuzlar, skill, MCP, Kaizen, olgunluk', ne: 'Talimat dosyaları, skill, MCP ve havuz kuralları', yol: ar('A3-ozet.md') },
  { grup: 'Araştırma', kod: 'B1', ad: 'Hazır projeler ve sorunları', ne: '35 proje, 159 sorun', yol: ar('B1-ozet.md') },
  { grup: 'Araştırma', kod: 'B2', ad: 'Gerçek vaka kataloğu', ne: '16 sınıf, 88 vaka', yol: ar('B2-ozet.md') },
  { grup: 'Araştırma', kod: 'B3', ad: 'Ön-ölüm', ne: '62 arıza kipi (30\'u MVP öncesi şart)', yol: ar('B3-ozet.md') },
  { grup: 'Araştırma', kod: 'C1', ad: 'Hazır sistem var mı?', ne: '32 aday; döngünün tamamını yapan yok', yol: ar('C1-ozet.md') },
  { grup: 'Araştırma', kod: 'C2', ad: 'OpenHands, Symphony, Aperant', ne: 'Çalıştırıcılar; ACP ve MCP', yol: ar('C2-ozet.md') },
  { grup: 'Araştırma', kod: 'C3', ad: 'Tak-çıkar', ne: 'Kararlı/oynak katmanlar, dikiş haritası', yol: ar('C3-ozet.md') },
  { grup: 'Araştırma', kod: 'C4', ad: 'Büyük yapım vakaları', ne: '90/90 tuzağı, dış oracle', yol: ar('C4-ozet.md') },
  { grup: 'Araştırma', kod: 'C5', ad: 'HRMS: DoD ve oracle', ne: 'Beş koşul, 2026 parametreleri, uzman imzası', yol: ar('C5-ozet.md') },
  { grup: 'Araştırma', kod: 'C6', ad: '144 ekip ölçeği', ne: 'Sınırlar, darboğazlar, maliyet, kademe kapıları', yol: ar('C6-ozet.md') },
  { grup: 'Araştırma', kod: 'D1', ad: 'Orkestratör hataları', ne: '9 motor, 111 kayıt', yol: ar('D1-ozet.md') },
  { grup: 'Araştırma', kod: 'D2', ad: 'Ajan platformu hataları', ne: '8 platform, 66 kayıt, 11 dikiş', yol: ar('D2-ozet.md') },
  { grup: 'Araştırma', kod: 'E1–E6', ad: 'Codex karşılaştırmaları', ne: 'İhtiyaç, araç, risk, mimari, araştırma, Kestra geçmişi', yol: ar('E4-ozet.md') },
  { grup: 'Haritalar', kod: 'İhtiyaç', ad: 'İhtiyaç haritası (görsel)', ne: '395 ihtiyaç, 35 küme', yol: '../ihtiyac-haritasi/gorsel/ihtiyac-haritasi.html' },
  { grup: 'Haritalar', kod: 'Araç', ad: 'Araç haritası', ne: '4.404 araç', yol: '../arac-haritasi/00-harita.json' },
  { grup: 'Haritalar', kod: 'Risk', ad: 'Risk haritası', ne: '2.514 bulgu', yol: '../risk-haritasi/00-risk-haritasi.json' },
  { grup: 'Haritalar', kod: 'Mimari', ad: 'Mimari kayıt', ne: 'Bileşenler, kararlar, pilot dersleri, kabul deneyleri', yol: '../mimari-haritasi/00-mimari.json' },
  { grup: 'Codex (salt okunur)', kod: 'Codex-15', ad: 'Karşılaştırmada kaçan mimari açıklar', ne: '28 bulgu, 16 düzeltilmiş sözleşme', yol: '../../otomasyon%20coding%202/reports/Kar%C5%9F%C4%B1la%C5%9Ft%C4%B1rmada%20ka%C3%A7an%20mimari%20a%C3%A7%C4%B1klar.md' },
  { grup: 'Codex (salt okunur)', kod: 'Codex-atlas', ad: 'Codex Mermaid + ECharts atlası', ne: 'Araştırma görselleştirmesi', yol: '../../otomasyon%20coding%202/agentic-sistem/gorsellestirme.html' },
  { grup: 'Devir-teslim', kod: 'Devir', ad: 'Devir-teslim sözleşmesi', ne: 'Okuma sırası, kurallar, durum', yol: '../devir-teslim/DEVIR-TESLIM.md' },
];
