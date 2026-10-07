import { applyStatus } from "@/lib/apply-status";
import { statusData } from "@/lib/data";
import { computeStatus } from "@/lib/status";
import { InlineScript } from "./InlineScript";

// Place right after the elements that show the status: they get their live text before first paint.
export function StatusScript() {
  const html = `try{(${applyStatus.toString()})((${computeStatus.toString()})(${JSON.stringify(statusData)},Date.now()))}catch(e){}`;
  return <InlineScript html={html} />;
}
