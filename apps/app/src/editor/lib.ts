import type { Project } from "./model/schema";

/** Key of the tag design; models built for one key do not fit another. */
export const designKey = (project: Project) => JSON.stringify(project.tag);

/** `Ctrl` on Windows and Linux, `⌘` on macOS. */
export const isMod = (event: { ctrlKey: boolean; metaKey: boolean }) =>
  event.ctrlKey || event.metaKey;

/** Whether a keyboard event belongs to a text field, a menu or a dialog. */
export function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

/** Russian plural form for a count: 1 бирка, 2 бирки, 5 бирок. */
export function plural(count: number, one: string, few: string, many: string) {
  const ten = count % 10;
  const hundred = count % 100;
  if (ten === 1 && hundred !== 11) return one;
  return ten >= 2 && ten <= 4 && (hundred < 12 || hundred > 14) ? few : many;
}

/** "1 из 3" for the pager; an empty batch still shows one tag. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function downloadText(text: string, filename: string) {
  downloadBlob(new Blob([text], { type: "application/json" }), filename);
}
