"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, Circle, Plus, Trash2, Calendar, ChevronDown, ChevronUp } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  category: "employment" | "document" | "filing" | "general";
  createdAt: string;
}

const DEFAULT_REMINDERS: Omit<Reminder, "id" | "createdAt">[] = [
  { title: "Upload EAD card copy", completed: false, category: "document" },
  { title: "Update employer information", completed: false, category: "employment" },
  { title: "Review I-765 form", completed: false, category: "filing" },
  { title: "Set up email reminders", completed: false, category: "general" },
];

const CATEGORY_COLORS: Record<Reminder["category"], string> = {
  employment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  document: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  filing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

const CATEGORY_LABELS: Record<Reminder["category"], string> = {
  employment: "Employment",
  document: "Document",
  filing: "Filing",
  general: "General",
};

export function ActionableReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [newReminder, setNewReminder] = useState("");
  const [newCategory, setNewCategory] = useState<Reminder["category"]>("general");
  const [newDueDate, setNewDueDate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load reminders from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("opt-reminders");
    if (stored) {
      try {
        setReminders(JSON.parse(stored));
      } catch {
        // Initialize with default reminders if parsing fails
        const initialReminders = DEFAULT_REMINDERS.map((r, i) => ({
          ...r,
          id: `default-${i}`,
          createdAt: new Date().toISOString(),
        }));
        setReminders(initialReminders);
      }
    } else {
      // Initialize with default reminders
      const initialReminders = DEFAULT_REMINDERS.map((r, i) => ({
        ...r,
        id: `default-${i}`,
        createdAt: new Date().toISOString(),
      }));
      setReminders(initialReminders);
    }
    setIsLoaded(true);
  }, []);

  // Save reminders to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("opt-reminders", JSON.stringify(reminders));
    }
  }, [reminders, isLoaded]);

  const toggleReminder = useCallback((id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addReminder = useCallback(() => {
    if (!newReminder.trim()) return;

    const reminder: Reminder = {
      id: `reminder-${Date.now()}`,
      title: newReminder.trim(),
      completed: false,
      category: newCategory,
      dueDate: newDueDate || undefined,
      createdAt: new Date().toISOString(),
    };

    setReminders((prev) => [reminder, ...prev]);
    setNewReminder("");
    setNewDueDate("");
    setShowAddForm(false);
  }, [newReminder, newCategory, newDueDate]);

  const completedCount = reminders.filter((r) => r.completed).length;
  const totalCount = reminders.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const sortedReminders = [...reminders].sort((a, b) => {
    // Incomplete first, then by due date
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Action Items</h2>
            <p className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border">
          {/* Add new reminder form */}
          <div className="p-4 bg-muted/20">
            {showAddForm ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="What do you need to do?"
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addReminder()}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as Reminder["category"])}
                    className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="general">General</option>
                    <option value="employment">Employment</option>
                    <option value="document">Document</option>
                    <option value="filing">Filing</option>
                  </select>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addReminder}
                      disabled={!newReminder.trim()}
                      className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add new task
              </button>
            )}
          </div>

          {/* Reminders list */}
          <div className="max-h-80 overflow-y-auto">
            {sortedReminders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks yet. Add one above!</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {sortedReminders.map((reminder) => (
                  <li
                    key={reminder.id}
                    className={`group flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors ${
                      reminder.completed ? "opacity-60" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className="mt-0.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-full"
                      aria-label={reminder.completed ? "Mark as incomplete" : "Mark as complete"}
                    >
                      {reminder.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${
                          reminder.completed ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {reminder.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${CATEGORY_COLORS[reminder.category]}`}>
                          {CATEGORY_LABELS[reminder.category]}
                        </span>
                        {reminder.dueDate && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(reminder.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReminder(reminder.id)}
                      className="shrink-0 p-1 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-500 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500/50 rounded"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {completedCount > 0 && (
            <div className="p-3 border-t border-border bg-muted/20">
              <button
                onClick={() => setReminders((prev) => prev.filter((r) => !r.completed))}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear completed ({completedCount})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
