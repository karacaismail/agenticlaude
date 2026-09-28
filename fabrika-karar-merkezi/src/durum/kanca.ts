import { useDurum, type Durum } from './depo';
import { turet, type Turetilen } from './hesap';

// Aynı durum nesnesi için hesap bir kez yapılır.
const onbellek = new WeakMap<Durum, Turetilen>();
export function useTuretilen(): Turetilen {
  const { durum } = useDurum();
  let t = onbellek.get(durum);
  if (!t) { t = turet(durum); onbellek.set(durum, t); }
  return t;
}
