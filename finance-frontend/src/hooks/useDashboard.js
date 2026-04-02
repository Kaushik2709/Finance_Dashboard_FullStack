import { useCallback, useEffect, useState } from 'react';
import { dashboardAPI } from '../api/dashboard.api.js';

export const useDashboard = (from, to) => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [rawSummary, categories, trends, recentRecords] = await Promise.all([
        dashboardAPI.getSummary(from, to),
        dashboardAPI.getByCategory(from, to),
        dashboardAPI.getTrends('monthly'),
        dashboardAPI.getRecentRecords(10),
      ]);

      setSummary(
        rawSummary
          ? {
              totalIncome: rawSummary.total_income,
              totalExpenses: rawSummary.total_expenses,
              netBalance: rawSummary.net_balance,
              totalRecords: rawSummary.record_count,
            }
          : null
      );

      const expenseCategories = (categories || []).filter(
        (c) => c.category_type !== 'income'
      );

      setCharts({
        barChart: {
          labels: (trends || []).map((t) => String(t.period_start).slice(0, 10)),
          income: (trends || []).map((t) => t.total_income),
          expenses: (trends || []).map((t) => t.total_expenses),
        },
        doughnutChart: {
          labels: expenseCategories.map((c) => c.category_name),
          amounts: expenseCategories.map((c) => c.total_amount),
        },
      });

      setRecent(
        (recentRecords || []).map((r) => ({
          id: r.id,
          date: r.record_date,
          category: r.category?.name,
          type: r.type,
          amount: r.amount,
          notes: r.notes,
        }))
      );
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    if (from && to) {
      fetchDashboard();
    }
  }, [from, to, fetchDashboard]);

  return { summary, charts, recent, loading, error, refetch: fetchDashboard };
};
