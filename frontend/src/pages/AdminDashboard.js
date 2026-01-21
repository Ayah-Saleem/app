import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Users, FileText, MessageSquare, Activity, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, feedbackRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/feedback')
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setFeedback(feedbackRes.data.feedback);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFeedbackStatus = async (id, status) => {
    try {
      await api.put(`/admin/feedback/${id}/status?status=${status}`);
      setFeedback(feedback.map(f => f.id === id ? { ...f, status } : f));
    } catch (error) {
      console.error('Failed to update feedback status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4" data-testid="admin-dashboard">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor Jusoor system</p>
        </div>

        {/* Stats Cards */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-testid="stats-cards">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-primary" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <div className="text-3xl font-bold">{stats?.total_users || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Users</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-secondary" />
                  <span className="text-xs text-muted-foreground">All Time</span>
                </div>
                <div className="text-3xl font-bold">{stats?.total_translations || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Translations</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-green-600" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
                <div className="text-3xl font-bold">{stats?.total_sessions || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Sessions</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                  <span className="text-xs text-muted-foreground">Pending</span>
                </div>
                <div className="text-3xl font-bold">{stats?.total_feedback || 0}</div>
                <div className="text-sm text-muted-foreground mt-1">Feedback</div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Recent Activity (7 Days)</h2>
              </div>
              <div className="text-3xl font-bold text-primary">{stats?.recent_translations_7days || 0}</div>
              <p className="text-muted-foreground mt-1">New translations this week</p>
            </div>
          </>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              data-testid="overview-tab"
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'users' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              data-testid="users-tab"
            >
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                activeTab === 'feedback' ? 'bg-primary text-white' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              data-testid="feedback-tab"
            >
              Feedback ({feedback.length})
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'users' && (
              <div className="overflow-x-auto" data-testid="users-table">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Name</th>
                      <th className="text-left py-3 px-4">Email</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4">{user.full_name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-4" data-testid="feedback-list">
                {feedback.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{item.full_name || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">{item.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{item.feedback_type}</span>
                          <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.rating && (
                          <span className="text-yellow-500">{'⭐'.repeat(item.rating)}</span>
                        )}
                        <select
                          value={item.status}
                          onChange={(e) => updateFeedbackStatus(item.id, e.target.value)}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{item.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
