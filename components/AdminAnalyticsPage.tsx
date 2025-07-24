import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  User,
  Calendar,
  Activity,
  Loader2,
  ArrowUp,
  ArrowDown,
  FileText,
  Clock,
  AlertCircle,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
  Menu,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LineChart,
  Line
} from 'recharts';

const PERFORMANCE_TYPES = ['eq', 'op', 'in', 'total'] as const;
type PerformanceType = typeof PERFORMANCE_TYPES[number];

interface TabConfig {
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  lightColor: string;
  borderColor: string;
  textColor: string;
}

const TAB_CONFIG: Record<PerformanceType, TabConfig> = {
  eq: {
    label: 'Equity',
    icon: TrendingUp,
    color: 'bg-gradient-to-r from-blue-500 to-blue-600',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-600'
  },
  op: {
    label: 'Options',
    icon: BarChart3,
    color: 'bg-gradient-to-r from-purple-500 to-purple-600',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-600'
  },
  in: {
    label: 'Intraday',
    icon: Activity,
    color: 'bg-gradient-to-r from-green-500 to-green-600',
    lightColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-600'
  },
  total: {
    label: 'Total',
    icon: DollarSign,
    color: 'bg-gradient-to-r from-orange-500 to-orange-600',
    lightColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-600'
  }
};

interface Profile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  onboarded: boolean;
  passportNumber: string;
  currentAddress: string;
  permanentAddress: string;
  alternateContactNumber: string;
  dateOfBirth: string;
  panNumber: string;
  aadhaarNumber: string;
  educationDetails: string;
  bloodGroup: string;
  photoFileName: string;
  share: number;
  accountNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface Performance {
  id: string;
  profileId: string;
  recordedAt: string;
  accountNumber: number;
  accountType: string;
  startBalance: number;
  stockLocate: number;
  techFees: number;
  adjFees: number;
  unrealizedDelta: number;
  total: number;
  cashInOut: number;
  Transfer: number;
  endUnrealized: number;
  endBalance: number;
  orders: number[];
  fills: number[];
  qty: number[];
  gross: number[];
  tradeFees: number[];
  adjNet: number[];
  profile: Profile;
  empShare: number;
}

interface ConsolidatedAccount {
  accountNumber: number;
  accountType: string;
  profile: Profile;
  latestData: Performance;
  historicalData: Performance[];
  chartData: Array<{
    date: string;
    total: number;
    unrealizedDelta: number;
    endBalance: number;
  }>;
}

interface Stats {
  totalValue: number;
  endBalance: number;
  share: number;
  empShare: number;
  previousValue?: number;
  change?: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<{ size?: number }>;
  color: TabConfig;
  isLoading?: boolean;
}

interface CustomTabProps {
  type: PerformanceType;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

export default function ImprovedAdminDashboard() {
  const [data, setData] = useState<Record<PerformanceType, Performance[]>>({
    eq: [],
    op: [],
    in: [],
    total: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<PerformanceType>('eq');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [filterMinBalance, setFilterMinBalance] = useState<number>(0);
  const [showDetailedCharts, setShowDetailedCharts] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulated data for demo purposes
      const mockData = {
        eq: [
          {
            id: '1',
            profileId: '1',
            recordedAt: new Date().toISOString(),
            accountNumber: 12345,
            accountType: 'Equity',
            startBalance: 50000,
            stockLocate: 0,
            techFees: 10,
            adjFees: 5,
            unrealizedDelta: 1500,
            total: 51500,
            cashInOut: 0,
            Transfer: 0,
            endUnrealized: 1500,
            endBalance: 51500,
            orders: [10, 15, 8],
            fills: [10, 12, 8],
            qty: [100, 200, 150],
            gross: [1000, 2000, 1500],
            tradeFees: [10, 20, 15],
            adjNet: [990, 1980, 1485],
            profile: {
              id: '1',
              userId: '1',
              email: 'john@example.com',
              fullName: 'John Doe',
              phoneNumber: '+1234567890',
              role: 'trader',
              onboarded: true,
              passportNumber: 'A1234567',
              currentAddress: '123 Main St',
              permanentAddress: '123 Main St',
              alternateContactNumber: '+1987654321',
              dateOfBirth: '1990-01-01',
              panNumber: 'ABCDE1234F',
              aadhaarNumber: '123456789012',
              educationDetails: 'MBA Finance',
              bloodGroup: 'O+',
              photoFileName: 'john.jpg',
              share: 15,
              accountNumber: '12345',
              createdAt: '2024-01-01',
              updatedAt: '2024-01-01'
            },
            empShare: 7725
          }
        ],
        op: [],
        in: [],
        total: []
      };

      setData(mockData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchData, 30000); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const consolidateAccountData = useMemo(() =>
    (performances: Performance[]): ConsolidatedAccount[] => {
      const accountMap = new Map<number, Performance[]>();

      performances.forEach(perf => {
        if (!accountMap.has(perf.accountNumber)) {
          accountMap.set(perf.accountNumber, []);
        }
        accountMap.get(perf.accountNumber)!.push(perf);
      });

      return Array.from(accountMap.entries())
        .map(([accountNumber, data]) => {
          const sortedData = data.sort((a, b) =>
            new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
          );
          const latestData = sortedData[0];

          const chartData = sortedData
            .slice()
            .reverse()
            .map(item => ({
              date: new Date(item.recordedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }),
              total: item.total,
              unrealizedDelta: item.unrealizedDelta,
              endBalance: item.endBalance
            }));

          return {
            accountNumber,
            accountType: latestData.accountType,
            profile: latestData.profile,
            latestData,
            historicalData: sortedData,
            chartData
          };
        })
        .filter(account => account.latestData.endBalance >= filterMinBalance);
    }, [filterMinBalance]);

  // Calculate stats for the current active tab
  const getStatsForActiveTab = useMemo(() => {
    const currentTabData = data[activeTab] || [];

    if (currentTabData.length === 0) {
      return {
        totalValue: 0,
        endBalance: 0,
        avgShare: 0,
        totalEmpShare: 0
      };
    }

    const totalValue = currentTabData.reduce((sum, item) => sum + item.total, 0);
    const endBalance = currentTabData.reduce((sum, item) => sum + item.endBalance, 0);
    const totalShare = currentTabData.reduce((sum, item) => sum + item.profile.share, 0);
    const avgShare = totalShare / currentTabData.length;
    const totalEmpShare = currentTabData.reduce((sum, item) => sum + item.empShare, 0);

    return {
      totalValue,
      endBalance,
      avgShare,
      totalEmpShare
    };
  }, [data, activeTab]);

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color, isLoading }) => (
    <div className={`p-3 xs:p-4 sm:p-6 rounded-2xl ${color.lightColor} ${color.borderColor} border-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 min-h-[120px] xs:min-h-[140px] sm:min-h-[160px]`}>
      <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4">
        <div className={`p-2 xs:p-2 sm:p-3 rounded-xl ${color.color} text-white flex-shrink-0`}>
          {isLoading ? <Loader2 size={16} className="animate-spin xs:w-5 xs:h-5 sm:w-6 sm:h-6" /> : <Icon size={16}  />}
        </div>
        {change !== undefined && !isLoading && (
          <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'} flex-shrink-0`}>
            {change >= 0 ? <ArrowUp size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" /> : <ArrowDown size={12} className="xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4" />}
            <span className="text-xs xs:text-xs sm:text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className={`text-xs xs:text-sm sm:text-lg font-semibold ${color.textColor} mb-1 xs:mb-2 leading-tight`}>{title}</h3>
      <p className="text-sm xs:text-base sm:text-2xl font-bold text-gray-800 leading-tight">
        {isLoading ? (
          <span className="text-xs xs:text-sm sm:text-base">Loading...</span>
        ) : (
          <span className="break-all">{value}</span>
        )}
      </p>
    </div>
  );

  const CustomTab: React.FC<CustomTabProps> = ({ type, isActive, onClick, count }) => {
    const { label, icon: Icon } = TAB_CONFIG[type];
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${isActive
          ? 'bg-white shadow-md text-blue-600 scale-105'
          : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:scale-102'
          }`}
      >
        <Icon size={14} />
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{label.charAt(0)}</span>
        {count !== undefined && (
          <span className="ml-1 px-2 py-1 text-xs bg-gray-200 rounded-full">
            {count}
          </span>
        )}
      </button>
    );
  };

  const consolidatedData = consolidateAccountData(data[activeTab]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 text-center">
          <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
          <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Analytics Dashboard</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-white shadow-sm border border-gray-200"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg transform transition-transform">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Dashboard Controls</h2>
                  <button onClick={() => setMobileMenuOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {/* Mobile Tabs */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Performance Types</h3>
                  {PERFORMANCE_TYPES.map(type => (
                    <button
                      key={type}
                      onClick={() => {
                        setActiveTab(type);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left ${
                        activeTab === type ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {React.createElement(TAB_CONFIG[type].icon, { size: 16 })}
                        <span>{TAB_CONFIG[type].label}</span>
                      </div>
                      <span className="px-2 py-1 text-xs bg-gray-200 rounded-full">
                        {data[type]?.length || 0}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Mobile Controls */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Balance Filter</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filterMinBalance}
                      onChange={(e) => setFilterMinBalance(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm transition-colors ${
                      autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
                    <span>Auto Refresh {autoRefresh ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => setShowDetailedCharts(!showDetailedCharts)}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm bg-gray-100 text-gray-600"
                  >
                    {showDetailedCharts ? <EyeOff size={16} /> : <Eye size={16} />}
                    <span>Detailed Charts {showDetailedCharts ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => {
                      fetchData();
                      setMobileMenuOpen(false);
                    }}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-sm bg-blue-100 text-blue-600 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    <span>Refresh Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Header Controls */}
        <div className="hidden lg:flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {PERFORMANCE_TYPES.map(type => (
              <CustomTab
                key={type}
                type={type}
                isActive={activeTab === type}
                onClick={() => setActiveTab(type)}
                count={data[type]?.length || 0}
              />
            ))}
          </div>

          <div className="flex items-center space-x-4">
            {/* Filter Controls */}
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-500" />
              <input
                type="number"
                placeholder="Min Balance"
                value={filterMinBalance}
                onChange={(e) => setFilterMinBalance(Number(e.target.value))}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-colors ${
                autoRefresh ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <RefreshCw size={16} className={autoRefresh ? 'animate-spin' : ''} />
              <span>Auto Refresh</span>
            </button>

            {/* Toggle Detailed Charts */}
            <button
              onClick={() => setShowDetailedCharts(!showDetailedCharts)}
              className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              {showDetailedCharts ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>Details</span>
            </button>

            {/* Manual Refresh */}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Mobile Tabs - Horizontal Scroll */}
        <div className="lg:hidden mb-4 overflow-x-auto">
          <div className="flex space-x-2 pb-2" style={{ minWidth: 'max-content' }}>
            {PERFORMANCE_TYPES.map(type => (
              <CustomTab
                key={type}
                type={type}
                isActive={activeTab === type}
                onClick={() => setActiveTab(type)}
                count={data[type]?.length || 0}
              />
            ))}
          </div>
        </div>

        {/* Last Updated Indicator */}
        {lastUpdated && (
          <div className="text-xs text-gray-500 mb-4">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}

        {loading && !data[activeTab].length ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Loader2 className="animate-spin h-8 w-8 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">Loading performance data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="Total"
                value={formatCurrency(getStatsForActiveTab.totalValue)}
                icon={DollarSign}
                color={TAB_CONFIG[activeTab]}
                isLoading={loading}
              />
              <StatCard
                title="End Balance"
                value={formatCurrency(getStatsForActiveTab.endBalance)}
                icon={TrendingUp}
                color={TAB_CONFIG[activeTab]}
                isLoading={loading}
              />
              <StatCard
                title="Avg Share"
                value={`${getStatsForActiveTab.avgShare.toFixed(1)}%`}
                icon={FileText}
                color={TAB_CONFIG[activeTab]}
                isLoading={loading}
              />
              <StatCard
                title="Total Emp Share"
                value={formatCurrency(getStatsForActiveTab.totalEmpShare)}
                icon={User}
                color={TAB_CONFIG[activeTab]}
                isLoading={loading}
              />
            </div>

            {/* Account Data */}
            {consolidatedData.map(account => (
              <div
                key={account.accountNumber}
                className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm mb-4 sm:mb-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                      <span className="block sm:inline">{account.profile.fullName}</span>
                      <span className="block sm:inline sm:ml-2 text-gray-500">- {account.accountNumber}</span>
                    </h2>
                    <p className="text-sm text-gray-500">{account.accountType}</p>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-2">
                    <Clock size={16} />
                    <span className="text-xs sm:text-sm">{formatDate(account.latestData.recordedAt)}</span>
                  </div>
                </div>

                {/* Key Metrics Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm sm:text-lg font-semibold">{formatCurrency(account.latestData.total)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">End Balance</p>
                    <p className="text-sm sm:text-lg font-semibold">{formatCurrency(account.latestData.endBalance)}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Share</p>
                    <p className="text-sm sm:text-lg font-semibold">{account.latestData.profile.share}%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Emp Share</p>
                    <p className="text-sm sm:text-lg font-semibold">{formatCurrency(account.latestData.empShare)}</p>
                  </div>
                </div>

                {/* Main Chart */}
                <div className="mb-6">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Performance Overview</h4>
                  <div className="h-48 sm:h-64 lg:h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={account.chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="endBalance" stroke="#10b981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Detailed Charts */}
                {showDetailedCharts && (
                  <div className="mt-6 sm:mt-10 space-y-6 sm:space-y-8">
                    {(['startBalance', 'endBalance', 'total', 'unrealizedDelta', 'techFees', 'tradeFees'] as const).map((metric) => (
                      <div key={metric}>
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 capitalize">
                          {metric.replace(/([A-Z])/g, ' $1')}
                        </h4>
                        <div className="h-32 sm:h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={account.historicalData
                                .slice()
                                .reverse()
                                .map((item) => ({
                                  date: new Date(item.recordedAt).toLocaleString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }),
                                  value: Array.isArray(item[metric])
                                    ? (item[metric] as number[]).reduce((a, b) => a + b, 0)
                                    : (item[metric] as number),
                                }))}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fontSize: 10 }}
                                interval="preserveStartEnd"
                              />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#8884d8"
                                fill="#8884d8"
                                fillOpacity={0.3}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {consolidatedData.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
                <p className="text-sm sm:text-base text-gray-500">No performance data found for the selected criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
                                