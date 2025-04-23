import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, Users, MessageSquare, Activity } from 'lucide-react';
import analyticsService from '../services/analyticsService';

const AnalyticsDashboard = () => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('30days');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Get start date based on time range
  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '7days':
        return new Date(now.setDate(now.getDate() - 7)).toISOString();
      case '90days':
        return new Date(now.setDate(now.getDate() - 90)).toISOString();
      case '30days':
      default:
        return new Date(now.setDate(now.getDate() - 30)).toISOString();
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const startDate = getStartDate();
      const endDate = new Date().toISOString();
      
      const { data, error } = await analyticsService.getAnalyticsData(startDate, endDate);
      
      if (error) throw error;
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export analytics data as CSV
  const exportAnalyticsData = async () => {
    try {
      const startDate = getStartDate();
      const endDate = new Date().toISOString();
      
      const { data, error } = await analyticsService.exportAnalyticsData(startDate, endDate);
      
      if (error) throw error;
      
      // Create a download link
      const blob = new Blob([data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting analytics data:', err);
      setError('Failed to export analytics data. Please try again.');
    }
  };

  // Fetch data when time range changes
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          {t('common.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold mb-4 md:mb-0">{t('analytics.title')}</h2>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1 text-sm ${
                timeRange === '7days' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {t('analytics.timeRanges.7days')}
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1 text-sm ${
                timeRange === '30days' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {t('analytics.timeRanges.30days')}
            </button>
            <button
              onClick={() => setTimeRange('90days')}
              className={`px-3 py-1 text-sm ${
                timeRange === '90days' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {t('analytics.timeRanges.90days')}
            </button>
          </div>
          
          <button
            onClick={exportAnalyticsData}
            className="flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
          >
            <Download size={16} />
            {t('analytics.export')}
          </button>
        </div>
      </div>
      
      {analyticsData && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">{t('analytics.stats.totalUsers')}</h3>
                  <p className="text-2xl font-bold">{analyticsData.totalUsers}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Calendar size={20} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">{t('analytics.stats.totalSessions')}</h3>
                  <p className="text-2xl font-bold">{analyticsData.totalSessions}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <MessageSquare size={20} className="text-purple-500" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">{t('analytics.stats.totalMessages')}</h3>
                  <p className="text-2xl font-bold">{analyticsData.totalMessages}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Messages by Day */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">{t('analytics.charts.messagesByDay')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.messagesByDay}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Messages"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Messages by Role */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">{t('analytics.charts.messagesByRole')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analyticsData.messagesByRole}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="role"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analyticsData.messagesByRole.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Feature Usage */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">{t('analytics.charts.featureUsage')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analyticsData.featureUsage}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="event_name" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="count" name="Usage Count" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* User Retention */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">{t('analytics.charts.userRetention')}</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData.userRetention}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="cohort_date" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#333', border: 'none' }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="retention_rate"
                      name="Retention Rate (%)"
                      stroke="#ff8042"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
