"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Eye, EyeOff, GripVertical, X, ChevronDown, ChevronUp } from "lucide-react";

export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "notifications", label: "Notifications", visible: true, order: 0 },
  { id: "metrics", label: "Key Metrics", visible: true, order: 1 },
  { id: "quickactions", label: "Quick Actions", visible: true, order: 2 },
  { id: "casestatus", label: "Case Status", visible: true, order: 3 },
  { id: "deadlines", label: "Upcoming Deadlines", visible: true, order: 4 },
  { id: "tips", label: "Personalized Tips", visible: true, order: 5 },
  { id: "reminders", label: "Tasks & Reminders", visible: true, order: 6 },
  { id: "employment", label: "Employment History", visible: true, order: 7 },
  { id: "tools", label: "Your Toolkit", visible: true, order: 8 },
  { id: "charts", label: "Status Charts", visible: true, order: 9 },
  { id: "resources", label: "Resource Center", visible: false, order: 10 },
];

interface DashboardWidgetsProps {
  onConfigChange: (config: WidgetConfig[]) => void;
}

export function useDashboardWidgets() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-widgets-config");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new widgets
        const merged = DEFAULT_WIDGETS.map((defaultWidget) => {
          const storedWidget = parsed.find((w: WidgetConfig) => w.id === defaultWidget.id);
          return storedWidget || defaultWidget;
        });
        setWidgets(merged.sort((a, b) => a.order - b.order));
      } catch {
        setWidgets(DEFAULT_WIDGETS);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("dashboard-widgets-config", JSON.stringify(widgets));
    }
  }, [widgets, isLoaded]);

  const toggleWidget = useCallback((id: string) => {
    setWidgets((prev) =>
      prev.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w))
    );
  }, []);

  const moveWidget = useCallback((id: string, direction: "up" | "down") => {
    setWidgets((prev) => {
      const index = prev.findIndex((w) => w.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newWidgets = [...prev];
      const [removed] = newWidgets.splice(index, 1);
      newWidgets.splice(newIndex, 0, removed);
      
      return newWidgets.map((w, i) => ({ ...w, order: i }));
    });
  }, []);

  const resetToDefaults = useCallback(() => {
    setWidgets(DEFAULT_WIDGETS);
  }, []);

  const isWidgetVisible = useCallback(
    (id: string) => widgets.find((w) => w.id === id)?.visible ?? true,
    [widgets]
  );

  const getVisibleWidgets = useCallback(
    () => widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order),
    [widgets]
  );

  return {
    widgets,
    toggleWidget,
    moveWidget,
    resetToDefaults,
    isWidgetVisible,
    getVisibleWidgets,
    isLoaded,
  };
}

export function DashboardWidgetsSettings({
  widgets,
  onToggle,
  onMove,
  onReset,
  onClose,
}: {
  widgets: WidgetConfig[];
  onToggle: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Customize Dashboard</h2>
              <p className="text-xs text-muted-foreground">Show, hide, or reorder widgets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widget List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                widget.visible ? "bg-muted/30" : "opacity-50"
              }`}
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${!widget.visible && "text-muted-foreground"}`}>
                  {widget.label}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onMove(widget.id, "up")}
                  disabled={index === 0}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMove(widget.id, "down")}
                  disabled={index === widgets.length - 1}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onToggle(widget.id)}
                  className={`p-1.5 rounded transition-colors ${
                    widget.visible
                      ? "text-primary hover:bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  title={widget.visible ? "Hide widget" : "Show widget"}
                >
                  {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <button
            onClick={onReset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset to defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardCustomizeButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-lg transition-colors"
      title="Customize dashboard"
    >
      <Settings className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Customize</span>
    </button>
  );
}
