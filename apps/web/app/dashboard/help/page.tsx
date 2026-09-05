import { permanentRedirect } from "next/navigation";

export default function DashboardHelpRedirect() {
  permanentRedirect("/help");
}
