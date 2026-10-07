/** @jsxRuntime automatic */
/** @jsxImportSource react */
// Builds the two printable A4 PDFs offered on the site from the content files:
//   public/pdf/carte-comme-avant.pdf   (content/menu.json)
//   public/pdf/vins-comme-avant.pdf    (content/wines.json)
// Run: npm run pdf  (= tsx scripts/pdf/build-pdf.tsx). Re-run after each change of the carte or the wines.
// Fonts: Spectral (SIL OFL 1.1, see fonts/OFL.txt), TrueType subsets made by prepare_fonts.py.
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Document, Font, Image, Page, renderToFile, StyleSheet, Text, View } from "@react-pdf/renderer";
import sharp from "sharp";
import { ALCOHOL_NOTICE, ALLERGEN_NOTE, capitalize, frenchSpaces, splitDish, splitWine } from "../../src/components/carte/typography";
import { euro, frenchDate, menu, type MenuItem, site, type Wine, wines } from "../../src/lib/data";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const outDir = join(root, "public", "pdf");

const NAVY = "#17213b";
const SOFT = "#4a5168";
const LINE = "#d5d8e0";

Font.register({
  family: "Spectral",
  fonts: [
    { src: join(here, "fonts", "Spectral-Light.ttf"), fontWeight: 300 },
    { src: join(here, "fonts", "Spectral-Regular.ttf"), fontWeight: 400 },
    { src: join(here, "fonts", "Spectral-Italic.ttf"), fontWeight: 400, fontStyle: "italic" },
    { src: join(here, "fonts", "Spectral-Medium.ttf"), fontWeight: 500 },
  ],
});
// French text: no automatic (English) hyphenation.
Font.registerHyphenationCallback((word) => [word]);

const FIGURES = ["lnum", "tnum"];
const s = StyleSheet.create({
  page: { fontFamily: "Spectral", fontSize: 10, lineHeight: 1.35, color: NAVY, paddingTop: 36, paddingBottom: 54, paddingHorizontal: 46 },
  masthead: { alignItems: "center" },
  logo: { width: 62, height: 62 },
  title: { marginTop: 8, fontSize: 30, fontWeight: 300, lineHeight: 1.1, textAlign: "center" },
  subtitle: { marginTop: 3, fontSize: 9.5, color: SOFT, textAlign: "center" },
  box: { borderWidth: 0.75, borderColor: NAVY, paddingVertical: 9, paddingHorizontal: 12 },
  boxTitle: { fontSize: 13.5, fontWeight: 400, marginBottom: 2 },
  soft: { color: SOFT },
  small: { fontSize: 8.5 },
  h2: { fontSize: 15, fontWeight: 300, paddingBottom: 4, marginBottom: 4, borderBottomWidth: 0.5, borderBottomColor: LINE },
  h3: { fontSize: 12.5, fontWeight: 500, paddingBottom: 3, marginBottom: 2, borderBottomWidth: 0.75, borderBottomColor: NAVY },
  region: { fontStyle: "italic", color: SOFT, marginTop: 6, marginBottom: 1 },
  row: { flexDirection: "row", paddingVertical: 2.2 },
  rowName: { flex: 1, paddingRight: 10 },
  price: { width: 40, textAlign: "right", fontFeatureSettings: FIGURES },
  medium: { fontWeight: 500 },
  smcp: { fontFeatureSettings: ["c2sc"] },
  footer: { position: "absolute", left: 46, right: 46, bottom: 22, fontSize: 8, color: SOFT },
});

const address = `${site.name}, ${site.address.street}, ${site.address.postalCode} ${site.address.city}. Réservation au ${site.phone.display}`;

function Masthead({ logo, title, lines }: { logo: Buffer; title: string; lines: string[] }) {
  return (
    <View style={s.masthead}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf <Image> has no alt attribute */}
      <Image src={{ data: logo, format: "png" }} style={s.logo} />
      <Text style={s.title}>{title}</Text>
      {lines.map((l) => (
        <Text key={l} style={s.subtitle}>
          {l}
        </Text>
      ))}
    </View>
  );
}

// Repeated at the bottom of every page (no page numbers: react-pdf 4 drops `render` texts on pages that
// inherit a line height).
function Footer({ notice }: { notice?: string }) {
  return (
    <View fixed style={s.footer}>
      {notice ? <Text style={{ color: NAVY, marginBottom: 2 }}>{notice}</Text> : null}
      <Text>{address}</Text>
    </View>
  );
}

/** AOP / AOC / IGP in small caps, like on the site. */
function Appellations({ text }: { text: string }) {
  return (
    <>
      {text.split(/\b(AOP|AOC|IGP)\b/).map((part, i) =>
        i % 2 === 1 ? (
          <Text key={i} style={s.smcp}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </>
  );
}

function WineName({ name }: { name: string }) {
  const [label, producer] = splitWine(frenchSpaces(name));
  return (
    <>
      <Appellations text={label} />
      {producer ? (
        <Text style={s.soft}>
          <Appellations text={producer} />
        </Text>
      ) : null}
    </>
  );
}

// ── La carte ─────────────────────────────────────────────────────────────────────────────────────

function Dish({ item }: { item: MenuItem }) {
  const [lead, rest] = splitDish(frenchSpaces(item.name));
  return (
    <View style={s.row} wrap={false}>
      <Text style={s.rowName}>
        <Text style={s.medium}>{lead}</Text>
        {rest}
        {item.detail ? <Text style={s.soft}>, {item.detail}</Text> : null}
        {item.askAllergens ? <Text style={[s.soft, s.small]}>{"\n"}Allergènes : demandez-nous.</Text> : null}
      </Text>
      <Text style={s.price}>{item.price !== null ? euro(item.price) : ""}</Text>
    </View>
  );
}

function CarteDocument({ logo }: { logo: Buffer }) {
  // Two balanced columns: split the sections where the estimated heights are closest.
  const weight = (sec: (typeof menu.sections)[number]) =>
    3 + sec.items.reduce((n, i) => n + Math.ceil((i.name.length + (i.detail?.length ?? 0)) / 42), 0) + (sec.items.some((i) => i.alcohol) ? 2 : 0);
  const weights = menu.sections.map(weight);
  const total = weights.reduce((a, b) => a + b, 0);
  let split = 1;
  let best = Infinity;
  for (let k = 1; k < weights.length; k++) {
    const left = weights.slice(0, k).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 2 * left) < best) {
      best = Math.abs(total - 2 * left);
      split = k;
    }
  }
  const columns = [menu.sections.slice(0, split), menu.sections.slice(split)];

  return (
    <Document title={`La carte, ${site.name}, ${site.address.city}`} author={site.name} subject={`Carte en vigueur au ${frenchDate(menu.updatedAt)}`} language="fr-FR">
      <Page size="A4" style={s.page}>
        <Footer />
        <Masthead logo={logo} title="La carte" lines={[`Carte en vigueur au ${frenchDate(menu.updatedAt)}`]} />

        <View style={{ flexDirection: "row", marginTop: 16 }} wrap={false}>
          <View style={[s.box, { flex: 1, marginRight: 9 }]}>
            <Text style={s.boxTitle}>L&apos;ardoise</Text>
            <Text>Suggestions et broche du jour selon arrivage, sur l&apos;ardoise au restaurant.</Text>
            <Text style={[s.soft, s.small, { marginTop: 4 }]}>Allergènes : demandez-nous.</Text>
          </View>
          <View style={[s.box, { flex: 1, marginLeft: 9 }]}>
            <Text style={s.boxTitle}>Formules du midi</Text>
            <Text style={[s.soft, { marginBottom: 3 }]}>{capitalize(menu.formules.when)}.</Text>
            {menu.formules.items.map((f) => (
              <View key={f.id} style={{ flexDirection: "row", marginTop: 3 }}>
                <View style={s.rowName}>
                  <Text style={s.medium}>{f.label}</Text>
                  <Text style={s.soft}>{f.detail}</Text>
                </View>
                <Text style={[s.price, { fontSize: 12.5 }]}>{euro(f.price)}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", marginTop: 6 }}>
          {columns.map((sections, c) => (
            <View key={c} style={{ flex: 1, marginLeft: c ? 9 : 0, marginRight: c ? 0 : 9 }}>
              {sections.map((sec) => (
                <View key={sec.id} style={{ marginTop: 12 }}>
                  <Text style={s.h2} minPresenceAhead={40}>
                    {sec.title}
                  </Text>
                  {sec.items.map((item) => (
                    <Dish key={item.id} item={item} />
                  ))}
                  {sec.items.some((i) => i.alcohol) ? <Text style={[s.soft, s.small, { marginTop: 4 }]}>{ALCOHOL_NOTICE}</Text> : null}
                </View>
              ))}
            </View>
          ))}
        </View>

        <View style={{ marginTop: 16 }} wrap={false}>
          <Text style={{ fontSize: 9 }}>{ALLERGEN_NOTE}</Text>
          <Text style={[s.soft, { fontSize: 9, marginTop: 3 }]}>{menu.pricesNote}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ── Les vins ─────────────────────────────────────────────────────────────────────────────────────

const COLOURS: { key: Wine["colour"]; title: string; glass: string }[] = [
  { key: "rouge", title: "Vins rouges", glass: "Rouges" },
  { key: "blanc", title: "Vins blancs", glass: "Blancs" },
  { key: "rose", title: "Vins rosés", glass: "Rosés" },
  { key: "bulles", title: "Les bulles", glass: "Bulles" },
];

function WinesDocument({ logo }: { logo: Buffer }) {
  const sizes = [...new Set(wines.byGlass.flatMap((w) => w.sizes.map((x) => x.cl)))].sort((a, b) => a - b);
  const glassOrder = [...new Set(wines.byGlass.map((w) => w.colour))];
  return (
    <Document title={`Les vins, ${site.name}, ${site.address.city}`} author={site.name} subject={`Carte des vins en vigueur au ${frenchDate(wines.updatedAt)}`} language="fr-FR">
      <Page size="A4" style={s.page}>
        <Footer notice={ALCOHOL_NOTICE} />
        <Masthead logo={logo} title="Les vins" lines={[wines.note, `Carte des vins en vigueur au ${frenchDate(wines.updatedAt)}`]} />
        <Text style={[s.subtitle, { color: NAVY, marginTop: 6 }]}>{ALCOHOL_NOTICE}</Text>

        <Text style={[s.h2, { marginTop: 18 }]}>Au verre ou en pot</Text>
        <View style={[s.row, { borderBottomWidth: 0.75, borderBottomColor: NAVY }]}>
          <Text style={s.rowName} />
          {sizes.map((cl) => (
            <Text key={cl} style={[s.price, s.medium, { width: 48 }]}>
              {cl} cl
            </Text>
          ))}
        </View>
        {glassOrder.map((colour) => (
          <View key={colour} wrap={false}>
            <Text style={s.region}>{COLOURS.find((c) => c.key === colour)?.glass ?? colour}</Text>
            {wines.byGlass
              .filter((w) => w.colour === colour)
              .map((w) => (
                <View key={w.name} style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: LINE }]}>
                  <Text style={s.rowName}>
                    <WineName name={w.name} />
                  </Text>
                  {sizes.map((cl) => {
                    const size = w.sizes.find((x) => x.cl === cl);
                    return (
                      <Text key={cl} style={[s.price, { width: 48 }, size ? {} : s.soft]}>
                        {size ? euro(size.price) : "–"}
                      </Text>
                    );
                  })}
                </View>
              ))}
          </View>
        ))}

        <View wrap={false} style={{ marginTop: 12 }}>
          <Text style={s.h3}>À la coupe</Text>
          {wines.sparklingByGlass.map((w) => (
            <View key={w.name} style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: LINE }]}>
              <Text style={s.rowName}>
                <WineName name={w.name} />
              </Text>
              <Text style={s.price}>{euro(w.price)}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.h2, { marginTop: 20 }]} minPresenceAhead={80}>
          En bouteille
        </Text>
        {COLOURS.map((c) => {
          const list = wines.bottles.filter((b) => b.colour === c.key);
          if (!list.length) return null;
          const regions = new Map<string, Wine[]>();
          for (const b of list) regions.set(b.region, [...(regions.get(b.region) ?? []), b]);
          const single = regions.size === 1;
          return (
            <View key={c.key} style={{ marginTop: 12 }}>
              <Text style={s.h3} minPresenceAhead={60}>
                {c.title}
              </Text>
              {[...regions.entries()].map(([region, items]) => (
                <View key={region}>
                  {single ? null : (
                    <Text style={s.region} minPresenceAhead={30}>
                      {region}
                    </Text>
                  )}
                  {items.map((w, i) => (
                    <View key={`${w.name}-${i}`} style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: LINE }]} wrap={false}>
                      <Text style={s.rowName}>
                        <WineName name={w.name} />
                        {w.format ? <Text style={[s.soft, { fontStyle: "italic" }]}>{`, ${w.format}`}</Text> : null}
                      </Text>
                      <Text style={s.price}>{euro(w.price)}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          );
        })}
        <Text style={{ marginTop: 14 }}>{wines.note}</Text>
      </Page>
    </Document>
  );
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  // The round navy logo, rasterised once (react-pdf images are PNG/JPEG).
  const logo = await sharp(join(root, "public", "brand", "logo-comme-avant.svg"), { density: 300 }).resize(480, 480).png().toBuffer();
  const carte = join(outDir, "carte-comme-avant.pdf");
  const vins = join(outDir, "vins-comme-avant.pdf");
  await renderToFile(<CarteDocument logo={logo} />, carte);
  await renderToFile(<WinesDocument logo={logo} />, vins);
  console.log(`PDF written: ${carte}\nPDF written: ${vins}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
