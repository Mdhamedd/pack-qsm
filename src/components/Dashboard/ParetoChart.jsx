import React, { forwardRef } from 'react';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend
);

// مخطط باريتو: أعمدة لتكرار كل عيب + خط تراكمي للنسبة المئوية
// ملاحظة: لدمج أعمدة (Bar) وخط (Line) في نفس المخطط يجب استخدام مكوّن
// <Chart> العام من react-chartjs-2 (وليس <Bar>) مع تسجيل BarController
// و LineController معاً، وإلا لن يظهر الخط التراكمي بشكل صحيح.
const ParetoChart = forwardRef(({ data }, ref) => {
  if (!data || data.length === 0) {
    return <div className="text-steel-500 text-sm text-center py-10">لا توجد بيانات عيوب كافية لعرض تحليل باريتو</div>;
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);
  let cumulative = 0;
  const cumulativePercents = data.map((d) => {
    cumulative += d.count;
    return Math.round((cumulative / total) * 100);
  });

  const chartData = {
    labels: data.map((d) => d.type),
    datasets: [
      {
        type: 'bar',
        label: 'عدد التكرار',
        data: data.map((d) => d.count),
        backgroundColor: '#f59e0b',
        borderRadius: 6,
        yAxisID: 'y',
        order: 2
      },
      {
        type: 'line',
        label: 'النسبة التراكمية %',
        data: cumulativePercents,
        borderColor: '#ef4444',
        backgroundColor: '#ef4444',
        yAxisID: 'y1',
        tension: 0.3,
        pointRadius: 4,
        order: 1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: '#cbd5e1' } }
    },
    scales: {
      x: { ticks: { color: '#94a3b8' }, grid: { color: '#1f2c3a' } },
      y: { type: 'linear', position: 'left', ticks: { color: '#94a3b8' }, grid: { color: '#1f2c3a' } },
      y1: { type: 'linear', position: 'right', min: 0, max: 100, ticks: { color: '#94a3b8' }, grid: { drawOnChartArea: false } }
    }
  };

  return (
    <div className="h-72">
      <Chart ref={ref} type="bar" data={chartData} options={options} />
    </div>
  );
});

export default ParetoChart;
