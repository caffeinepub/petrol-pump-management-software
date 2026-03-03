import { Bell, HelpCircle, Info, Settings, Shield } from "lucide-react";
import React from "react";

const sections = [
  {
    icon: Settings,
    title: "Settings",
    description:
      "Configure application preferences, display options, and regional settings.",
  },
  {
    icon: Bell,
    title: "Notifications",
    description:
      "Manage alert preferences for low stock, pending invoices, and staff updates.",
  },
  {
    icon: Shield,
    title: "Security",
    description:
      "Review access control, manage user roles, and audit login activity.",
  },
  {
    icon: HelpCircle,
    title: "Help & Support",
    description:
      "Browse documentation, FAQs, and contact support for assistance.",
  },
  {
    icon: Info,
    title: "About",
    description:
      "View application version, license information, and release notes.",
  },
];

export default function Other() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Other</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Additional settings, help resources, and application information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <div
            key={section.title}
            className="bg-card border rounded-lg p-5 flex flex-col gap-3 hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-primary/10">
                <section.icon className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">
                {section.title}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {section.description}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-muted/40 border rounded-lg p-4 text-center">
        <p className="text-xs text-muted-foreground">
          Built with love using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "fuelstation-manager")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
