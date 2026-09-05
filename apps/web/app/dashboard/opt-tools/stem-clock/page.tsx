import { permanentRedirect } from "next/navigation";

export default function DashboardStemClockRedirect() {
  permanentRedirect("/tools/stem-clock");
}
