import { cn } from '@/lib/utils';

interface ChartProps {
  title?: string;
  data?: any[];
  type?: 'line' | 'bar' | 'pie' | 'doughnut';
  height?: number;
  className?: string;
}

export function Chart({ 
  title, 
  data = [], 
  type = 'line', 
  height = 300, 
  className 
}: ChartProps) {
  // This is a placeholder component for charts
  // In a real implementation, you would use a charting library like Chart.js, Recharts, or D3
  
  return (
    <div className={cn('chart-container', className)}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        style={{ height: `${height}px` }}
      >
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            📊
          </div>
          <p className="text-sm text-gray-500">
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data.length} data points
          </p>
        </div>
      </div>
    </div>
  );
}

// Export some example chart types
export function LineChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="line" />;
}

export function BarChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="bar" />;
}

export function PieChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="pie" />;
}

export function DoughnutChart(props: Omit<ChartProps, 'type'>) {
  return <Chart {...props} type="doughnut" />;
}