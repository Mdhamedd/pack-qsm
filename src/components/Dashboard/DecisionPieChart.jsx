import React, { forwardRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { DECISIONS, DECISION_COLORS } from '../../data/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

const DecisionPieChart = forwardRef(({ kpis }, ref) => {
  const data = {
    labels: [DECISIONS.ACCEPTED, DECISIONS.CONDITIONAL, DECISIONS.REJECTED],
    datasets: [
      {
        data: [kpis.accepted, kpis.conditional, kpis.rejected],
        backgroundColor: [DECISION_COLORS[DECISIONS.ACCEPTED], DECISION_COLORS[DECISIONS.CONDITIONAL], DECISION_COLORS[DECISIONS.REJECTED]],
        borderColor: '#0b1119',
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#cbd5e1', padding: 16 } }
    }
  };

  if (kpis.total === 0) {
    return <div className="text-steel-500 text-sm text-center py-10">لا توجد فحوصات مسجلة بعد</div>;
  }

  return (
    <div className="h-64">
      <Pie ref={ref} data={data} options={options} />
    </div>
  );
});

export default DecisionPieChart;
