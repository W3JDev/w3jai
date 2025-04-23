import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../services/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart2, PieChart as PieChartIcon, Users, MessageSquare, Calendar, Download } from 'lucide-react';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d'); // 7d, 30d, 90d
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSessions: 0,
    totalMessages: 0,
    messagesByDay: [],
    messagesByRole: [],
    featureUsage: [],
    userRetention: []
  });

  useEffect(() => {
    if (user?.id) {
      loadAnalyticsData();
    }
  }, [user, timeRange]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Only admins should be able to see analytics
      const { data: isAdmin } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (!isAdmin?.is_admin) {
        setError('You do not have permission to view analytics');
        setLoading(false);
        return;
      }
      
      // Calculate date range
      const now = new Date();
      let startDate;
      
      switch (timeRange) {
        case '7d':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case '30d':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case '90d':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
      }
      
      const startDateStr = startDate.toISOString();
      
      // Get total users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });
      
      if (usersError) throw usersError;
      
      // Get total sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('analytics_events')
        .select('session_id')
        .gte('timestamp', startDateStr)
        .eq('event_name', 'page_view');
      
      if (sessionsError) throw sessionsError;
      
      // Get unique sessions
      const uniqueSessions = new Set();
      sessionsData.forEach(event => uniqueSessions.add(event.session_id));
      
      // Get total messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact' })
        .gte('created_at', startDateStr);
      
      if (messagesError) throw messagesError;
      
      // Get messages by day
      const { data: messagesByDayData, error: messagesByDayError } = await supabase
        .rpc('get_messages_by_day', { start_date: startDateStr });
      
      if (messagesByDayError) throw messagesByDayError;
      
      // Get messages by role
      const { data: messagesByRoleData, error: messagesByRoleError } = await supabase
        .rpc('get_messages_by_role', { start_date: startDateStr });
      
      if (messagesByRoleError) throw messagesByRoleError;
      
      // Get feature usage
      const { data: featureUsageData, error: featureUsageError } = await supabase
        .from('analytics_events')
        .select('properties')
        .eq('event_name', 'feature_usage')
        .gte('timestamp', startDateStr);
      
      if (featureUsageError) throw featureUsageError;
      
      // Process feature usage data
      const featureUsageMap = {};
      featureUsageData.forEach(event => {
        const featureName = event.properties.feature_name;
        featureUsageMap[featureName] = (featureUsageMap[featureName] || 0) + 1;
      });
      
      const featureUsage = Object.entries(featureUsageMap).map(([name, count]) => ({
        name,
        count
      }));
      
      // Get user retention data
      const { data: retentionData, error: retentionError } = await supabase
        .rpc('get_user_retention', { start_date: startDateStr });
      
      if (retentionError) throw retentionError;
      
      setStats({
        totalUsers: usersData.length,
        totalSessions: uniqueSessions.size,
        totalMessages: messagesData.length,
        messagesByDay: messagesByDayData || [],
        messagesByRole: messagesByRoleData || [],
        featureUsage: featureUsage || [],
        userRetention: retentionData || []
      });
      
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      // Get all analytics data
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      // Convert to CSV
      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => {
        return Object.values(row).map(value => {
          if (typeof value === 'object') {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return `"${value}"`;
        }).join(',');
      });
      
      const csv = [headers, ...rows].join('\n');
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      console.error('Error exporting analytics data:', err);
      setError('Failed to export analytics data');
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg text-white">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-gray-700/50 rounded"></div>
            <div className="h-24 bg-gray-700/50 rounded"></div>
            <div className="h-24 bg-gray-700/50 rounded"></div>
          </div>
          <div className="h-64 bg-gray-700/50 rounded"></div>
          <div className="h-64 bg-gray-700/50 rounded"></div>
        </div>
      </div>
    );
  }

  // Colors for charts
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F'];

  return (
    <div className="p-6 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 md:mb-0 flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-blue-400" />
          Analytics Dashboard
        </h2>
        
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-sm ${
                timeRange === '7d' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 text-sm ${
                timeRange === '30d' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90d')}
              className={`px-3 py-1 text-sm ${
                timeRange === '90d' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              90 Days
            </button>
          </div>
          
          <button
            onClick={handleExportData}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-gray-300 font-medium">Total Users</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-gray-300 font-medium">Total Sessions</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalSessions}</p>
        </div>
        
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <MessageSquare className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-gray-300 font-medium">Total Messages</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalMessages}</p>
        </div>
      </div>
      
      {/* Messages by Day Chart */}
      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <BarChart2 className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-gray-200 font-medium">Messages by Day</h3>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.messagesByDay}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="date" 
                stroke="#aaa"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="count" name="Messages" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Messages by Role & Feature Usage */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Messages by Role */}
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <PieChartIcon className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-gray-200 font-medium">Messages by Role</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.messagesByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="role"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.messagesByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Feature Usage */}
        <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <BarChart2 className="h-5 w-5 text-green-400" />
            </div>
            <h3 className="text-gray-200 font-medium">Feature Usage</h3>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.featureUsage}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis type="number" stroke="#aaa" />
                <YAxis dataKey="name" type="category" stroke="#aaa" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#e5e7eb' }}
                  itemStyle={{ color: '#e5e7eb' }}
                />
                <Legend />
                <Bar dataKey="count" name="Usage Count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* User Retention */}
      <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-500/20 rounded-lg">
            <Users className="h-5 w-5 text-yellow-400" />
          </div>
          <h3 className="text-gray-200 font-medium">User Retention</h3>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stats.userRetention}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis 
                dataKey="cohort_date" 
                stroke="#aaa"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem' }}
                labelStyle={{ color: '#e5e7eb' }}
                itemStyle={{ color: '#e5e7eb' }}
              />
              <Legend />
              <Bar dataKey="retention_rate" name="Retention Rate (%)" fill="#eab308" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
