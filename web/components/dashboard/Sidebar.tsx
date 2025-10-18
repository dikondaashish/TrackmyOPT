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
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-20 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Header with Logo and Collapse Button */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold">🔷</span>
          </div>
          {!collapsed && (
            <div>
              <span className="font-bold text-sidebar-foreground text-lg">TrackMyOPT</span>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-8 h-8 rounded-lg hover:bg-sidebar-accent flex items-center justify-center transition-colors group"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />
          </button>
        )}
      </div>

      {/* Expand Button (shown when collapsed) */}
      {collapsed && (
        <div className="px-4 py-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full h-10 rounded-lg hover:bg-sidebar-accent flex items-center justify-center transition-colors group"
            aria-label="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-sidebar-foreground" />
          </button>
        </div>
      )}
      
      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className={`flex items-center gap-3 px-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium flex-shrink-0 shadow-sm" title={collapsed ? "dikondaashish@gmail.com" : undefined}>
            DA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">dikondaashish@gmail.com</p>
              <p className="text-xs text-muted-foreground">Premium User</p>
            </div>
          )}
        </div>
        <form action="/auth/signout" method="POST" className="w-full">
          <button 
            type="submit"
            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200 group ${
              collapsed ? 'justify-center' : ''
            }`}
            title={collapsed ? "Sign Out" : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  );
}

