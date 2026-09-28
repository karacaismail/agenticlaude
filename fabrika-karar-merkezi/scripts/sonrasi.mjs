// Build sonrası: cikti/index.html -> fabrika-karar-merkezi.html (uygulama klasörünün kökünde tek dosya)
import { renameSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const kok = join(dirname(fileURLToPath(import.meta.url)), '..');
const kaynak = join(kok, 'cikti', 'index.html');
const hedef = join(kok, 'fabrika-karar-merkezi.html');
renameSync(kaynak, hedef);
rmSync(join(kok, 'cikti'), { recursive: true, force: true });
const mb = (statSync(hedef).size / 1024 / 1024).toFixed(2);
console.log(`Hazır: fabrika-karar-merkezi.html (${mb} MB)`);
