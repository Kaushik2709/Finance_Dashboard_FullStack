import React, { useState, useEffect } from 'react';
import { usersAPI } from '../api/users.api.js';
import { formatDate } from '../utils/formatDate.js';
import { AppLayout } from '../components/layout/AppLayout.jsx';
import { Table } from '../components/ui/Table.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Spinner } from '../components/ui/Spinner.jsx';
import { ROLES } from '../utils/constants.js';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const result = await usersAPI.getUsers();
      setUsers(result.users || []);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (data) => {
    try {
      if (editingUser) {
        await usersAPI.updateRole(editingUser.id, data.role);
        toast.success('User role updated');
      } else {
        await usersAPI.createUser(data);
        toast.success('User created');
      }
      fetchUsers();
      setShowModal(false);
      setEditingUser(null);
      reset();
    } catch (err) {
      toast.error(err.data?.message || 'Failed to save user');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      await usersAPI.toggleActive(userId);
      toast.success('User status updated');
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (v) => <Badge variant={v}>{v}</Badge>,
    },
    {
      key: 'active',
      label: 'Status',
      render: (v) => (
        <Badge variant={v ? 'active' : 'inactive'}>
          {v ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    { key: 'createdAt', label: 'Joined', render: (v) => formatDate(v) },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingUser(row);
              reset(row);
              setShowModal(true);
            }}
          >
            Edit Role
          </Button>
          <Button
            size="sm"
            variant={row.active ? 'ghost' : 'success'}
            onClick={() => handleToggleActive(row.id)}
          >
            {row.active ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
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
          <h1 className="text-2xl font-bold text-text-primary">Users</h1>
          <Button
            onClick={() => {
              setEditingUser(null);
              reset();
              setShowModal(true);
            }}
          >
            Add User
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
          <Table columns={tableColumns} data={users} />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingUser(null);
          reset();
        }}
        title={editingUser ? 'Edit User' : 'Add User'}
      >
        <form onSubmit={handleSubmit(handleSaveUser)} className="space-y-4">
          <Input
            label="Name"
            {...register('name', { required: 'Name is required' })}
            disabled={!!editingUser}
          />
          <Input
            label="Email"
            type="email"
            {...register('email', { required: 'Email is required' })}
            disabled={!!editingUser}
          />
          {!editingUser && (
            <Input
              label="Password"
              type="password"
              {...register('password', { required: 'Password is required' })}
            />
          )}
          <Select
            label="Role"
            options={[
              { value: ROLES.VIEWER, label: 'Viewer' },
              { value: ROLES.ANALYST, label: 'Analyst' },
              { value: ROLES.ADMIN, label: 'Admin' },
            ]}
            {...register('role', { required: 'Role is required' })}
          />
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingUser ? 'Update' : 'Create'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowModal(false);
                setEditingUser(null);
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
