import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../api/categories.api.js';
import { formatDate } from '../utils/formatDate.js';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesAPI.getCategories();
      setCategories(data || []);
    } catch {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async (data) => {
    try {
      await categoriesAPI.createCategory(data);
      toast.success('Category created');
      fetchCategories();
      setShowModal(false);
      reset();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to create category');
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'createdAt', label: 'Created At', render: (v) => formatDate(v) },
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
          <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
          <Button onClick={() => setShowModal(true)}>
            Add Category
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <Table columns={tableColumns} data={categories} />
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          reset();
        }}
        title="Add Category"
      >
        <form onSubmit={handleSubmit(handleSaveCategory)} className="space-y-4">
          <Input
            label="Name"
            {...register('name', { required: 'Name is required' })}
          />
          <Select
            label="Type"
            options={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
              { value: 'both', label: 'Both' },
            ]}
            {...register('type', { required: 'Type is required' })}
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Create
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                reset();
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
};
