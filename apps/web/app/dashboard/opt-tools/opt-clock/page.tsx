import { permanentRedirect } from "next/navigation";

export default function DashboardOptClockRedirect() {
  permanentRedirect("/tools/opt-clock");
}
