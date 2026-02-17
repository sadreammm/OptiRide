import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from "recharts";
import { TrendingUp, TrendingDown, Package, Clock, Users, MapPin, AlertTriangle, Activity, Zap, Brain, CloudRain, Target, } from "lucide-react";
import {
  useDriversSummary,
  useDashboardOverview,
  useRealtimeMetrics,
  useFleetDashboardCharts,
  useSafetyAlerts,
  usePolling,
  useAlertsSummary,
  useSafetyScore,
  useTopPerformers,
  useDemandForecast
} from "@/utils/hooks/use-api";

export function Analytics() {
  // API Data - Dynamic from analytics service
  const { data: driversSummary, refetch: refetchDrivers } = useDriversSummary();
  const { data: dashboardOverview, refetch: refetchOverview } = useDashboardOverview('last_30_days');
  const { data: realtimeMetrics, refetch: refetchRealtime } = useRealtimeMetrics();
  const { data: fleetCharts, refetch: refetchCharts } = useFleetDashboardCharts();
  const { data: safetyAlerts, refetch: refetchAlerts } = useSafetyAlerts();

  // NEW: Backend-calculated aggregated analytics (using 30d for consistency)
  const { data: alertsSummary, refetch: refetchAlertsSummary } = useAlertsSummary('last_30_days');
  const { data: safetyScoreData, refetch: refetchSafetyScore } = useSafetyScore('last_30_days');
  const { data: topPerformers, refetch: refetchTopPerformers } = useTopPerformers('last_30_days', 5);
  const { data: demandForecast, refetch: refetchDemandForecast } = useDemandForecast(12);

  // Auto-refresh data every 10 seconds
  usePolling(() => {
    refetchDrivers();
    refetchOverview();
    refetchRealtime();
    refetchCharts();
    refetchAlerts();
    refetchAlertsSummary();
    refetchSafetyScore();
    refetchTopPerformers();
    refetchDemandForecast();
  }, 10000);

  // ============================================
  // DYNAMIC DATA - From Analytics Service
  // ============================================

  // Dashboard Overview metrics (from /analytics/dashboard)
  const totalOrders = dashboardOverview?.total_orders || 0;
  const completedOrders = dashboardOverview?.completed_orders || 0;
  const totalRevenue = dashboardOverview?.total_revenue || 0;
  const avgDeliveryTimeFromOverview = dashboardOverview?.avg_delivery_time_min || 0;
  const orderCompletionRate = dashboardOverview?.order_completion_rate || 0;
  const driverUtilizationRate = dashboardOverview?.driver_utilization_rate || 0;
  const totalSafetyAlerts = dashboardOverview?.total_safety_alerts || 0;
  const criticalAlerts = dashboardOverview?.critical_alerts || 0;

  // Trend percentages (from /analytics/dashboard)
  const ordersChangePct = dashboardOverview?.orders_change_percent || 0;
  const revenueChangePct = dashboardOverview?.revenue_change_percent || 0;
  const driversChangePct = dashboardOverview?.drivers_change_percent || 0;
  const completionRateChangePct = dashboardOverview?.completion_rate_change_percent || 0;
  const deliveryTimeChangePct = dashboardOverview?.delivery_time_change_percent || 0;

  // Realtime metrics (from /analytics/realtime) - Only used for active alerts count
  const activeAlertsCount = realtimeMetrics?.active_alerts || 0;

  // Driver metrics (from /drivers/stats/summary)
  const totalDrivers = driversSummary?.total_drivers || 0;
  const activeDrivers = (driversSummary?.available_drivers || 0) + (driversSummary?.busy_drivers || 0);
  const utilization = driverUtilizationRate || (totalDrivers > 0 ? Math.round((activeDrivers / totalDrivers) * 100) : 0);

  // Delivery Trends - Dynamic from fleet charts (from /analytics/fleet-charts)
  const deliveryTrends = (fleetCharts?.hourly_stats || []).map(stat => ({
    time: stat.time,
    completed: stat.completed || 0,
    inTransit: stat.ongoing || 0,
    pending: stat.cancelled || 0
  }));

  // Weekly Performance - Dynamic from fleet charts
  const zonePerformance = (fleetCharts?.weekly_stats || []).map(stat => ({
    zone: stat.day,
    demand: stat.total_orders || 0,
    drivers: stat.completed_orders || 0,
    efficiency: stat.efficiency || 0
  }));

  // ============================================
  // NEW: Backend-calculated safety metrics
  // ============================================

  // Safety Score - Now from backend calculation
  const safetyScore = safetyScoreData?.overall_score || 0;
  const safetyGrade = safetyScoreData?.grade || 'N/A';
  const safetyTrend = safetyScoreData?.trend || 'stable';
  const safetyTrendPct = safetyScoreData?.trend_percentage || 0;
  const accidentRate = safetyScoreData?.accident_rate || 0;
  const totalIncidents = safetyScoreData?.total_incidents || alertsSummary?.total_alerts || 0;
  const fatigueAlertsCount = safetyScoreData?.fatigue_alerts_count || 0;
  const speedingEvents = safetyScoreData?.speeding_events || 0;
  const harshBrakingEvents = safetyScoreData?.harsh_braking_events || 0;

  // Alerts Summary - Now from backend aggregation
  const incidentTypes = alertsSummary?.by_type?.length > 0
    ? alertsSummary.by_type.map((item, index) => ({
      name: item.alert_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()),
      value: item.count,
      color: ['#ef4444', '#f97316', '#eab308', '#dc2626', '#6366f1', '#22c55e'][index % 6]
    }))
    : [
      // Fallback hardcoded data if no alerts (for demo purposes)
      { name: "Fatigue", value: 145, color: "#ef4444" },
      { name: "Speeding", value: 98, color: "#f97316" },
      { name: "Harsh Braking", value: 76, color: "#eab308" },
      { name: "Accidents", value: 23, color: "#dc2626" },
      { name: "Device Issues", value: 54, color: "#6366f1" },
    ];

  // Alerts by day - Now from backend
  const fatigueData = alertsSummary?.by_day?.length > 0
    ? alertsSummary.by_day.map(item => ({
      day: item.day,
      alerts: item.count
    }))
    : [
      // Fallback hardcoded data if no alerts
      { day: "Mon", alerts: 12 },
      { day: "Tue", alerts: 15 },
      { day: "Wed", alerts: 22 },
      { day: "Thu", alerts: 18 },
      { day: "Fri", alerts: 28 },
      { day: "Sat", alerts: 32 },
      { day: "Sun", alerts: 25 },
    ];

  // Incidents by zone - Now from backend
  const incidentByZone = alertsSummary?.by_zone?.length > 0
    ? alertsSummary.by_zone.map(item => ({
      zone: item.zone_name || item.zone_id,
      incidents: item.count
    }))
    : [
      // Fallback hardcoded data
      { zone: "Zone A3", incidents: 45 },
      { zone: "Zone B1", incidents: 38 },
      { zone: "Zone C2", incidents: 52 },
      { zone: "Zone D5", incidents: 28 },
      { zone: "Zone E2", incidents: 35 },
      { zone: "Zone F9", incidents: 42 },
    ];

  // Top Performers - Now from backend
  const driverEfficiency = topPerformers?.drivers?.length > 0
    ? topPerformers.drivers.map(driver => ({
      name: driver.name,
      score: driver.efficiency_score,
      orders: driver.orders_completed
    }))
    : [
      // Fallback hardcoded data
      { name: "Ahmed Khan", score: 95, orders: 145 },
      { name: "Samuel Martinez", score: 94, orders: 138 },
      { name: "David Chen", score: 92, orders: 142 },
      { name: "L. Mathew", score: 89, orders: 128 },
      { name: "J. Francis", score: 88, orders: 125 },
    ];

  // Demand Forecast - Now from backend
  const demandForecastData = demandForecast?.forecasts?.length > 0
    ? demandForecast.forecasts.map(point => ({
      hour: point.hour,
      actual: point.actual,
      predicted: point.predicted
    }))
    : [
      { hour: "Now", actual: totalOrders || 145, predicted: totalOrders || 145 },
      { hour: "+2h", actual: null, predicted: 168 },
      { hour: "+4h", actual: null, predicted: 198 },
      { hour: "+6h", actual: null, predicted: 225 },
      { hour: "+8h", actual: null, predicted: 185 },
      { hour: "+10h", actual: null, predicted: 152 },
      { hour: "+12h", actual: null, predicted: 128 },
    ];

  // Helper to format change percentages - cap extreme values for display
  const formatChange = (val) => {
    // Cap at ±200% for display purposes
    const cappedVal = Math.max(-200, Math.min(200, val || 0));
    const absVal = Math.abs(cappedVal).toFixed(1);
    return cappedVal >= 0 ? `+${absVal}%` : `-${absVal}%`;
  };

  // Check if we have meaningful comparison data
  const hasComparisonData = Math.abs(ordersChangePct) < 500;

  const StatCard = ({ title, value, change, icon: Icon, trend, }) => {
    return (<Card className="p-6">
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
    </Card>)
  };
  return (<div className="space-y-6 p-6">
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
        {/* Key Metrics - Dynamic from analytics service */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Avg Delivery Time (30d)"
            value={`${avgDeliveryTimeFromOverview.toFixed(1)} min`}
            change={formatChange(-deliveryTimeChangePct)}
            icon={Clock}
            trend={deliveryTimeChangePct <= 0 ? "up" : "down"}
          />
          <StatCard
            title="Total Orders (30d)"
            value={totalOrders}
            change={formatChange(ordersChangePct)}
            icon={Package}
            trend={ordersChangePct >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Avg Utilization (30d)"
            value={`${driverUtilizationRate}%`}
            change={formatChange(driversChangePct)}
            icon={Users}
            trend={driversChangePct >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Completion Rate (30d)"
            value={`${orderCompletionRate.toFixed(1)}%`}
            change={formatChange(completionRateChangePct)}
            icon={AlertTriangle}
            trend={completionRateChangePct >= 0 ? "up" : "down"}
          />
        </div>

        {/* Delivery Trends Chart - Dynamic from /analytics/fleet-charts */}
        <Card className="p-6">
          <h3 className="text-foreground mb-6">Order Fulfillment Trends (24 Hours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={deliveryTrends.length > 0 ? deliveryTrends : [
              { time: "00:00", completed: 12, inTransit: 8, pending: 5 },
              { time: "04:00", completed: 8, inTransit: 5, pending: 3 },
              { time: "08:00", completed: 45, inTransit: 25, pending: 15 },
              { time: "12:00", completed: 78, inTransit: 42, pending: 28 },
              { time: "16:00", completed: 95, inTransit: 38, pending: 22 },
              { time: "20:00", completed: 62, inTransit: 28, pending: 18 },
            ]}>
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

        {/* Zone Performance - Dynamic from /analytics/fleet-charts weekly_stats */}
        <Card className="p-6">
          <h3 className="text-foreground mb-6">Zone-Level Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zonePerformance.length > 0 ? zonePerformance : [
              { zone: "Zone A3", demand: 145, drivers: 18, efficiency: 92 },
              { zone: "Zone B1", demand: 132, drivers: 15, efficiency: 88 },
              { zone: "Zone C2", demand: 128, drivers: 16, efficiency: 85 },
              { zone: "Zone D5", demand: 98, drivers: 12, efficiency: 90 },
              { zone: "Zone E2", demand: 115, drivers: 14, efficiency: 87 },
              { zone: "Zone F9", demand: 88, drivers: 10, efficiency: 84 },
            ]}>
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

        {/* Driver Efficiency Table - Dynamic from /analytics/drivers/top-performers */}
        <Card className="p-6">
          <h3 className="text-foreground mb-4">Top Performing Drivers</h3>
          <div className="space-y-3">
            {driverEfficiency.map((driver, index) => (<div key={driver.name} className="flex items-center justify-between p-4 bg-muted rounded-lg">
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
                  <div className="h-full bg-green-600" style={{ width: `${driver.score}%` }} />
                </div>
              </div>
            </div>))}
          </div>
        </Card>
      </TabsContent>

      {/* Safety Analytics */}
      <TabsContent value="safety" className="space-y-6">
        {/* Safety Metrics - Dynamic from backend safety score API */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Incidents"
            value={totalIncidents}
            change={formatChange(-safetyTrendPct)}
            icon={AlertTriangle}
            trend={safetyTrendPct >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Active Alerts"
            value={activeAlertsCount}
            change={activeAlertsCount <= 10 ? "-12%" : "+22%"}
            icon={Activity}
            trend={activeAlertsCount <= 10 ? "up" : "down"}
          />
          <StatCard
            title="Fleet Safety Score"
            value={`${safetyScore.toFixed(0)}/100 (${safetyGrade})`}
            change={formatChange(safetyTrendPct)}
            icon={Target}
            trend={safetyTrendPct >= 0 ? "up" : "down"}
          />
          <StatCard
            title="Accident Rate"
            value={`${accidentRate}%`}
            change={accidentRate < 1 ? "-15%" : "+5%"}
            icon={Zap}
            trend={accidentRate < 1 ? "up" : "down"}
          />
        </div>

        {/* Fatigue Trend - Dynamic from /analytics/alerts/summary */}
        <Card className="p-6">
          <h3 className="text-foreground mb-6">Safety Alert Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={fatigueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={3} name="Safety Alerts" />
            </LineChart>
          </ResponsiveContainer>
          {activeAlertsCount > 5 && (
            <div className="mt-4 p-4 bg-orange-500/10 dark:bg-orange-900/20 border border-orange-500/20 rounded-lg">
              <p className="text-orange-700 dark:text-orange-400">
                ⚠️ <strong>Alert:</strong> {activeAlertsCount} unacknowledged safety alerts require immediate attention.
              </p>
            </div>
          )}
        </Card>

        {/* Incident Types - Dynamic from /analytics/alerts/summary */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-foreground mb-6">Incident Distribution by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={incidentTypes} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {incidentTypes.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
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

        {/* Dangerous Behavior Metrics - Dynamic from backend safety score API */}
        <Card className="p-6">
          <h3 className="text-foreground mb-4">Dangerous Behavior Metrics</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-red-500/10 dark:bg-red-900/20 rounded-lg border border-red-500/20">
              <p className="text-muted-foreground mb-2">Harsh Braking</p>
              <p className="text-foreground text-2xl">{harshBrakingEvents} events</p>
              <p className="text-red-600 dark:text-red-400 mt-2">Severity Score: {safetyScoreData?.behavior_score?.toFixed(0) || 'N/A'}</p>
            </div>
            <div className="p-4 bg-orange-500/10 dark:bg-orange-900/20 rounded-lg border border-orange-500/20">
              <p className="text-muted-foreground mb-2">Speeding Events</p>
              <p className="text-foreground text-2xl">{speedingEvents} events</p>
              <p className="text-orange-600 dark:text-orange-400 mt-2">Peak at 6-8 PM</p>
            </div>
            <div className="p-4 bg-yellow-500/10 dark:bg-yellow-900/20 rounded-lg border border-yellow-500/20">
              <p className="text-muted-foreground mb-2">Fatigue Alerts</p>
              <p className="text-foreground text-2xl">{fatigueAlertsCount} events</p>
              <p className="text-yellow-600 dark:text-yellow-400 mt-2">Fatigue Score: {safetyScoreData?.fatigue_score?.toFixed(0) || 'N/A'}</p>
            </div>
            <div className="p-4 bg-purple-500/10 dark:bg-purple-900/20 rounded-lg border border-purple-500/20">
              <p className="text-muted-foreground mb-2">Compliance Rate</p>
              <p className="text-foreground text-2xl">{safetyScoreData?.compliance_score?.toFixed(0) || 0}%</p>
              <p className="text-purple-600 dark:text-purple-400 mt-2">Alert acknowledgment</p>
            </div>
          </div>
        </Card>
      </TabsContent>

      {/* Predictive AI */}
      <TabsContent value="predictive" className="space-y-6">
        {/* AI Insights Panel - Dynamic recommendations from demand forecast */}
        <Card className="p-6 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-foreground">AI-Generated Insights</h3>
          </div>
          <div className="space-y-3">
            {demandForecast?.recommendations?.map((rec, index) => (
              <div key={index} className="p-4 bg-card rounded-lg border border-blue-500/20">
                <p className="text-foreground mb-2">
                  <strong>📈 Recommendation:</strong> {rec}
                </p>
              </div>
            ))}
            {(!demandForecast?.recommendations || demandForecast.recommendations.length === 0) && (
              <>
                <div className="p-4 bg-card rounded-lg border border-blue-500/20">
                  <p className="text-foreground mb-2">
                    <strong>📈 Demand Forecast:</strong> Peak demand expected at {demandForecast?.peak_predicted_hour || 'N/A'} with {demandForecast?.peak_predicted_demand || 0} orders.
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-orange-500/20">
                  <p className="text-foreground mb-2">
                    <strong>⚠️ Safety Alert:</strong> {fatigueAlertsCount} fatigue alerts detected. Consider enforcing break policies.
                  </p>
                </div>
                <div className="p-4 bg-card rounded-lg border border-green-500/20">
                  <p className="text-foreground mb-2">
                    <strong>💡 Optimization:</strong> Total orders (30d): {demandForecast?.current_demand || totalOrders}. Fleet utilization at {utilization}%.
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Demand Forecast - Dynamic from /analytics/demand/forecast */}
        <Card className="p-6">
          <h3 className="text-foreground mb-2">24-Hour Demand Overview</h3>
          <p className="text-muted-foreground text-sm mb-4">Past 12 hours (actual) → Now ★ → Next 12 hours (predicted)</p>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={demandForecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={1} angle={-35} textAnchor="end" height={50} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual Demand" connectNulls={false} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" name="Predicted Demand" dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Risk Predictions - Hardcoded (Requires AI risk prediction model) */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-foreground mb-4">High-Risk Zones (Next 4 Hours)</h3>
            {/* TODO: Requires AI-based zone risk prediction model */}
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
            {/* TODO: Requires AI fatigue prediction based on driver telemetry */}
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

        {/* Weather-Based Predictions - Hardcoded (Requires weather API integration) */}
        <Card className="p-6">
          <h3 className="text-foreground mb-4">Weather-Based Demand Impact</h3>
          {/* TODO: Requires weather API integration and ML demand correlation model */}
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
  </div>);
}
