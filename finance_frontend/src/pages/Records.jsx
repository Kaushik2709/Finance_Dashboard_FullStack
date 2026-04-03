import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth.js';
import { useRecords } from '../hooks/useRecords.js';
import { recordsAPI } from '../api/records.api.js';
import { categoriesAPI } from '../api/categories.api.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { formatDate } from '../utils/formatDate.js';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { RoleGuard } from '../components/guards/RoleGuard.jsx';
import { ROLES, RECORD_TYPES } from '../utils/constants.js';
import { Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const Records = () => {
  const { user, isRole } = useAuth();
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    from: '',
    to: '',
  });
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { records, loading, error, refetch } = useRecords(filters);
  const { register, handleSubmit, reset } = useForm();

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredRecords = records.filter(
    (record) =>
      !search ||
      (record.notes || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleAddRecord = async (data) => {
    try {
      if (editingRecord) {
        await recordsAPI.updateRecord(editingRecord.id, data);
        toast.success('Record updated');
      } else {
        await recordsAPI.createRecord(data);
        toast.success('Record created');
      }
      refetch();
      setShowModal(false);
      setEditingRecord(null);
      reset();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save record');
    }
  };

  const handleDelete = async (id) => {
    try {
      await recordsAPI.deleteRecord(id);
      toast.success('Record deleted');
      refetch();
      setDeleteConfirm(null);
    } catch {
      toast.error('Failed to delete record');
    }
  };

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
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => {
        const canEdit = isRole(ROLES.ADMIN) || (user?.id === row.userId && isRole(ROLES.ANALYST));
        if (!canEdit && !isRole(ROLES.ADMIN)) return null;

        return (
          <div className="flex gap-2">
            {canEdit && (
              <>
                <button
                  onClick={() => {
                    setEditingRecord(row);
                    reset({
                      amount: row.amount,
                      type: row.type,
                      category: row.categoryId,
                      date: String(row.date || '').slice(0, 10),
                      notes: row.notes,
                    });
                    setShowModal(true);
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(row.id)}
                  className="p-1 hover:bg-danger-light rounded text-danger"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        );
      },
    },
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">Records</h1>
          <RoleGuard roles={[ROLES.ANALYST, ROLES.ADMIN]}>
            <Button
              onClick={() => {
                setEditingRecord(null);
                reset();
                setShowModal(true);
              }}
            >
              Add Record
            </Button>
          </RoleGuard>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-border p-4 flex gap-3 flex-wrap">
          <Select
            options={[
              { value: '', label: 'All Types' },
              ...RECORD_TYPES.map((t) => ({ value: t, label: t })),
            ]}
            value={filters.type}
            onChange={(e) =>
              setFilters({ ...filters, type: e.target.value })
            }
            className="w-40"
          />
          <Select
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="w-40"
          />
          <Input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters({ ...filters, from: e.target.value })
            }
            className="w-40"
            placeholder="From date"
          />
          <Input
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters({ ...filters, to: e.target.value })
            }
            className="w-40"
            placeholder="To date"
          />
          <Input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button
            variant="ghost"
            onClick={() => {
              setFilters({ type: '', category: '', from: '', to: '' });
              setSearch('');
            }}
          >
            Reset
          </Button>
        </div>

        {/* Table */}
        {error ? (
          <div className="text-center text-danger p-6">{error}</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
            <Table columns={tableColumns} data={filteredRecords} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingRecord(null);
          reset();
        }}
        title={editingRecord ? 'Edit Record' : 'Add Record'}
      >
        <form onSubmit={handleSubmit(handleAddRecord)} className="space-y-4">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            {...register('amount', { required: 'Amount is required' })}
          />
          <Select
            label="Type"
            options={RECORD_TYPES.map((t) => ({ value: t, label: t }))}
            {...register('type', { required: 'Type is required' })}
          />
          <Select
            label="Category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            {...register('category', { required: 'Category is required' })}
          />
          <Input
            label="Date"
            type="date"
            {...register('date', { required: 'Date is required' })}
          />
          <Input
            label="Notes"
            as="textarea"
            {...register('notes')}
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingRecord ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                setEditingRecord(null);
                reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Record"
      >
        <div className="space-y-4">
          <p className="text-text-secondary">
            Are you sure you want to delete this record? This action cannot be
            undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              onClick={() => handleDelete(deleteConfirm)}
              className="flex-1"
            >
              Delete
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm(null)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};
