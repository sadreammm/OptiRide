import { Users, AlertTriangle, Package, UserX, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/shared/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HighDemandMap } from "@/components/shared/HighDemandMap";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from "recharts";
import { useDriversSummary, useOrderStats, usePolling, useOrders } from "@/utils/hooks/use-api";

// Time-Series Data Hardcoded for now
const deliveriesData = [
  { time: "00:00", completed: 20, failed: 2, ongoing: 15 },
  { time: "04:00", completed: 15, failed: 1, ongoing: 10 },
  { time: "08:00", completed: 180, failed: 5, ongoing: 85 },
  { time: "12:00", completed: 320, failed: 8, ongoing: 120 },
  { time: "16:00", completed: 280, failed: 6, ongoing: 95 },
  { time: "20:00", completed: 200, failed: 4, ongoing: 60 },
  { time: "23:59", completed: 45, failed: 2, ongoing: 25 },
];

const weeklyData = [
  { day: "Mon", efficiency: 92, deliveries: 2100 },
  { day: "Tue", efficiency: 88, deliveries: 1950 },
  { day: "Wed", efficiency: 94, deliveries: 2200 },
  { day: "Thu", efficiency: 91, deliveries: 2050 },
  { day: "Fri", efficiency: 96, deliveries: 2400 },
  { day: "Sat", efficiency: 93, deliveries: 2150 },
  { day: "Sun", efficiency: 89, deliveries: 1800 },
];

export function FleetDashboard() {
  const { data: driversSummary, refetch: refetchDrivers } = useDriversSummary();
  const { data: orderStats, refetch: refetchOrders } = useOrderStats();
  const { data: recentOrdersData, refetch: refetchRecent } = useOrders();

  // Refresh data every 10 seconds
  usePolling(() => {
    refetchDrivers();
    refetchOrders();
    refetchRecent();
  }, 10000);

  // Calculate high-level metrics
  const availableDrivers = driversSummary?.available_drivers || 0;
  const busyDrivers = driversSummary?.busy_drivers || 0;
  const onBreakDrivers = driversSummary?.on_break_drivers || 0;
  const offlineDrivers = driversSummary?.offline_drivers || 0;
  const totalDrivers = driversSummary?.total_drivers || 0;

  const totalActive = availableDrivers + busyDrivers;
  const efficiencyRate = totalDrivers > 0 ? ((totalActive / totalDrivers) * 100).toFixed(1) : "0";

  // Map driver status for the distribution card
  const driverStatusData = [
    { label: "Active/Busy", value: busyDrivers, color: "bg-primary" },
    { label: "Available", value: availableDrivers, color: "bg-success" },
    { label: "On Break", value: onBreakDrivers, color: "bg-warning" },
    { label: "Offline", value: offlineDrivers, color: "bg-muted-foreground" },
  ].map(item => ({
    ...item,
    percentage: totalDrivers > 0 ? ((item.value / totalDrivers) * 100).toFixed(1) : 0
  }));

  // Map recent orders to activity feed
  const recentActivity = (recentOrdersData?.orders || recentOrdersData || []).slice(0, 5).map(order => ({
    id: order.order_id,
    type: order.status === 'delivered' ? 'completed' : 'active',
    driver: order.driver_id || 'Unassigned',
    order: `#${order.order_id.substring(0, 5)}`,
    time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fleet Dashboard</h1>
          <p className="text-muted-foreground">Monitor your fleet operations in real-time</p>
        </div>
        <Badge className="bg-success/10 text-success hover:bg-success/20 border-0">
          All Systems Operational
        </Badge>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Active Drivers"
          value={totalActive.toString()}
          subtitle="Drivers on duty"
          icon={Users}
          trend={{ value: "12", isPositive: true }}
          iconColor="text-success"
        />
        <MetricCard
          title="Pending Orders"
          value={(orderStats?.pending || 0).toString()}
          subtitle="Awaiting assignment"
          icon={AlertTriangle}
          trend={{ value: "3", isPositive: false }}
          iconColor="text-destructive"
        />
        <MetricCard
          title="Ongoing Orders"
          value={((orderStats?.assigned || 0) + (orderStats?.picked_up || 0)).toString()}
          subtitle="In progress"
          icon={Package}
          trend={{ value: "24", isPositive: true }}
          iconColor="text-primary"
        />
        <MetricCard
          title="Available Drivers"
          value={availableDrivers.toString()}
          subtitle="Waiting for assignment"
          icon={UserX}
          trend={{ value: "8", isPositive: false }}
          iconColor="text-muted-foreground"
        />
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Completed Today"
          value={(orderStats?.delivered || 0).toLocaleString()}
          subtitle="Successful deliveries"
          icon={CheckCircle}
          trend={{ value: "156", isPositive: true }}
          iconColor="text-success"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${(orderStats?.total_revenue || 0).toLocaleString()}`}
          subtitle="Today's earnings"
          icon={TrendingUp}
          iconColor="text-success"
        />
        <MetricCard
          title="Average Delivery Time"
          value={`${orderStats?.avg_delivery_time_min || 0} min`}
          subtitle="Per order"
          icon={Clock}
          trend={{ value: "5 min", isPositive: true }}
          iconColor="text-primary"
        />
        <MetricCard
          title="Fleet Utilization"
          value={`${efficiencyRate}%`}
          subtitle="Overall efficiency"
          icon={TrendingUp}
          trend={{ value: "2.3%", isPositive: true }}
          iconColor="text-success"
        />
      </div>

      {/* High Demand Zones Map */}
      <HighDemandMap />

      {/* Charts and Stats Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Deliveries Today Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Deliveries Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={deliveriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} />
                  <Area type="monotone" dataKey="completed" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.3)" />
                  <Area type="monotone" dataKey="failed" stackId="1" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.3)" />
                  <Area type="monotone" dataKey="ongoing" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <span className="text-xs text-muted-foreground">Failed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Ongoing</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Driver Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {driverStatusData.map((status) => (
              <div key={status.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{status.label}</span>
                  <span className="font-medium">{status.value} ({status.percentage}%)</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${status.color}`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Fleet</span>
                <span className="font-medium">{totalDrivers} drivers</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-muted-foreground">Utilization</span>
                <span className="font-medium text-success">{efficiencyRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Performance and Recent Activity */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} />
                  <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  <Line yAxisId="right" type="monotone" dataKey="deliveries" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: 'hsl(var(--success))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Efficiency %</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-xs text-muted-foreground">Total Deliveries</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <span className="text-xs text-primary cursor-pointer hover:underline">live</span>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'completed' ? 'bg-success' : 'bg-warning'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {activity.type === 'completed' ? `Order ${activity.order} Delivered` : `Order ${activity.order} Received`}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.driver}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

