// Erzeugt src/data/days.json mit zufälligen Standard-Codes.
// Tag 1–8: 1–9, ab Tag 9: 1–20. Nur einmal ausführen, sonst passen
// bereits gedruckte Sticker nicht mehr:  node scripts/generate-days.mjs --force
import { existsSync, writeFileSync } from 'node:fs';

const target = new URL('../src/data/days.json', import.meta.url);
if (existsSync(target) && !process.argv.includes('--force')) {
  console.error('days.json existiert schon. Mit --force überschreiben.');
  process.exit(1);
}

const rows = [
  ['buch', 'Die verschwundene Lupe', 'Detektivbuch 1'],
  ['lego', 'Der Reim an der Garderobe', 'Lego 1'],
  ['experiment', 'Das geheimnisvolle Säckchen', 'Pfeffer flieht'],
  ['pixi', 'Der Schatten im Museum', 'Pixi: Dinosaurier'],
  ['experiment', 'Die Geräusche in der alten Villa', 'Dino-Eis'],
  ['lego', 'Der Reim am Bücherregal', 'Lego 2'],
  ['buch', 'Die geheimnisvollen Fußspuren', 'Detektivbuch 2'],
  ['lego', 'Das Foto aus dem Archiv', 'Lego 3'],
  ['experiment', 'Der Zahlen-Code', 'Kresse'],
  ['pixi', 'Das zerrissene Bild', 'Pixi: Vulkane'],
  ['lego', 'Der Reim im Schlafzimmer', 'Lego 4'],
  ['experiment', 'Die große Schatzsuche', 'Natron-Vulkan'],
  ['buch', 'Wer war im Zimmer?', 'Detektivbuch 3'],
  ['lego', 'Der Schritte-Code', 'Lego 5'],
  ['experiment', 'Der Reim im Badezimmer', 'Schwimmt oder sinkt?'],
  ['pixi', 'Der Würfel-Code', 'Pixi: Minecraft'],
  ['lego', 'Der Reim in der Küche', 'Lego 6'],
  ['buch', 'Ein Anruf vom Kommissar', 'Detektivbuch 4'],
  ['experiment', 'Wer war in der Küche?', 'Rotkohl-Farbzauber'],
  ['lego', 'Der Reim im Bad', 'Lego 7'],
  ['experiment', 'Die Spürnase', 'Fingerabdrücke'],
  ['experiment', 'Das fehlende Beweisstück', 'Magnete'],
  ['buch', 'Die unsichtbare Botschaft', 'Detektivbuch 5'],
  ['lego', 'Der letzte Fall', 'Lego 8 – Finale'],
];

const rand = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
const days = rows.map(([typ, titel, fund], i) => {
  const tag = i + 1;
  return {
    tag,
    datum: `2026-12-${String(tag).padStart(2, '0')}`,
    typ,
    titel,
    fund,
    code: tag <= 8 ? rand(1, 9) : rand(1, 20),
    tagebuch: typ === 'experiment',
  };
});

writeFileSync(target, JSON.stringify(days, null, 2) + '\n');
console.log(days.map((d) => `${d.tag}: ${d.code}`).join('  '));
