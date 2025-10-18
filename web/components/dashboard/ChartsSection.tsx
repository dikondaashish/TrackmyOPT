"use client";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const pieData = [
  { name: "Active Days", value: 365, color: "#3b82f6" },
  { name: "Unemployment Days", value: 0, color: "#ef4444" },
];

const lineData = [
  { day: "Mon", days: 0 },
  { day: "Tue", days: 0 },
  { day: "Wed", days: 0 },
  { day: "Thu", days: 0 },
  { day: "Fri", days: 0 },
  { day: "Sat", days: 0 },
  { day: "Sun", days: 0 },
];

export function ChartsSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-card hover:bg-card/80 border border-border rounded-xl p-6 transition-colors duration-200">
        <div className="mb-4">
          <h3 className="mb-1 font-semibold text-lg">OPT Status Distribution</h3>
          <p className="text-sm text-muted-foreground">Current status of your OPT period</p>
        </div>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span className="text-sm text-muted-foreground">Unemployed</span>
          </div>
        </div>
      </div>

      <div className="bg-card hover:bg-card/80 border border-border rounded-xl p-6 transition-colors duration-200">
        <div className="mb-4">
          <h3 className="mb-1 font-semibold text-lg">Unemployment Tracking</h3>
          <p className="text-sm text-muted-foreground">Last 7 days unemployment status</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-6 transition-colors duration-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h3 className="mb-2 font-semibold text-lg text-amber-900 dark:text-amber-100">Stay Compliant</h3>
            <p className="text-sm text-amber-800 dark:text-amber-200/80">
              All tools are designed to help you track and manage your OPT requirements. 
              Always consult with your DSO for official guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

