'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export default function ChartWidget({
  title,
  description,
  type = 'line',
  data = [],
  xKey = 'name',
  yKey = 'value',
  lines = [],
  bars = [],
  areas = [],
  showGrid = true,
  showLegend = true,
  loading = false,
  height = 300,
}) {
  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading chart...</p>
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No data available</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 },
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {lines.length > 0 ? (
                lines.map((line, index) => (
                  <Line
                    key={line.key || index}
                    type="monotone"
                    dataKey={line.dataKey || yKey}
                    stroke={line.color || COLORS[index % COLORS.length]}
                    strokeWidth={2}
                    name={line.name || line.dataKey}
                    dot={{ fill: line.color || COLORS[index % COLORS.length] }}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={yKey}
                  stroke={COLORS[0]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[0] }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {bars.length > 0 ? (
                bars.map((bar, index) => (
                  <Bar
                    key={bar.key || index}
                    dataKey={bar.dataKey || yKey}
                    fill={bar.color || COLORS[index % COLORS.length]}
                    name={bar.name || bar.dataKey}
                  />
                ))
              ) : (
                <Bar dataKey={yKey} fill={COLORS[0]} />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" />}
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              {showLegend && <Legend />}
              {areas.length > 0 ? (
                areas.map((area, index) => (
                  <Area
                    key={area.key || index}
                    type="monotone"
                    dataKey={area.dataKey || yKey}
                    stroke={area.color || COLORS[index % COLORS.length]}
                    fill={area.color || COLORS[index % COLORS.length]}
                    fillOpacity={0.6}
                    name={area.name || area.dataKey}
                  />
                ))
              ) : (
                <Area
                  type="monotone"
                  dataKey={yKey}
                  stroke={COLORS[0]}
                  fill={COLORS[0]}
                  fillOpacity={0.6}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey={yKey}
                nameKey={xKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div className="flex items-center justify-center" style={{ height }}>
            <p className="text-sm text-muted-foreground">
              Unsupported chart type: {type}
            </p>
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{renderChart()}</CardContent>
    </Card>
  );
}