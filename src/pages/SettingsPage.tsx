import React, { useState, useEffect } from 'react';
import type { Manager } from '../types/database';
import TitleBar from '../components/TitleBar';

interface SettingsPageProps {
  currentManager: Manager;
  onNavigate: (view: 'dashboard' | 'rooms' | 'guests' | 'settings') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentManager, onNavigate }) => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newManagerData, setNewManagerData] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadManagers = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.getManagers();
      if (result.success && result.managers) {
        setManagers(result.managers);
      }
    } catch (err) {
      console.error('Failed to load managers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, []);

  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const result = await window.electronAPI.createManager(
        newManagerData.email,
        newManagerData.password,
        newManagerData.fullName
      );

      if (result.success) {
        setSuccess('Manager created successfully');
        setNewManagerData({ email: '', password: '', fullName: '' });
        setIsAddModalOpen(false);
        loadManagers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to add manager');
      }
    } catch (err: any) {
      setError('An error occurred while adding manager');
      console.error('Add manager error:', err);
    }
  };

  const handleDeleteManager = async (managerId: number, _managerName: string) => {
    if (!confirm('Are you sure you want to delete this manager?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const result = await window.electronAPI.deleteManager(managerId, currentManager.ManagerId);

      if (result.success) {
        setSuccess('Manager deleted successfully');
        loadManagers();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Cannot delete the last manager');
      }
    } catch (err: any) {
      setError('An error occurred while deleting manager');
      console.error('Delete manager error:', err);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background-dark font-display">
      <TitleBar title="Hotel Reservation - Settings" />
      <div className="flex flex-1">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar-dark p-4 flex flex-col justify-between">
        <div>
          {/* Logo and Admin Info */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center bg-primary rounded-full size-10">
              <span className="text-text-primary font-bold text-lg">{currentManager.FullName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-text-primary text-base font-medium">{currentManager.FullName}</h1>
              <p className="text-text-secondary text-sm">{currentManager.Email}</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex flex-col gap-2">
            <button 
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <p className="text-sm font-medium">Dashboard</p>
            </button>

            <button 
              onClick={() => onNavigate('rooms')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">bed</span>
              <p className="text-sm font-medium">Rooms</p>
            </button>

            <button 
              onClick={() => onNavigate('guests')}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary hover:bg-hover-dark transition-colors"
            >
              <span className="material-symbols-outlined">group</span>
              <p className="text-sm font-medium">Guests</p>
            </button>
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-hover-dark text-text-primary"
          >
            <span className="material-symbols-outlined">settings</span>
            <p className="text-sm font-medium">Settings</p>
          </button>

          <button 
            onClick={() => {
              localStorage.removeItem('managerId');
              window.location.reload();
            }}
            className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary hover:bg-blue-600 text-text-primary text-sm font-bold transition-colors"
          >
            <span className="truncate">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-text-primary text-4xl font-black tracking-tight mb-2">Settings</h1>
          <p className="text-text-secondary text-base">
            Manage manager accounts and system preferences.
          </p>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <span className="material-symbols-outlined text-green-500">check_circle</span>
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <span className="material-symbols-outlined text-red-500">error</span>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Managers Section */}
        <div className="bg-card-dark border border-border-color rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-text-primary text-2xl font-bold mb-1">Manager Accounts</h2>
              <p className="text-text-secondary text-sm">Manage who has access to the system</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-text-primary rounded-lg font-semibold transition-colors"
            >
              <span className="material-symbols-outlined">add</span>
              <span>Add Manager</span>
            </button>
          </div>

          {/* Managers List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading managers...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {managers.map((manager) => (
                <div
                  key={manager.ManagerId}
                  className="flex items-center justify-between p-4 bg-hover-dark border border-border-color rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full">
                      <span className="text-text-primary font-bold text-xl">
                        {manager.FullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-text-primary font-semibold">{manager.FullName}</p>
                        {manager.ManagerId === currentManager.ManagerId && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary text-sm">{manager.Email}</p>
                      <p className="text-text-secondary text-xs mt-1">
                        Created: {formatDate(manager.CreatedAt)}
                        {manager.LastLoginAt && ` • Last login: ${formatDate(manager.LastLoginAt)}`}
                      </p>
                    </div>
                  </div>

                  {manager.ManagerId !== currentManager.ManagerId && (
                    <button
                      onClick={() => handleDeleteManager(manager.ManagerId, manager.FullName)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined">delete</span>
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Info */}
        <div className="bg-card-dark border border-border-color rounded-2xl p-6">
          <h2 className="text-text-primary text-2xl font-bold mb-4">System Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-hover-dark rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Version</p>
              <p className="text-text-primary font-semibold">1.0.0</p>
            </div>
            <div className="p-4 bg-hover-dark rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Database</p>
              <p className="text-text-primary font-semibold">MySQL 8.0</p>
            </div>
            <div className="p-4 bg-hover-dark rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Total Managers</p>
              <p className="text-text-primary font-semibold">{managers.length}</p>
            </div>
            <div className="p-4 bg-hover-dark rounded-lg">
              <p className="text-text-secondary text-sm mb-1">Current User</p>
              <p className="text-text-primary font-semibold">{currentManager.FullName}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Add Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-card-dark border border-border-color rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-text-primary text-2xl font-bold">Add New Manager</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-text-secondary hover:text-text-primary">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddManager} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={newManagerData.fullName}
                  onChange={(e) => setNewManagerData({ ...newManagerData, fullName: e.target.value })}
                  className="w-full px-4 py-3 bg-hover-dark border border-border-color rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  placeholder="John Doe"
                  required
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={newManagerData.email}
                  onChange={(e) => setNewManagerData({ ...newManagerData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-hover-dark border border-border-color rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  placeholder="manager@hotel.com"
                  required
                  autoComplete="off"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={newManagerData.password}
                  onChange={(e) => setNewManagerData({ ...newManagerData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-hover-dark border border-border-color rounded-lg text-text-primary placeholder-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
                  placeholder="Enter password"
                  required
                  minLength={6}
                  autoComplete="off"
                />
                <p className="text-text-secondary text-xs mt-1">Minimum 6 characters</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-hover-dark text-text-primary rounded-lg font-semibold hover:bg-border-color transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary hover:bg-blue-600 text-text-primary rounded-lg font-semibold transition-colors"
                >
                  Add Manager
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default SettingsPage;

