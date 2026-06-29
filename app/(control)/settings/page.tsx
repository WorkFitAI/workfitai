import { ControlSettingsPageClient } from "@/components/control/settings/control-settings-page-client";

export const metadata = {
  title: "Settings | WorkfitAI",
  description: "Manage your notifications, privacy, and platform settings.",
};

export default function SettingsPage() {
  return <ControlSettingsPageClient />;
}
