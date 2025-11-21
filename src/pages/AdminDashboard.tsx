import { useState, useEffect } from 'react';
import { BarChart3, Users, AlertCircle, FileText, Edit2, Check, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ users: 0, sosAlerts: 0, incidents: 0, posts: 0 });
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('new');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    fetchDashboardData();
  }, [isAuthenticated, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [usersRes, sosRes, incidentsRes, postsRes] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('sos_alerts').select('id', { count: 'exact' }),
        supabase.from('incidents').select('*'),
        supabase.from('forum_posts').select('id', { count: 'exact' })
      ]);

      setStats({
        users: usersRes.count || 0,
        sosAlerts: sosRes.count || 0,
        incidents: incidentsRes.count || 0,
        posts: postsRes.count || 0
      });

      setIncidents(incidentsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .update({ status: newStatus })
        .eq('id', incidentId);

      if (error) throw error;
      await fetchDashboardData();
    } catch (err) {
      console.error('Error updating incident:', err);
      alert('Failed to update incident');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle size={48} className="text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredIncidents = incidents.filter(i => !selectedStatus || i.status === selectedStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-xl text-gray-600 mb-12">Platform statistics and incident management</p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.users}</p>
              </div>
              <Users size={40} className="text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">SOS Alerts</p>
                <p className="text-4xl font-bold text-red-600 mt-2">{stats.sosAlerts}</p>
              </div>
              <AlertCircle size={40} className="text-red-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Incidents</p>
                <p className="text-4xl font-bold text-orange-600 mt-2">{stats.incidents}</p>
              </div>
              <FileText size={40} className="text-orange-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Forum Posts</p>
                <p className="text-4xl font-bold text-green-600 mt-2">{stats.posts}</p>
              </div>
              <BarChart3 size={40} className="text-green-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Incidents Management */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Edit2 size={24} />
            Incident Management
          </h2>

          {/* Status Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedStatus('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedStatus === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                selectedStatus === 'new'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              <Clock size={18} /> New
            </button>
            <button
              onClick={() => setSelectedStatus('in_progress')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                selectedStatus === 'in_progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              <Edit2 size={18} /> In Progress
            </button>
            <button
              onClick={() => setSelectedStatus('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                selectedStatus === 'resolved'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
              }`}
            >
              <Check size={18} /> Resolved
            </button>
          </div>

          {/* Incidents Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Title</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map(incident => (
                  <tr key={incident.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{incident.title}</td>
                    <td className="py-3 px-4 text-gray-600 capitalize">{incident.incident_type}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        incident.status === 'new'
                          ? 'bg-yellow-100 text-yellow-800'
                          : incident.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(incident.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={incident.status}
                        onChange={(e) => handleUpdateIncidentStatus(incident.id, e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredIncidents.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                No incidents found with the selected status.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
