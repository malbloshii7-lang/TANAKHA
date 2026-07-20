/**
 * STANDARD — YouTube transcript extraction (the ONE online step)
 *
 * Fetches a video's caption track server-side (no API key, no browser CORS)
 * and returns plain transcript text for the DNA fingerprint flow.
 *
 * Boundary: this module is the only place in the suite that touches the
 * network, and only youtube.com. If the machine is offline or the video
 * has no captions, it fails cleanly and the user pastes a transcript
 * instead. Honors HTTPS_PROXY via undici's ProxyAgent when present.
 */

const { fetch: ufetch, ProxyAgent } = require("undici");

const dispatcher = process.env.HTTPS_PROXY || process.env.https_proxy
  ? new ProxyAgent(process.env.HTTPS_PROXY || process.env.https_proxy)
  : undefined;

/** Real network getter. Tests inject a fixture getter instead (same
 *  pattern as the reference tool's injected `complete` callable). */
export type Getter = (url: string) => Promise<string>;

const realGet: Getter = (url) =>
  ufetch(url, {
    dispatcher,
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "accept-language": "en,ar;q=0.8",
    },
  }).then((r: any) => {
    if (!r.ok) throw new Error(`HTTP ${r.status} from YouTube`);
    return r.text();
  }).catch((e: any) => {
    if (e && /fetch failed|cancelled|ENOTFOUND|ECONNREFUSED|403/i.test(String(e.message) + String(e.cause?.message))) {
      throw new Error("Could not reach YouTube from this machine (offline, or the network blocks it). Paste the transcript instead.");
    }
    throw e;
  });

export function extractVideoId(url: string): string | null {
  const m = String(url || "").match(
    /(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|live\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

export interface Extracted {
  videoId: string;
  title: string;
  trackLang: string;
  text: string;
  words: number;
}

/** Pick the best caption track: preferred lang > en > first available. */
function pickTrack(tracks: any[], pref: string): any {
  const by = (fn: (t: any) => boolean) => tracks.find(fn);
  return (
    by((t) => t.languageCode === pref && t.kind !== "asr") ||
    by((t) => t.languageCode === pref) ||
    by((t) => t.languageCode === "en" && t.kind !== "asr") ||
    by((t) => t.languageCode === "en") ||
    tracks[0]
  );
}

export async function fetchTranscript(url: string, prefLang: string, get: Getter = realGet): Promise<Extracted> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("That does not look like a YouTube link.");

  const html = await get(`https://www.youtube.com/watch?v=${videoId}&hl=en`);

  const titleM = html.match(/<title>(.*?)<\/title>/s);
  const title = titleM
    ? titleM[1].replace(/\s*-\s*YouTube\s*$/i, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim()
    : videoId;

  const tracksM = html.match(/"captionTracks":(\[.*?\])(?=,")/s);
  if (!tracksM) {
    throw new Error("No captions found on this video (private, region-locked, or captions disabled). Paste the transcript instead.");
  }
  let tracks: any[];
  try { tracks = JSON.parse(tracksM[1]); }
  catch { throw new Error("Could not read the caption list from YouTube — paste the transcript instead."); }
  if (!tracks.length) throw new Error("This video has no caption tracks. Paste the transcript instead.");

  const track = pickTrack(tracks, prefLang);
  const base = track.baseUrl.replace(/\\u0026/g, "&");
  const json = await get(base + (base.includes("fmt=") ? "" : "&fmt=json3"));

  let text = "";
  try {
    const data = JSON.parse(json);
    text = (data.events || [])
      .flatMap((e: any) => (e.segs || []).map((s: any) => s.utf8 || ""))
      .join("")
      .replace(/\s+/g, " ")
      .trim();
  } catch {
    // some tracks return XML regardless of fmt — strip tags
    text = json.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
  }
  if (!text || text.split(" ").length < 40) {
    throw new Error("The caption track was empty or too short to fingerprint. Paste the transcript instead.");
  }

  return { videoId, title, trackLang: track.languageCode, text, words: text.split(" ").length };
}

export default { extractVideoId, fetchTranscript };
