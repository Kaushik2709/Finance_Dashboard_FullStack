import React from 'react';
import { Bar } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/formatCurrency.js';

export const IncomeExpenseBar = ({ data = {} }) => {
  const chartData = {
    labels: data.labels || [],
    datasets: [
      {
        label: 'Income',
        data: data.income || [],
        backgroundColor: '#22c55e',
        borderRadius: 4,
      },
      {
        label: 'Expenses',
        data: data.expenses || [],
        backgroundColor: '#ef4444',
        borderRadius: 4,
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

  return <Bar data={chartData} options={options} />;
};
