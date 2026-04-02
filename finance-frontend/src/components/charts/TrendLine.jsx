import React from 'react';
import { Line } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const TrendLine = ({ data = {} }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Net Balance',
        data: data.balance || [],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => formatCurrency(value),
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
};
