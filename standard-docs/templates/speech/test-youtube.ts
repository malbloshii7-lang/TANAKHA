/**
 * STANDARD — YouTube extractor offline self-test (no network, no key)
 *
 * Injects a fixture getter (the same injected-callable pattern the
 * reference tool uses) and verifies: URL parsing, caption-track choice
 * (manual over ASR, preferred language), json3 parsing, XML fallback,
 * and the no-captions error path.
 *
 *   npx ts-node templates/speech/test-youtube.ts
 */

import { extractVideoId, fetchTranscript, Getter } from "./youtube";

let failures = 0;
function check(name: string, cond: boolean, extra?: string) {
  console.log(`${cond ? "✓" : "✗"} ${name}${!cond && extra ? " — " + extra : ""}`);
  if (!cond) failures++;
}

const LONG = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");

function watchHtml(tracks: any[]): string {
  return `<html><head><title>Test Speech - YouTube</title></head><body>
    var x = {"captionTracks":${JSON.stringify(tracks)},"audioTracks":[]};</body></html>`;
}

const JSON3 = JSON.stringify({
  events: [
    { segs: [{ utf8: "It is a distinct honor " }, { utf8: "to join you today. " }] },
    { segs: [{ utf8: LONG }] },
  ],
});

(async () => {
  console.log("── YouTube extractor self-test (offline fixtures) ──");

  // 1. URL forms
  check("watch?v= URL", extractVideoId("https://www.youtube.com/watch?v=WZyRbnpGyzQ") === "WZyRbnpGyzQ");
  check("youtu.be URL", extractVideoId("https://youtu.be/WZyRbnpGyzQ") === "WZyRbnpGyzQ");
  check("shorts URL", extractVideoId("https://www.youtube.com/shorts/WZyRbnpGyzQ") === "WZyRbnpGyzQ");
  check("garbage rejected", extractVideoId("https://example.com/nope") === null);

  // 2. manual track preferred over ASR; json3 parsing; title cleanup
  const tracks = [
    { languageCode: "en", kind: "asr", baseUrl: "https://x/asr" },
    { languageCode: "en", baseUrl: "https://x/manual" },
    { languageCode: "ar", baseUrl: "https://x/ar" },
  ];
  let fetched: string[] = [];
  const getter: Getter = async (u) => {
    fetched.push(u);
    if (u.includes("watch")) return watchHtml(tracks);
    return JSON3;
  };
  const r = await fetchTranscript("https://youtu.be/WZyRbnpGyzQ", "en", getter);
  check("manual EN track chosen over ASR", fetched.some((u) => u.startsWith("https://x/manual")), fetched.join(", "));
  check("json3 text extracted", r.text.startsWith("It is a distinct honor to join you today."));
  check("title cleaned", r.title === "Test Speech", r.title);
  check("word count sane", r.words > 40, String(r.words));

  // 3. Arabic preference picks the ar track
  fetched = [];
  await fetchTranscript("https://youtu.be/WZyRbnpGyzQ", "ar", getter);
  check("AR preference picks ar track", fetched.some((u) => u.startsWith("https://x/ar")), fetched.join(", "));

  // 4. XML fallback when track ignores fmt=json3
  const xmlGetter: Getter = async (u) =>
    u.includes("watch") ? watchHtml([{ languageCode: "en", baseUrl: "https://x/xml" }])
      : `<transcript><text start="0">Hello colleagues and friends</text><text start="2">${LONG}</text></transcript>`;
  const rx = await fetchTranscript("https://youtu.be/WZyRbnpGyzQ", "en", xmlGetter);
  check("XML fallback parsed", rx.text.includes("Hello colleagues and friends"));

  // 5. no captions -> clean error
  let msg = "";
  try { await fetchTranscript("https://youtu.be/WZyRbnpGyzQ", "en", async () => "<html><title>x</title></html>"); }
  catch (e: any) { msg = e.message; }
  check("no-captions error is actionable", /No captions found/.test(msg), msg);

  console.log(failures === 0 ? "\nALL CHECKS PASSED (offline)" : `\n${failures} CHECK(S) FAILED`);
  process.exit(failures ? 1 : 0);
})();
