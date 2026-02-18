import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Package, Clock, Users, MapPin, AlertTriangle, Activity, Zap, Brain, CloudRain, Target, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
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
  useDemandForecast,
  useDemandHistory,
  useZoneDemandHistory
} from "@/utils/hooks/use-api";

// Helper: format date to YYYY-MM-DD
const formatDateStr = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Get today in Dubai time (UTC+4)
const getTodayDubai = () => {
  const now = new Date();
  const dubaiOffset = 4 * 60; // minutes
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + dubaiOffset * 60000);
};

export function Analytics() {
  // Date navigation state for demand chart
  const [selectedDate, setSelectedDate] = useState(null); // null = today
  const [selectedZone, setSelectedZone] = useState(null); // null = show all zones grid
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
  const { data: demandHistory, refetch: refetchDemandHistory } = useDemandHistory(selectedDate);
  const { data: zoneDemandHistory, refetch: refetchZoneDemandHistory } = useZoneDemandHistory(selectedDate);

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
    refetchDemandHistory();
    refetchZoneDemandHistory();
  }, 10000);

  // Date navigation helpers
  const goToPreviousDay = () => {
    const today = getTodayDubai();
    const current = selectedDate ? new Date(selectedDate + 'T00:00:00') : today;
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    // Don't go more than 30 days back
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (prev >= thirtyDaysAgo) {
      setSelectedDate(formatDateStr(prev));
    }
  };

  const goToNextDay = () => {
    if (!selectedDate) return; // already at today
    const current = new Date(selectedDate + 'T00:00:00');
    const next = new Date(current);
    next.setDate(next.getDate() + 1);
    const today = getTodayDubai();
    if (formatDateStr(next) >= formatDateStr(today)) {
      setSelectedDate(null); // back to today
    } else {
      setSelectedDate(formatDateStr(next));
    }
  };

  const goToToday = () => setSelectedDate(null);
  const isToday = selectedDate === null || selectedDate === formatDateStr(getTodayDubai());

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

  // Demand history data (24h for selected date)
  const demandChartData = demandHistory?.data || [];
  const demandDateLabel = demandHistory?.date_label || 'Today';
  const currentHourIndex = demandHistory?.current_hour;
  const isDemandToday = demandHistory?.is_today ?? true;

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

        {/* Demand Chart - Actual vs Predicted with Day Navigation */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-foreground">Demand — Actual vs Predicted</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousDay}
                className="p-2 rounded-lg bg-muted hover:bg-muted-foreground/10 transition-colors"
                title="Previous day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isToday
                  ? 'bg-blue-600 text-white'
                  : 'bg-muted hover:bg-muted-foreground/10 text-foreground'
                  }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                {demandDateLabel}
              </button>
              <button
                onClick={goToNextDay}
                disabled={isToday}
                className={`p-2 rounded-lg transition-colors ${isToday
                  ? 'bg-muted text-muted-foreground/30 cursor-not-allowed'
                  : 'bg-muted hover:bg-muted-foreground/10'
                  }`}
                title="Next day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={demandChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb40" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 12 }}
                interval={1}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '10px 14px' }}
                labelStyle={{ fontWeight: 'bold', marginBottom: 4, color: '#1e293b' }}
                itemStyle={{ color: '#334155' }}
                wrapperStyle={{ zIndex: 50 }}
              />
              <Legend />
              {isDemandToday && currentHourIndex !== null && currentHourIndex !== undefined && (
                <ReferenceLine
                  x={`${String(currentHourIndex).padStart(2, '0')}:00`}
                  stroke="#6366f1"
                  strokeDasharray="3 3"
                  label={{ value: 'Now', position: 'top', fill: '#6366f1', fontSize: 12 }}
                />
              )}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Actual Demand"
                dot={{ r: 3, fill: '#3b82f6' }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Predicted Demand"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          {isDemandToday && (
            <p className="text-muted-foreground text-xs mt-2 text-center">
              Actual demand line ends at current hour. Predicted demand shown for all 24 hours.
            </p>
          )}
        </Card>

        {/* Zone-wise Demand Chart — ML-Predicted */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-foreground">Zone-wise Demand — ML Predicted</h3>
            <select
              value={selectedZone || ''}
              onChange={(e) => setSelectedZone(e.target.value || null)}
              className="bg-muted text-foreground text-sm rounded-lg px-3 py-1.5 border border-border focus:outline-none"
            >
              <option value="">All Zones</option>
              {(zoneDemandHistory?.zones || []).map(zone => (
                <option key={zone.zone_id} value={zone.zone_id}>{zone.zone_name}</option>
              ))}
            </select>
          </div>
          {selectedZone ? (
            // Single zone view
            (() => {
              const zone = (zoneDemandHistory?.zones || []).find(z => z.zone_id === selectedZone);
              if (!zone) return <p className="text-muted-foreground text-sm">No data for selected zone.</p>;
              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-foreground">{zone.zone_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Actual: {zone.total_actual} | Predicted: {zone.total_predicted}
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={zone.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb40" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '10px 14px' }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                        itemStyle={{ color: '#334155' }}
                        wrapperStyle={{ zIndex: 50 }}
                      />
                      <Legend />
                      {isDemandToday && currentHourIndex !== null && (
                        <ReferenceLine
                          x={`${String(currentHourIndex).padStart(2, '0')}:00`}
                          stroke="#6366f1" strokeDasharray="3 3"
                          label={{ value: 'Now', position: 'top', fill: '#6366f1', fontSize: 11 }}
                        />
                      )}
                      <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} name="Actual" dot={{ r: 2 }} connectNulls={false} />
                      <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" name="Predicted" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              );
            })()
          ) : (
            // Grid of all zones
            <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
              {(zoneDemandHistory?.zones || []).map(zone => (
                <div key={zone.zone_id} className="bg-muted/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{zone.zone_name}</p>
                    <p className="text-xs text-muted-foreground">
                      A:{zone.total_actual} P:{Math.round(zone.total_predicted)}
                    </p>
                  </div>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={zone.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb20" />
                      <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={5} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 9 }} width={25} />
                      <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', padding: '8px 10px' }} itemStyle={{ color: '#334155' }} wrapperStyle={{ zIndex: 50 }} />
                      <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={1.5} dot={false} connectNulls={false} />
                      <Line type="monotone" dataKey="predicted" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          )}
          <p className="text-muted-foreground text-xs mt-2 text-center">
            All predictions powered by ML ensemble (RandomForest + GradientBoosting + Ridge) per zone.
          </p>
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
