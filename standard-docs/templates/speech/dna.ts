/**
 * STANDARD — Speech DNA Engine (offline)
 *
 * Measured style fingerprinting, comparison, and template synthesis.
 * No network, no model: every number here is computed from the text.
 *
 *  measure(text, lang)      -> StyleFingerprint (rhythm, vocabulary,
 *                              formality, devices, structure, signatures)
 *  compare(a, b)            -> per-dimension similarity + overall match %
 *  generateInStyle(fp,...)  -> offline template synthesis steered by the
 *                              fingerprint (sentence length, formality,
 *                              triads, signature phrases)
 *
 * The generative step is honest about what it is: measured template
 * synthesis. A cloud/LLM provider layer is a deliberate, gated add-on
 * (kept off the default path, mirroring the Task 4 translation gate).
 */

export type Lang = "en" | "ar";

export interface StyleFingerprint {
  lang: Lang;
  words: number;
  sentences: number;
  avgSentenceLen: number;   // words per sentence
  sentenceStd: number;      // rhythm variance
  shortPct: number;         // sentences under 8 words
  longPct: number;          // sentences over 25 words
  ttr: number;              // type-token ratio (vocabulary richness), 0..1
  formalityPer1k: number;   // honorific/formal markers per 1000 words
  triadsPer1k: number;      // "x, y, and z" constructions per 1000 words
  anaphoraPairs: number;    // consecutive sentences sharing an opener
  questionsPct: number;     // % sentences that are questions
  signatures: string[];     // repeated characteristic phrases (n-grams)
}

const EN_FORMAL = ["excellencies", "excellency", "distinguished", "honour", "honor", "esteemed", "highness", "majesty", "hereby", "ladies and gentlemen", "on behalf of"];
const AR_FORMAL = ["أصحاب", "سعادة", "معالي", "سمو", "الموقر", "المحترم", "حضرات", "السادة", "بالنيابة"];
const EN_STOP = new Set("the a an and or of to in on for with we our is are be this that it as by at from will shall".split(" "));
const AR_STOP = new Set("في من على إلى عن أن و هذا هذه الذي التي مع كما لقد قد هو هي نحن".split(" "));

function stripMarkup(t: string): string {
  return t.replace(/\*\*/g, "").replace(/^\s*[-*•–]\s+/gm, "").replace(/\s+/g, " ").trim();
}

function splitSentences(t: string): string[] {
  return t.split(/(?<=[.!?؟…])\s+|\n+/).map((s) => s.trim()).filter((s) => s.length > 1);
}

function tokenize(t: string): string[] {
  const m = t.toLowerCase().match(/[a-z؀-ۿ][a-z؀-ۿ'’-]*/g);
  return m || [];
}

export function measure(rawText: string, lang: Lang): StyleFingerprint {
  const text = stripMarkup(rawText);
  const sentences = splitSentences(text);
  const words = tokenize(text);
  const lens = sentences.map((s) => tokenize(s).length).filter((n) => n > 0);
  const n = lens.length || 1;
  const avg = lens.reduce((a, b) => a + b, 0) / n;
  const std = Math.sqrt(lens.reduce((a, b) => a + (b - avg) ** 2, 0) / n);

  // vocabulary richness on a capped sample so long texts compare fairly
  const sample = words.slice(0, 800);
  const ttr = sample.length ? new Set(sample).size / sample.length : 0;

  const lower = text.toLowerCase();
  const markers = (lang === "ar" ? AR_FORMAL : EN_FORMAL).reduce((acc, m) => {
    let i = 0, c = 0;
    while ((i = lower.indexOf(m, i)) !== -1) { c++; i += m.length; }
    return acc + c;
  }, 0);

  const triadRe = lang === "ar"
    ? /،\s*[^،.؟]+\s*و[؀-ۿ]/g
    : /,\s*[^,.;?]+,?\s+and\s+/gi;
  const triads = (text.match(triadRe) || []).length;

  let anaphora = 0;
  for (let i = 1; i < sentences.length; i++) {
    const a = tokenize(sentences[i - 1])[0];
    const b = tokenize(sentences[i])[0];
    if (a && b && a === b) anaphora++;
  }

  const questions = sentences.filter((s) => /[?؟]\s*$/.test(s)).length;

  // signature phrases: bigrams/trigrams repeated 2+ times, not all stopwords
  const stop = lang === "ar" ? AR_STOP : EN_STOP;
  const grams = new Map<string, number>();
  for (let g = 2; g <= 3; g++) {
    for (let i = 0; i + g <= words.length; i++) {
      const slice = words.slice(i, i + g);
      if (slice.every((w) => stop.has(w))) continue;
      const key = slice.join(" ");
      grams.set(key, (grams.get(key) || 0) + 1);
    }
  }
  const ranked = [...grams.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length);
  const signatures: string[] = [];
  for (const [k] of ranked) {
    if (signatures.length >= 6) break;
    // skip fragments that are substrings of (or contain) an already-kept phrase
    if (signatures.some((s) => s.includes(k) || k.includes(s))) continue;
    signatures.push(k);
  }

  const per1k = (c: number) => (words.length ? (c * 1000) / words.length : 0);

  return {
    lang,
    words: words.length,
    sentences: n,
    avgSentenceLen: round(avg),
    sentenceStd: round(std),
    shortPct: round((lens.filter((l) => l < 8).length / n) * 100),
    longPct: round((lens.filter((l) => l > 25).length / n) * 100),
    ttr: round(ttr),
    formalityPer1k: round(per1k(markers)),
    triadsPer1k: round(per1k(triads)),
    anaphoraPairs: anaphora,
    questionsPct: round((questions / n) * 100),
    signatures,
  };
}

function round(x: number): number { return Math.round(x * 100) / 100; }

// ---------- comparison ----------

export interface DnaTrace {
  dimensions: Array<{ key: string; label: string; source: number; generated: number; score: number }>;
  signatureOverlap: number; // 0..100
  overall: number;          // 0..100
}

function sim(a: number, b: number): number {
  const hi = Math.max(Math.abs(a), Math.abs(b), 0.0001);
  return Math.max(0, Math.round((1 - Math.abs(a - b) / hi) * 100));
}

export function compare(src: StyleFingerprint, gen: StyleFingerprint): DnaTrace {
  const dims = [
    { key: "rhythm", label: "Rhythm (avg sentence length)", source: src.avgSentenceLen, generated: gen.avgSentenceLen },
    { key: "variety", label: "Rhythm variety (std dev)", source: src.sentenceStd, generated: gen.sentenceStd },
    { key: "vocabulary", label: "Vocabulary richness (TTR)", source: src.ttr, generated: gen.ttr },
    { key: "formality", label: "Formality markers /1k words", source: src.formalityPer1k, generated: gen.formalityPer1k },
    { key: "devices", label: "Triads /1k words", source: src.triadsPer1k, generated: gen.triadsPer1k },
    { key: "questions", label: "Questions %", source: src.questionsPct, generated: gen.questionsPct },
  ].map((d) => ({ ...d, score: sim(d.source, d.generated) }));

  const a = new Set(src.signatures), b = new Set(gen.signatures);
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size || 1;
  const signatureOverlap = Math.round((inter / union) * 100);

  const overall = Math.round(
    (dims.reduce((acc, d) => acc + d.score, 0) + signatureOverlap) / (dims.length + 1)
  );
  return { dimensions: dims, signatureOverlap, overall };
}

// ---------- offline synthesis steered by the fingerprint ----------

interface GenOpts { topic: string; lang: Lang; targetWords?: number }

const T = {
  en: {
    salHigh: "Excellencies, Distinguished Guests, Ladies and Gentlemen,",
    salLow: "Dear colleagues and friends,",
    open: (t: string) => `It is a privilege to speak with you today about ${t}.`,
    bodyLong: (t: string) => [
      `When we consider ${t}, we are considering not a single question but a chain of responsibilities that connects every institution represented in this room to the communities that depend upon our judgement.`,
      `The record before us is clear, and it asks for a response that is equal to the moment — deliberate in its design, honest in its measurement, and steady in its delivery.`,
    ],
    bodyShort: (t: string) => [
      `${capitalize(t)} demands clarity.`, `It demands resolve.`, `And it demands that we act together.`,
      `The evidence is before us.`, `The path is known.`, `What remains is will.`,
    ],
    triad: (t: string) => `We will meet ${t} with clarity, with commitment, and with resolve.`,
    question: (t: string) => `What does ${t} ask of us — and are we prepared to answer?`,
    close: "Thank you.",
  },
  ar: {
    salHigh: "أصحاب المعالي والسعادة، الحضور الكرام،",
    salLow: "الزملاء والأصدقاء الأعزاء،",
    open: (t: string) => `إنه لشرف لي أن أتحدث إليكم اليوم عن ${t}.`,
    bodyLong: (t: string) => [
      `حين نتأمل ${t}، فإننا لا نتأمل مسألة واحدة، بل سلسلة من المسؤوليات التي تربط كل مؤسسة ممثلة في هذه القاعة بالمجتمعات التي تعتمد على حكمتنا.`,
      `إن الوقائع الماثلة أمامنا واضحة، وهي تتطلب استجابة ترقى إلى مستوى اللحظة — مدروسة في تصميمها، صادقة في قياسها، ثابتة في تنفيذها.`,
    ],
    bodyShort: (t: string) => [
      `${t} يتطلب الوضوح.`, `ويتطلب العزيمة.`, `ويتطلب أن نعمل معاً.`,
      `الأدلة أمامنا.`, `والطريق معروف.`, `وما يتبقى هو الإرادة.`,
    ],
    triad: (t: string) => `سنواجه ${t} بوضوحٍ، وبالتزامٍ، وبعزيمةٍ راسخة.`,
    question: (t: string) => `ماذا يطلب منا ${t} — وهل نحن مستعدون للإجابة؟`,
    close: "شكراً لكم.",
  },
};

function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

export function generateInStyle(fp: StyleFingerprint, opts: GenOpts): string {
  const t = T[opts.lang];
  const paras: string[] = [];

  paras.push(fp.formalityPer1k >= 2 ? t.salHigh : t.salLow);
  paras.push(t.open(opts.topic));

  // rhythm steering: long-sentence source -> flowing paragraphs; short -> punchy
  if (fp.avgSentenceLen >= 16) paras.push(...t.bodyLong(opts.topic));
  else paras.push(t.bodyShort(opts.topic).join(" "));

  if (fp.triadsPer1k >= 1) paras.push(t.triad(opts.topic));
  if (fp.questionsPct >= 5) paras.push(t.question(opts.topic));

  // weave up to two signature phrases — only ones that read as complete
  // units (no leading/trailing stopword), so the carrier sentence stays natural
  const stop = opts.lang === "ar" ? AR_STOP : EN_STOP;
  const clean = (s: string) => {
    const w = s.split(" ");
    return w.length > 0 && !stop.has(w[0]) && !stop.has(w[w.length - 1]);
  };
  const sigs = fp.signatures.filter(clean).slice(0, 2);
  if (sigs.length && opts.lang === "en") {
    paras.push(`Because in the end this is about ${sigs[0]}${sigs[1] ? `, and about ${sigs[1]}` : ""} — the words we return to because they carry the work.`);
  } else if (sigs.length && opts.lang === "ar") {
    paras.push(`لأن الأمر في جوهره يتعلق بـ${sigs[0]}${sigs[1] ? `، وبـ${sigs[1]}` : ""} — وهي العبارات التي نعود إليها لأنها تحمل جوهر العمل.`);
  }

  paras.push(t.close);

  // rough length control: trim optional middle paragraphs if far over target
  const target = opts.targetWords || 220;
  let out = paras;
  while (out.length > 4 && tokenize(out.join(" ")).length > target * 1.5) {
    out = out.slice(0, 2).concat(out.slice(3));
  }
  return out.join("\n\n");
}

export default { measure, compare, generateInStyle };
