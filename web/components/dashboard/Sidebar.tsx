"use client";
import { LayoutDashboard, Calendar, Clock, FileText, Settings, HelpCircle, LogOut } from "lucide-react";

export function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Calendar, label: "OPT Dates", active: false },
    { icon: Clock, label: "Clock Tracker", active: false },
    { icon: FileText, label: "Documents", active: false },
    { icon: Settings, label: "Settings", active: false },
    { icon: HelpCircle, label: "Help", active: false },
  ];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white">🔷</span>
          </div>
          <span>TrackMyOPT</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm">
            DA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm truncate">dikondaashish@gmail.com</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </button>
      </div>
    </div>
  );
}

