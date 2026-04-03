import React from 'react';
import { Doughnut } from 'react-chartjs-2';

export const CategoryDoughnut = ({ data = {} }) => {
  const colors = [
    '#6366f1',
    '#22c55e',
    '#ef4444',
    '#f59e0b',
    '#8b5cf6',
    '#06b6d4',
  ];

  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        data: data.amounts || [],
        backgroundColor: colors.slice(0, data.labels?.length || 0),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return <Doughnut data={chartData} options={options} />;
};
