// Karar seçenekleri → teknoloji adı, risk haritası kimliği ve kullanıcı kataloğundaki adı.
export interface Teknoloji { ad: string; risk?: string; katalog?: string; rol: string; kural?: string; d1?: string; d2?: string; c1?: string; etiket?: string }

export const KARAR_TEKNOLOJI: Record<string, Teknoloji> = {
  'durumSahibi:temporal': { ad: 'Temporal', risk: 'AR-0001', katalog: 'Temporal', d1: 'Temporal', c1: 'Temporal', etiket: 'temporal', rol: 'Durum sahibi (orkestratör)' },
  'durumSahibi:dbos': { ad: 'DBOS', risk: 'AR-0002', katalog: 'DBOS', d1: 'DBOS', etiket: 'dbos', rol: 'Durum sahibi (orkestratör)' },
  'durumSahibi:restate': { ad: 'Restate', risk: 'AR-0003', katalog: 'Restate', d1: 'Restate', etiket: 'restate', rol: 'Durum sahibi (orkestratör)' },
  'durumSahibi:kestra': { ad: 'Kestra', risk: 'AR-0008', katalog: 'Kestra', d1: 'Kestra', etiket: 'kestra', rol: 'Durum sahibi (orkestratör)' },
  'durumSahibi:hermesKanban': { ad: 'Hermes Kanban', risk: 'AR-0078', katalog: 'Hermes Kanban', etiket: 'hermes', rol: 'Durum sahibi (tek makine)' },
  'durumSahibi:n8n': { ad: 'n8n', risk: 'AR-0019', katalog: 'n8n', etiket: 'n8n', rol: 'Durum sahibi (önerilmez)' },
  'ajan:claude': { ad: 'Claude Code', risk: 'AR-0054', katalog: 'Claude Code', c1: 'Anthropic Claude ailesi', etiket: 'claude-code', rol: 'Kodlama çalıştırıcısı' },
  'ajan:codex': { ad: 'Codex CLI', risk: 'AR-0055', katalog: 'Codex CLI', c1: 'OpenAI Codex', etiket: 'codex-cli', rol: 'Kodlama çalıştırıcısı' },
  'ajan:openhands': { ad: 'OpenHands', risk: 'AR-0056', katalog: 'OpenHands', c1: 'OpenHands', d2: 'OpenHands', etiket: 'openhands', rol: 'Kodlama çalıştırıcısı' },
  'ajan:pi': { ad: 'Pi', risk: 'AR-4405', etiket: 'pi', rol: 'Kodlama çalıştırıcısı' },
  'ajan:hermes': { ad: 'Hermes Agent', risk: 'AR-0078', katalog: 'Hermes Agent', etiket: 'hermes', rol: 'Kodlama çalıştırıcısı' },
  'ajan:goose': { ad: 'goose', risk: 'AR-0058', katalog: 'goose', etiket: 'goose', rol: 'Kodlama çalıştırıcısı' },
  'ajan:openclaw': { ad: 'OpenClaw', risk: 'AR-0080', katalog: 'OpenClaw', etiket: 'openclaw', rol: 'Kodlama çalıştırıcısı' },
  'qa:codex': { ad: 'Codex CLI', risk: 'AR-0055', katalog: 'Codex CLI', c1: 'OpenAI Codex', etiket: 'codex-cli', rol: 'Bağımsız QA' },
  'qa:claude': { ad: 'Claude Code', risk: 'AR-0054', katalog: 'Claude Code', c1: 'Anthropic Claude ailesi', etiket: 'claude-code', rol: 'Bağımsız QA' },
  'qa:openhands': { ad: 'OpenHands', risk: 'AR-0056', katalog: 'OpenHands', c1: 'OpenHands', d2: 'OpenHands', etiket: 'openhands', rol: 'Bağımsız QA' },
  'kararModeli:pydantic': { ad: 'PydanticAI', katalog: 'PydanticAI', etiket: 'pydantic', rol: 'Tipli karar ajanları (çerçeve)' },
  'kararModeli:jev': { ad: 'Jev (TypeSafe AI)', risk: 'AR-0115', katalog: 'Jev (TypeSafe AI)', etiket: 'jev', rol: 'Tipli karar modeli' },
  'kararModeli:dspy': { ad: 'DSPy', katalog: 'DSPy', etiket: 'dspy', rol: 'Derlenmiş sınıflandırıcı (çerçeve)' },
  'sandbox:docker': { ad: 'Docker Engine + çıkış vekili', risk: 'AR-0180', etiket: 'docker', rol: 'Sandbox' },
  'sandbox:worktree': { ad: 'git worktree + devcontainer', katalog: 'git worktree + devcontainer', rol: 'Sandbox' },
  'sandbox:e2b': { ad: 'E2B', risk: 'AR-0174', katalog: 'E2B', etiket: 'e2b', rol: 'Sandbox (bulut)' },
  'sandbox:daytona': { ad: 'Daytona', risk: 'AR-0175', katalog: 'Daytona', etiket: 'daytona', rol: 'Sandbox' },
  'bildirimAraci:n8n': { ad: 'n8n', risk: 'AR-0019', katalog: 'n8n', etiket: 'n8n', rol: 'Bildirim yapıştırıcısı' },
  'bildirimAraci:hermes': { ad: 'Hermes Agent', risk: 'AR-0078', katalog: 'Hermes Agent', etiket: 'hermes', rol: 'Operasyon ve bildirim ajanı' },
};

// Her senaryoda bulunan yığın. "kural" varsa yalnız o kural açıkken listelenir.
export const SABIT_YIGIN: Teknoloji[] = [
  { ad: 'Plane', risk: 'AR-0194', katalog: 'Plane', rol: 'İş kaynağı' },
  { ad: 'Plane MCP Server', risk: 'AR-0116', katalog: 'Plane MCP Server', rol: 'Ajanın bulgu ve soru yazması' },
  { ad: 'GitHub Actions + merge queue', risk: 'AR-0127', katalog: 'GitHub Actions + merge queue', rol: 'Deterministik kapılar ve birleştirme kuyruğu' },
  { ad: 'Context7', risk: 'AR-0117', katalog: 'Context7', rol: 'Sürüme özgü doküman', kural: 'R10' },
  { ad: 'Semgrep / CodeQL', risk: 'AR-0130', katalog: 'Semgrep / CodeQL', rol: 'SAST kapısı' },
  { ad: 'gitleaks / OSV-Scanner', risk: 'AR-0132', katalog: 'gitleaks / OSV-Scanner', rol: 'Sır ve bağımlılık kapısı' },
  { ad: 'Playwright', risk: 'AR-0134', katalog: 'Playwright', rol: 'Uçtan uca ve tarayıcı testleri' },
  { ad: 'Testcontainers', risk: 'AR-0148', katalog: 'Testcontainers', rol: 'Görev başına veritabanı ve test verisi' },
  { ad: 'PostgreSQL', risk: 'AR-0195', rol: 'Durum ve etki defteri deposu' },
  { ad: 'Stryker / PIT', risk: 'AR-0135', katalog: 'Stryker / PIT', rol: 'Mutasyon testi', kural: 'R27' },
  { ad: 'OpenFGA', risk: 'AR-0122', katalog: 'OpenFGA', rol: 'Yetki kural motoru', kural: 'R30' },
  { ad: 'OpenTelemetry', risk: 'AR-0150', katalog: 'OpenTelemetry', rol: 'İz', kural: 'R68' },
  { ad: 'Langfuse', risk: 'AR-0149', katalog: 'Langfuse', rol: 'Görev başına token ve maliyet', kural: 'R68' },
  { ad: 'Promptfoo', risk: 'AR-0153', katalog: 'Promptfoo', rol: 'Skill ve yönerge eval\'i', kural: 'R70' },
];

// Çerçeveler ve protokoller (raporda "frameworkler" başlığı).
export const CERCEVELER = [
  { ad: 'Agent Skills (SKILL.md)', rol: 'Skill biçimi; Claude Code ve Codex aynı biçimi okur' },
  { ad: 'AGENTS.md', rol: 'Taşınabilir ajan yönergesi (LF Agentic AI Foundation standardı)' },
  { ad: 'MCP', rol: 'Araç protokolü; sürüm sabit, conformance testi CI\'da' },
  { ad: 'ACP + başsız CLI', rol: 'Çalıştırıcıyı değiştirme dikişi (C3)' },
  { ad: 'OpenTelemetry GenAI', rol: 'Model ve maliyet izi' },
];
