"use client";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Shield, TrendingUp, Calendar } from "lucide-react";

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">OPT Status Distribution</h3>
          </div>
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
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-muted-foreground font-medium">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-muted-foreground font-medium">Unemployed</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground">Unemployment Tracking</h3>
          </div>
          <p className="text-sm text-muted-foreground">Last 7 days unemployment status</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="days" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all duration-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Stay Compliant</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All tools are designed to help you track and manage your OPT requirements. 
              Always consult with your DSO for official guidance and stay informed about 
              the latest immigration policies.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">DSO Consultation</span>
              <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">Policy Updates</span>
              <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">Compliance Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

