import React, { useState } from 'react';
import { useDashboard } from '../hooks/useDashboard.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { IncomeExpenseBar } from '../components/charts/IncomeExpenseBar.jsx';
import { CategoryDoughnut } from '../components/charts/CategoryDoughnut.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { RoleGuard } from '../components/guards/RoleGuard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { ROLES } from '../utils/constants.js';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const Dashboard = () => {
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  
  const { summary, charts, recent, loading } = useDashboard(fromDate, toDate);
  
  const tableColumns = [
    { key: 'date', label: 'Date', render: (v) => formatDate(v) },
    { key: 'category', label: 'Category' },
    {
      key: 'type',
      label: 'Type',
      render: (v) => <Badge variant={v}>{v}</Badge>,
    },
    { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v) },
    { key: 'notes', label: 'Notes' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <div className="flex gap-2">
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-40"
            />
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            title="Total Income"
            value={formatCurrency(summary?.totalIncome || 0)}
            accent="success"
            icon={TrendingUp}
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(summary?.totalExpenses || 0)}
            accent="danger"
            icon={TrendingDown}
          />
          <StatCard
            title="Net Balance"
            value={formatCurrency(
              (summary?.totalIncome || 0) - (summary?.totalExpenses || 0)
            )}
            accent="primary"
          />
          <StatCard
            title="Total Records"
            value={summary?.totalRecords || 0}
            accent="warning"
          />
        </div>

        {/* Charts Row */}
        <RoleGuard roles={[ROLES.ANALYST, ROLES.ADMIN]}>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="font-semibold text-text-primary mb-4">
                Income vs Expenses
              </h3>
              <IncomeExpenseBar data={charts?.barChart} />
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-border p-6">
              <h3 className="font-semibold text-text-primary mb-4">
                Expenses by Category
              </h3>
              <CategoryDoughnut data={charts?.doughnutChart} />
            </div>
          </div>
        </RoleGuard>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-6">
          <h3 className="font-semibold text-text-primary mb-4">
            Recent Transactions
          </h3>
          <Table columns={tableColumns} data={recent} />
        </div>
      </div>
    </AppLayout>
  );
};
