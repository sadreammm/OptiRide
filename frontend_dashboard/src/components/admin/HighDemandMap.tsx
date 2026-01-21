import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ZoomIn, ZoomOut, Locate, Navigation, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useTheme } from "next-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useActiveDriverLocations, usePolling } from "@/hooks/use-api";

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Order status colors
const statusColors = {
  completed: "#22c55e", // Green
  active: "#3b82f6",    // Blue
  failed: "#ef4444",    // Red
};

type OrderStatus = "completed" | "active" | "failed";

// Zone colors for 20 distinct Dubai zones
const zoneColors: Record<string, string> = {
  A1: "#ef4444", A2: "#dc2626",
  B1: "#f97316", B2: "#ea580c",
  C1: "#eab308", C2: "#ca8a04",
  D1: "#22c55e", D2: "#16a34a",
  E1: "#14b8a6", E2: "#0d9488",
  F1: "#3b82f6", F2: "#2563eb",
  G1: "#6366f1", G2: "#4f46e5",
  H1: "#8b5cf6", H2: "#7c3aed",
  I1: "#ec4899", I2: "#db2777",
  J1: "#06b6d4", J2: "#0891b2",
};

// Custom marker icons for zones
const createZoneIcon = (color: string, count: number) => {
  return L.divIcon({
    className: "custom-zone-icon",
    html: `<div style="
      background-color: ${color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 11px;
      color: white;
    ">${count}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// 20 Dubai zones spread across the city
const highDemandZones = [
  { id: "A1", count: 52, lat: 25.1972, lng: 55.2744, area: "Downtown Dubai" },
  { id: "A2", count: 48, lat: 25.2100, lng: 55.2800, area: "DIFC" },
  { id: "C1", count: 45, lat: 25.1850, lng: 55.2620, area: "Business Bay" },
  { id: "C2", count: 38, lat: 25.2050, lng: 55.3450, area: "Dubai Creek Harbour" },
  { id: "B1", count: 42, lat: 25.2700, lng: 55.3100, area: "Deira" },
  { id: "B2", count: 39, lat: 25.2550, lng: 55.2950, area: "Bur Dubai" },
  { id: "J2", count: 35, lat: 25.2150, lng: 55.2550, area: "Jumeirah 1" },
  { id: "D1", count: 50, lat: 25.0800, lng: 55.1400, area: "Dubai Marina" },
  { id: "D2", count: 44, lat: 25.0700, lng: 55.1500, area: "JLT" },
  { id: "E1", count: 46, lat: 25.0780, lng: 55.1330, area: "JBR" },
  { id: "E2", count: 41, lat: 25.1120, lng: 55.1380, area: "Palm West" },
  { id: "F1", count: 36, lat: 25.1150, lng: 55.2000, area: "Al Barsha" },
  { id: "F2", count: 33, lat: 25.1180, lng: 55.2010, area: "Mall of Emirates" },
  { id: "J1", count: 29, lat: 25.1400, lng: 55.2350, area: "Al Quoz" },
  { id: "G1", count: 31, lat: 25.1180, lng: 55.3800, area: "Silicon Oasis" },
  { id: "G2", count: 27, lat: 25.1250, lng: 55.4100, area: "Academic City" },
  { id: "H1", count: 28, lat: 25.0450, lng: 55.2200, area: "Sports City" },
  { id: "H2", count: 25, lat: 25.0500, lng: 55.2450, area: "Motor City" },
  { id: "I1", count: 24, lat: 25.0580, lng: 55.2680, area: "Arabian Ranches" },
  { id: "I2", count: 32, lat: 25.2280, lng: 55.4050, area: "Mirdif" },
];

interface Order {
  id: string;
  lat: number;
  lng: number;
  zoneId: string;
  status: OrderStatus;
}

// Generate ~500 random order dots with status
const generateOrderDots = (): Order[] => {
  const orders: Order[] = [];
  const statuses: OrderStatus[] = ["completed", "active", "failed"];
  const statusWeights = [0.6, 0.3, 0.1]; // 60% completed, 30% active, 10% failed
  
  let orderId = 1;
  highDemandZones.forEach((zone) => {
    const orderCount = Math.floor(zone.count * 0.6) + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < orderCount; i++) {
      const latOffset = (Math.random() - 0.5) * 0.025;
      const lngOffset = (Math.random() - 0.5) * 0.025;
      
      // Weighted random status
      const rand = Math.random();
      let status: OrderStatus = "completed";
      if (rand > statusWeights[0] + statusWeights[1]) {
        status = "failed";
      } else if (rand > statusWeights[0]) {
        status = "active";
      }
      
      orders.push({
        id: `ORD-${orderId++}`,
        lat: zone.lat + latOffset,
        lng: zone.lng + lngOffset,
        zoneId: zone.id,
        status,
      });
    }
  });
  
  return orders;
};

const allOrders = generateOrderDots();

// Cluster layer component
function ClusterLayer({ orders, visibleStatuses }: { orders: Order[]; visibleStatuses: OrderStatus[] }) {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      iconCreateFunction: (cluster) => {
        const childCount = cluster.getChildCount();
        const childMarkers = cluster.getAllChildMarkers();
        
        // Count by status
        let completed = 0, active = 0, failed = 0;
        childMarkers.forEach((m: any) => {
          const status = m.options.orderStatus;
          if (status === "completed") completed++;
          else if (status === "active") active++;
          else if (status === "failed") failed++;
        });
        
        // Determine dominant color
        let bgColor = statusColors.completed;
        if (active >= completed && active >= failed) bgColor = statusColors.active;
        if (failed >= completed && failed >= active) bgColor = statusColors.failed;
        
        return L.divIcon({
          html: `<div style="
            background-color: ${bgColor};
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 3px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            color: white;
          ">${childCount}</div>`,
          className: "marker-cluster-custom",
          iconSize: L.point(40, 40),
        });
      },
    });

    const filteredOrders = orders.filter(o => visibleStatuses.includes(o.status));
    
    filteredOrders.forEach((order) => {
      const marker = L.circleMarker([order.lat, order.lng], {
        radius: 5,
        fillColor: statusColors[order.status],
        color: "white",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9,
      } as any);
      
      (marker.options as any).orderStatus = order.status;
      
      marker.bindPopup(`
        <div style="font-size: 12px;">
          <p style="font-weight: 600; margin: 0;">${order.id}</p>
          <p style="margin: 4px 0 0 0; color: ${statusColors[order.status]}; text-transform: capitalize;">
            ${order.status}
          </p>
        </div>
      `);
      
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, orders, visibleStatuses]);

  return null;
}

// Map controls component
function MapControls() {
  const map = useMap();

  return (
    <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-1">
      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-card/90 backdrop-blur-sm hover:bg-card shadow-md"
        onClick={() => map.zoomIn()}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-card/90 backdrop-blur-sm hover:bg-card shadow-md"
        onClick={() => map.zoomOut()}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-card/90 backdrop-blur-sm hover:bg-card shadow-md"
        onClick={() => map.setView([25.1500, 55.2500], 11)}
      >
        <Locate className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="secondary"
        className="h-8 w-8 bg-card/90 backdrop-blur-sm hover:bg-card shadow-md"
        onClick={() => map.setView([25.1500, 55.2200], 12)}
      >
        <Navigation className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function HighDemandMap() {
  const [selectedZones, setSelectedZones] = useState<string[]>(highDemandZones.map(z => z.id));
  const [visibleStatuses, setVisibleStatuses] = useState<OrderStatus[]>(["completed", "active", "failed"]);
  const { resolvedTheme, theme } = useTheme();
  const mapTheme = (resolvedTheme ?? theme) === "dark" ? "dark" : "light";
  const tileUrl = mapTheme === "dark"
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  const tileAttribution = mapTheme === "dark"
    ? "&copy; OpenStreetMap contributors &copy; CARTO"
    : "&copy; OpenStreetMap contributors";
  
  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => selectedZones.includes(o.zoneId));
  }, [selectedZones]);
  
  const statusCounts = useMemo(() => {
    const counts = { completed: 0, active: 0, failed: 0 };
    filteredOrders.forEach(o => {
      if (visibleStatuses.includes(o.status)) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [filteredOrders, visibleStatuses]);

  const toggleZone = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(z => z !== zoneId)
        : [...prev, zoneId]
    );
  };

  const toggleStatus = (status: OrderStatus) => {
    setVisibleStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const selectAllZones = () => setSelectedZones(highDemandZones.map(z => z.id));
  const clearAllZones = () => setSelectedZones([]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-destructive" />
            High Demand Zones
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Status Legend */}
            <div className="flex gap-2 text-xs">
              <button
                onClick={() => toggleStatus("completed")}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                  visibleStatuses.includes("completed") ? "opacity-100" : "opacity-40"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.completed }} />
                <span>{statusCounts.completed}</span>
              </button>
              <button
                onClick={() => toggleStatus("active")}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                  visibleStatuses.includes("active") ? "opacity-100" : "opacity-40"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.active }} />
                <span>{statusCounts.active}</span>
              </button>
              <button
                onClick={() => toggleStatus("failed")}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-opacity ${
                  visibleStatuses.includes("failed") ? "opacity-100" : "opacity-40"
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColors.failed }} />
                <span>{statusCounts.failed}</span>
              </button>
            </div>
            
            {/* Zone Filter */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 gap-1">
                  <Filter className="h-3 w-3" />
                  Zones ({selectedZones.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Filter Zones</span>
                  <div className="flex gap-2">
                    <button onClick={selectAllZones} className="text-xs text-primary hover:underline">
                      All
                    </button>
                    <button onClick={clearAllZones} className="text-xs text-muted-foreground hover:underline">
                      None
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {highDemandZones.map((zone) => (
                    <label
                      key={zone.id}
                      className={`flex items-center gap-1.5 p-1.5 rounded cursor-pointer text-xs transition-colors ${
                        selectedZones.includes(zone.id) 
                          ? "bg-accent" 
                          : "hover:bg-muted"
                      }`}
                    >
                      <Checkbox
                        checked={selectedZones.includes(zone.id)}
                        onCheckedChange={() => toggleZone(zone.id)}
                        className="h-3 w-3"
                      />
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: zoneColors[zone.id] }}
                      />
                      <span className="truncate">{zone.id}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        {/* Zone badges */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {highDemandZones.filter(z => selectedZones.includes(z.id)).slice(0, 10).map((zone) => (
            <Badge
              key={zone.id}
              variant="secondary"
              className="text-white font-medium text-xs cursor-pointer hover:opacity-80"
              style={{ backgroundColor: zoneColors[zone.id] }}
              onClick={() => toggleZone(zone.id)}
            >
              {zone.id} ({zone.count})
            </Badge>
          ))}
          {selectedZones.length > 10 && (
            <Badge variant="outline" className="text-xs">
              +{selectedZones.length - 10} more
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[420px] w-full relative">
          <MapContainer
            center={[25.1500, 55.2500]}
            zoom={11}
            scrollWheelZoom={true}
            className="h-full w-full z-0"
            style={{ background: "hsl(var(--muted))" }}
            maxBounds={[[24.85, 54.9], [25.45, 55.6]]}
            minZoom={10}
          >
            <TileLayer
              key={mapTheme}
              attribution={tileAttribution}
              url={tileUrl}
            />
            
            {/* Clustered order dots */}
            <ClusterLayer orders={filteredOrders} visibleStatuses={visibleStatuses} />
            
            {/* Zone markers */}
            {highDemandZones
              .filter(z => selectedZones.includes(z.id))
              .map((zone) => (
                <Marker
                  key={zone.id}
                  position={[zone.lat, zone.lng]}
                  icon={createZoneIcon(zoneColors[zone.id], zone.count)}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">Zone {zone.id}</p>
                      <p className="text-muted-foreground">{zone.area}</p>
                      <p className="font-medium" style={{ color: zoneColors[zone.id] }}>
                        {zone.count} orders
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            
            <MapControls />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
}
