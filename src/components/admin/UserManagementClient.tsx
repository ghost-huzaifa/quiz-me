'use client';

import { useState, useTransition, useActionState, useEffect } from 'react';
import { addUserAction, deleteUserAction, toggleUserRoleAction, grantReattemptAction } from '@/actions/user';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
}

interface Quiz {
  id: string;
  title: string;
}

interface Attempt {
  userId: string;
  quizId: string;
}

interface Permission {
  userId: string;
  quizId: string;
}

interface UserManagementClientProps {
  users: User[];
  quizzes: Quiz[];
  attempts: Attempt[];
  permissions: Permission[];
}

export default function UserManagementClient({
  users,
  quizzes,
  attempts,
  permissions,
}: UserManagementClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showReattemptModal, setShowReattemptModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Search/Filter State
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Form State for Add User
  const [addState, addAction, isAddingPending] = useActionState(addUserAction, null);

  useEffect(() => {
    if (addState?.success) {
      setShowAddModal(false);
      // reload/refresh is done by revalidatePath in the action
    }
  }, [addState]);

  // Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;

    startTransition(async () => {
      const res = await deleteUserAction(userId);
      if (!res.success) {
        alert(res.message || 'Failed to delete user.');
      }
    });
  };

  // Toggle User Role
  const handleToggleRole = async (userId: string) => {
    startTransition(async () => {
      const res = await toggleUserRoleAction(userId);
      if (!res.success) {
        alert(res.message || 'Failed to update user role.');
      }
    });
  };

  // Grant Reattempt
  const handleGrantReattempt = async (userId: string, quizId: string) => {
    startTransition(async () => {
      const res = await grantReattemptAction(userId, quizId);
      if (res.success) {
        alert('Reattempt permission granted successfully!');
      } else {
        alert(res.message || 'Failed to grant permission.');
      }
    });
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex-grow flex flex-col gap-6 w-full max-w-container-max mx-auto relative">
      {/* Loading Overlay when API is in flight */}
      {(isPending || isAddingPending) && (
        <div className="fixed inset-0 bg-on-background/10 backdrop-blur-[2px] z-50 flex items-center justify-center pointer-events-auto">
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-level-2 border border-outline-variant/30 flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="font-sans text-body-base font-bold text-on-surface">Updating Database...</span>
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-stack-md mb-2 w-full">
        <div>
          <h1 className="font-sans text-display-lg text-on-background font-bold tracking-tight">User Management</h1>
          <p className="font-sans text-body-base text-on-surface-variant mt-2 leading-snug">
            Manage quiz participants, review attempt history, and configure access roles.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary hover:bg-primary-dark text-on-primary px-6 py-3 rounded-lg font-sans text-body-base font-bold shadow-level-1 hover:shadow-level-2 transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto shrink-0"
        >
          <span className="material-symbols-outlined">person_add</span>
          Add User
        </button>
      </div>

      {/* Filter/Search Bar */}
      <div className="w-full flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg pl-12 pr-4 py-3 font-sans text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow shadow-level-1"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 font-sans text-body-base text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-level-1 sm:w-48 appearance-none bg-no-repeat cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="w-full bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/30 font-sans text-label-caps text-on-surface-variant font-bold uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Quizzes Attempted</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                    No users found matching filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const userAttemptsCount = attempts.filter((a) => a.userId === user.id).length;
                  const initials = user.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={user.id} className="hover:bg-surface-container/10 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold font-sans text-sm shrink-0">
                            {initials}
                          </div>
                          <span className="font-sans text-body-base font-bold text-on-background whitespace-nowrap">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-sans text-body-base text-on-surface-variant whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-caps font-bold ${
                          user.role === 'ADMIN' ? 'bg-primary-container text-on-primary-container' : 'bg-surface-dim text-on-surface'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4 font-sans font-bold text-on-background text-center">
                        {userAttemptsCount}
                      </td>
                      <td className="p-4 font-sans text-body-base text-on-surface-variant whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          {user.role === 'USER' && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowReattemptModal(true);
                              }}
                              className="px-3 py-1 bg-tertiary hover:bg-tertiary-container text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                              title="Manage Reattempts"
                            >
                              <span className="material-symbols-outlined text-[14px]">replay</span>
                              Reattempts
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleRole(user.id)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                            title="Toggle Admin/User Role"
                          >
                            <span className="material-symbols-outlined text-sm">settings_accessibility</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-surface-container-lowest px-6 py-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span>Showing {filteredUsers.length} users.</span>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-level-2 w-full max-w-md border border-outline-variant/30 overflow-hidden flex flex-col transform transition-all scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <h3 className="font-sans text-headline-md-mobile font-bold text-on-background">Add New User</h3>
              <button
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container-high cursor-pointer"
                onClick={() => setShowAddModal(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Modal Body */}
            <form action={addAction}>
              <div className="p-6 flex flex-col gap-stack-md">
                {addState?.message && (
                  <div className="bg-error-container text-on-error-container p-3 rounded-lg border border-error/20 font-bold text-sm">
                    {addState.message}
                  </div>
                )}
                
                <div>
                  <label className="block text-label-caps text-on-surface mb-2 font-bold">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    disabled={isAddingPending}
                    placeholder="e.g. Jane Smith"
                    className="w-full border border-outline-variant/30 rounded-lg p-3 font-sans text-body-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface-bright"
                  />
                </div>
                
                <div>
                  <label className="block text-label-caps text-on-surface mb-2 font-bold">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    required
                    disabled={isAddingPending}
                    placeholder="jane@example.com"
                    className="w-full border border-outline-variant/30 rounded-lg p-3 font-sans text-body-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface-bright"
                  />
                </div>
                
                <div>
                  <label className="block text-label-caps text-on-surface mb-2 font-bold">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    disabled={isAddingPending}
                    placeholder="password123"
                    className="w-full border border-outline-variant/30 rounded-lg p-3 font-sans text-body-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface-bright"
                  />
                </div>
                
                <div>
                  <label className="block text-label-caps text-on-surface mb-2 font-bold">Role</label>
                  <select
                    name="role"
                    disabled={isAddingPending}
                    className="w-full border border-outline-variant/30 rounded-lg p-3 font-sans text-body-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface-bright cursor-pointer"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isAddingPending}
                  className="px-4 py-2 font-sans text-body-base font-bold text-on-surface hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPending}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-on-primary font-sans text-body-base font-bold rounded-lg shadow transition-all cursor-pointer"
                >
                  {isAddingPending ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reattempt Management Modal */}
      {showReattemptModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/50 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-level-2 w-full max-w-lg border border-outline-variant/30 overflow-hidden flex flex-col transform transition-all scale-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-low">
              <div>
                <h3 className="font-sans text-headline-md-mobile font-bold text-on-background">Reattempt Permissions</h3>
                <p className="text-xs text-on-surface-variant font-sans mt-0.5">Manage permissions for {selectedUser.name}</p>
              </div>
              <button
                className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-container-high cursor-pointer"
                onClick={() => {
                  setSelectedUser(null);
                  setShowReattemptModal(false);
                }}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              {quizzes.map((quiz) => {
                const userQuizAttempts = attempts.filter((a) => a.userId === selectedUser.id && a.quizId === quiz.id);
                const attemptsCount = userQuizAttempts.length;
                const hasPermission = permissions.some((p) => p.userId === selectedUser.id && p.quizId === quiz.id);

                return (
                  <div key={quiz.id} className="flex justify-between items-center p-4 border border-outline-variant/20 rounded-xl bg-surface-bright">
                    <div>
                      <p className="font-bold text-sm text-on-background">{quiz.title}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        Attempts: <span className="font-bold">{attemptsCount}</span>
                      </p>
                    </div>

                    <div>
                      {hasPermission ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#e6f4ea] text-[#137333] rounded-full text-xs font-bold uppercase tracking-wider select-none">
                          <span className="material-symbols-outlined text-xs">check_circle</span>
                          Granted
                        </span>
                      ) : attemptsCount > 0 ? (
                        <button
                          onClick={() => handleGrantReattempt(selectedUser.id, quiz.id)}
                          className="px-3 py-1.5 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm"
                        >
                          Allow Reattempt
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant italic select-none">Not Attempted Yet</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/30 bg-surface-container-low flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-on-background text-background font-sans text-xs font-bold rounded-lg hover:opacity-90 cursor-pointer"
                onClick={() => {
                  setSelectedUser(null);
                  setShowReattemptModal(false);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
