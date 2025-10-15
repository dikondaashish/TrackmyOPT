"use client";
import { LayoutDashboard, Calendar, Clock, FileText, Settings, HelpCircle, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Calendar, label: "OPT Dates", active: false },
    { icon: Clock, label: "Clock Tracker", active: false },
    { icon: FileText, label: "Documents", active: false },
    { icon: Settings, label: "Settings", active: false },
    { icon: HelpCircle, label: "Help", active: false },
  ];

  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with Logo and Collapse Button */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white">🔷</span>
          </div>
          {!collapsed && <span className="font-semibold">TrackMyOPT</span>}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-8 h-8 rounded-lg hover:bg-sidebar-accent flex items-center justify-center transition-colors"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Expand Button (shown when collapsed) */}
      {collapsed && (
        <div className="px-4 py-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full h-10 rounded-lg hover:bg-sidebar-accent flex items-center justify-center transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              item.active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm flex-shrink-0" title={collapsed ? "dikondaashish@gmail.com" : undefined}>
            DA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">dikondaashish@gmail.com</p>
            </div>
          )}
        </div>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="text-sm">Sign Out</span>}
        </button>
      </div>
    </div>
  );
}

