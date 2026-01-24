import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  Activity,
  Zap,
  Brain,
  CloudRain,
  Target,
} from "lucide-react";

export function Analytics() {
  // Operational Data
  const deliveryTrends = [
    { time: "00:00", completed: 12, inTransit: 8, pending: 5 },
    { time: "04:00", completed: 8, inTransit: 5, pending: 3 },
    { time: "08:00", completed: 45, inTransit: 25, pending: 15 },
    { time: "12:00", completed: 78, inTransit: 42, pending: 28 },
    { time: "16:00", completed: 95, inTransit: 38, pending: 22 },
    { time: "20:00", completed: 62, inTransit: 28, pending: 18 },
  ];

  const zonePerformance = [
    { zone: "Zone A3", demand: 145, drivers: 18, efficiency: 92 },
    { zone: "Zone B1", demand: 132, drivers: 15, efficiency: 88 },
    { zone: "Zone C2", demand: 128, drivers: 16, efficiency: 85 },
    { zone: "Zone D5", demand: 98, drivers: 12, efficiency: 90 },
    { zone: "Zone E2", demand: 115, drivers: 14, efficiency: 87 },
    { zone: "Zone F9", demand: 88, drivers: 10, efficiency: 84 },
  ];

  // Safety Data
  const fatigueData = [
    { day: "Mon", alerts: 12 },
    { day: "Tue", alerts: 15 },
    { day: "Wed", alerts: 22 },
    { day: "Thu", alerts: 18 },
    { day: "Fri", alerts: 28 },
    { day: "Sat", alerts: 32 },
    { day: "Sun", alerts: 25 },
  ];

  const incidentTypes = [
    { name: "Fatigue", value: 145, color: "#ef4444" },
    { name: "Speeding", value: 98, color: "#f97316" },
    { name: "Harsh Braking", value: 76, color: "#eab308" },
    { name: "Accidents", value: 23, color: "#dc2626" },
    { name: "Device Issues", value: 54, color: "#6366f1" },
  ];

  const incidentByZone = [
    { zone: "Zone A3", incidents: 45 },
    { zone: "Zone B1", incidents: 38 },
    { zone: "Zone C2", incidents: 52 },
    { zone: "Zone D5", incidents: 28 },
    { zone: "Zone E2", incidents: 35 },
    { zone: "Zone F9", incidents: 42 },
  ];

  // Predictive Data
  const demandForecast = [
    { hour: "Now", actual: 145, predicted: 145 },
    { hour: "+2h", actual: null, predicted: 168 },
    { hour: "+4h", actual: null, predicted: 198 },
    { hour: "+6h", actual: null, predicted: 225 },
    { hour: "+8h", actual: null, predicted: 185 },
    { hour: "+10h", actual: null, predicted: 152 },
    { hour: "+12h", actual: null, predicted: 128 },
  ];

  const driverEfficiency = [
    { name: "Ahmed Khan", score: 95, orders: 145 },
    { name: "Samuel Martinez", score: 94, orders: 138 },
    { name: "David Chen", score: 92, orders: 142 },
    { name: "L. Mathew", score: 89, orders: 128 },
    { name: "J. Francis", score: 88, orders: 125 },
  ];

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    trend,
  }: {
    title: string;
    value: string | number;
    change: string;
    icon: any;
    trend: "up" | "down";
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${trend === "up" ? "bg-green-100 dark:bg-green-900/20" : "bg-red-100 dark:bg-red-900/20"}`}>
          <Icon className={`w-5 h-5 ${trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
        </div>
        <Badge className={trend === "up" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}>
          {change}
          {trend === "up" ? <TrendingUp className="w-3 h-3 ml-1 inline" /> : <TrendingDown className="w-3 h-3 ml-1 inline" />}
        </Badge>
      </div>
      <p className="text-muted-foreground mb-1">{title}</p>
      <p className="text-foreground text-3xl">{value}</p>
    </Card>
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-foreground text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive fleet insights and predictive intelligence</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="operational" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="operational">Operational Analytics</TabsTrigger>
          <TabsTrigger value="safety">Safety Analytics</TabsTrigger>
          <TabsTrigger value="predictive">Predictive AI</TabsTrigger>
        </TabsList>

        {/* Operational Analytics */}
        <TabsContent value="operational" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Avg Delivery Time"
              value="24 min"
              change="-12%"
              icon={Clock}
              trend="up"
            />
            <StatCard
              title="Active Orders"
              value="342"
              change="+18%"
              icon={Package}
              trend="up"
            />
            <StatCard
              title="Driver Utilization"
              value="87%"
              change="+5%"
              icon={Users}
              trend="up"
            />
            <StatCard
              title="Pickup Delay"
              value="8 min"
              change="+15%"
              icon={AlertTriangle}
              trend="down"
            />
          </div>

          {/* Delivery Trends Chart */}
          <Card className="p-6">
            <h3 className="text-foreground mb-6">Order Fulfillment Trends (24 Hours)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={deliveryTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#22c55e" fill="#86efac" name="Completed" />
                <Area type="monotone" dataKey="inTransit" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="In Transit" />
                <Area type="monotone" dataKey="pending" stackId="1" stroke="#eab308" fill="#fde047" name="Pending" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Zone Performance */}
          <Card className="p-6">
            <h3 className="text-foreground mb-6">Zone-Level Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={zonePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="zone" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="demand" fill="#3b82f6" name="Demand" />
                <Bar yAxisId="left" dataKey="drivers" fill="#22c55e" name="Drivers" />
                <Bar yAxisId="right" dataKey="efficiency" fill="#a855f7" name="Efficiency %" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Driver Efficiency Table */}
          <Card className="p-6">
            <h3 className="text-foreground mb-4">Top Performing Drivers</h3>
            <div className="space-y-3">
              {driverEfficiency.map((driver, index) => (
                <div key={driver.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-foreground">{driver.name}</p>
                      <p className="text-muted-foreground">{driver.orders} orders completed</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-muted-foreground">Efficiency Score</p>
                      <p className="text-foreground text-xl">{driver.score}/100</p>
                    </div>
                    <div className="w-24 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-600"
                        style={{ width: `${driver.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Safety Analytics */}
        <TabsContent value="safety" className="space-y-6">
          {/* Safety Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              title="Total Incidents"
              value="396"
              change="+8%"
              icon={AlertTriangle}
              trend="down"
            />
            <StatCard
              title="Fatigue Alerts"
              value="145"
              change="+22%"
              icon={Activity}
              trend="down"
            />
            <StatCard
              title="Fleet Safety Score"
              value="89/100"
              change="+3%"
              icon={Target}
              trend="up"
            />
            <StatCard
              title="Accident Rate"
              value="0.8%"
              change="-15%"
              icon={Zap}
              trend="up"
            />
          </div>

          {/* Fatigue Trend */}
          <Card className="p-6">
            <h3 className="text-foreground mb-6">Fatigue Alert Trends (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={fatigueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={3} name="Fatigue Alerts" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-orange-500/10 dark:bg-orange-900/20 border border-orange-500/20 rounded-lg">
              <p className="text-orange-700 dark:text-orange-400">
                ⚠️ <strong>Spike Alert:</strong> Fatigue alerts increased 37% on Friday due to extended shift hours.
              </p>
            </div>
          </Card>

          {/* Incident Types */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-foreground mb-6">Incident Distribution by Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incidentTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incidentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-foreground mb-6">Incidents by Zone</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={incidentByZone}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="incidents" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Dangerous Behavior Metrics */}
          <Card className="p-6">
            <h3 className="text-foreground mb-4">Dangerous Behavior Metrics</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-red-500/10 dark:bg-red-900/20 rounded-lg border border-red-500/20">
                <p className="text-muted-foreground mb-2">Sudden Braking</p>
                <p className="text-foreground text-2xl">76 events</p>
                <p className="text-red-600 dark:text-red-400 mt-2">Zone C2 highest</p>
              </div>
              <div className="p-4 bg-orange-500/10 dark:bg-orange-900/20 rounded-lg border border-orange-500/20">
                <p className="text-muted-foreground mb-2">Speeding Events</p>
                <p className="text-foreground text-2xl">98 events</p>
                <p className="text-orange-600 dark:text-orange-400 mt-2">Peak at 6-8 PM</p>
              </div>
              <div className="p-4 bg-yellow-500/10 dark:bg-yellow-900/20 rounded-lg border border-yellow-500/20">
                <p className="text-muted-foreground mb-2">Phone Drops</p>
                <p className="text-foreground text-2xl">34 events</p>
                <p className="text-yellow-600 dark:text-yellow-400 mt-2">-12% from last week</p>
              </div>
              <div className="p-4 bg-purple-500/10 dark:bg-purple-900/20 rounded-lg border border-purple-500/20">
                <p className="text-muted-foreground mb-2">Camera Obstruction</p>
                <p className="text-foreground text-2xl">54 events</p>
                <p className="text-purple-600 dark:text-purple-400 mt-2">+8% increase</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Predictive AI */}
        <TabsContent value="predictive" className="space-y-6">
          {/* AI Insights Panel */}
          <Card className="p-6 bg-blue-500/10 border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-foreground">AI-Generated Insights</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-card rounded-lg border border-blue-500/20">
                <p className="text-foreground mb-2">
                  <strong>📈 Demand Forecast:</strong> Zone B demand will rise 37% between 6–8 PM. Deploy 5 more drivers.
                </p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-orange-500/20">
                <p className="text-foreground mb-2">
                  <strong>⚠️ Fatigue Risk:</strong> Driver fatigue increased 22% today due to heat index above 42°C.
                </p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-green-500/20">
                <p className="text-foreground mb-2">
                  <strong>💡 Optimization:</strong> You can reduce idle time by reassigning drivers from Zone D to Zone A.
                </p>
              </div>
              <div className="p-4 bg-card rounded-lg border border-red-500/20">
                <p className="text-foreground mb-2">
                  <strong>🚨 Safety Alert:</strong> Incident risk highest in Zone C due to traffic congestion spikes.
                </p>
              </div>
            </div>
          </Card>

          {/* Demand Forecast */}
          <Card className="p-6">
            <h3 className="text-foreground mb-6">Next 12-Hour Demand Prediction</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={demandForecast}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} name="Actual Demand" />
                <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={3} strokeDasharray="5 5" name="Predicted Demand" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Risk Predictions */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-foreground mb-4">High-Risk Zones (Next 4 Hours)</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-foreground">Zone C2</p>
                      <p className="text-muted-foreground">Traffic congestion</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">High Risk</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-foreground">Zone B1</p>
                      <p className="text-muted-foreground">High demand spike</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">Medium Risk</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-foreground">Zone E2</p>
                      <p className="text-muted-foreground">Weather conditions</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">Low Risk</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-foreground mb-4">Drivers at Risk of Fatigue</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="text-foreground">Omar Hassan</p>
                      <p className="text-muted-foreground">6.5 hrs continuous</p>
                    </div>
                  </div>
                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">Critical</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-foreground">Ahmed Khan</p>
                      <p className="text-muted-foreground">5.2 hrs continuous</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">High</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <p className="text-foreground">Raj Patel</p>
                      <p className="text-muted-foreground">4.1 hrs continuous</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">Medium</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Weather-Based Predictions */}
          <Card className="p-6">
            <h3 className="text-foreground mb-4">Weather-Based Demand Impact</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <CloudRain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <p className="text-foreground">Rain Expected</p>
                </div>
                <p className="text-muted-foreground mb-2">Tomorrow 2-4 PM</p>
                <p className="text-blue-700 dark:text-blue-400">+28% demand increase predicted</p>
              </div>
              <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  <p className="text-foreground">High Temperature</p>
                </div>
                <p className="text-muted-foreground mb-2">Today 12-3 PM (43°C)</p>
                <p className="text-orange-700 dark:text-orange-400">Fatigue risk elevated 45%</p>
              </div>
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                  <p className="text-foreground">Optimal Conditions</p>
                </div>
                <p className="text-muted-foreground mb-2">Evening 6-9 PM</p>
                <p className="text-green-700 dark:text-green-400">Peak performance window</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}