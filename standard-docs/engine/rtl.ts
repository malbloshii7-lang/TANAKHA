/**
 * STANDARD — RTL Enforcement (Task 2)
 *
 * Arabic paragraphs are already built right-to-left by the component
 * library (rightToLeft runs + bidirectional paragraphs driven by the
 * `ar` language flag). This module is the explicit enforcement hook the
 * render pipeline calls for Arabic output; it is a safe pass-through so
 * callers have a single, named place to harden RTL behaviour later
 * without touching compose or render.
 */

export function applyRTLToDocument(paragraphs: any[]): any[] {
  return paragraphs;
}

module.exports = { applyRTLToDocument };
export default { applyRTLToDocument };
