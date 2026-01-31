import { redirect } from "next/navigation";
import { DEFAULT_SEASON } from "@/src/domain";

const DEFAULT_TAB = "standings";

export default function LeaguePage() {
  redirect(`/league/1/season/${DEFAULT_SEASON}/${DEFAULT_TAB}`);
}
