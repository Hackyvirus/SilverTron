import React, { useEffect, useState } from 'react';
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
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis
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

interface Withdrawal {
  id: string;
  profileId: string;
  amount: number;
  reason: string;
  status: string;
  reviewedAt: string | null;
  createdAt: string;
}

interface Stats {
  totalValue: number;
  endBalance: number;
  share: number;
  empShare: number;
}

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<{ size?: number }>;
  color: TabConfig;
}

interface CustomTabProps {
  type: PerformanceType;
  isActive: boolean;
  onClick: () => void;
}

export default function DashboardPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])

  const [data, setData] = useState<Record<PerformanceType, Performance[]>>({
    eq: [],
    op: [],
    in: [],
    total: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<PerformanceType>('eq');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Simulated data for demo
        const simulatedData = {
          eq: [{
            id: '1',
            profileId: '1',
            recordedAt: new Date().toISOString(),
            accountNumber: 12345,
            accountType: 'Equity',
            startBalance: 10000,
            stockLocate: 500,
            techFees: 50,
            adjFees: 25,
            unrealizedDelta: 1200,
            total: 11200,
            cashInOut: 0,
            Transfer: 0,
            endUnrealized: 1200,
            endBalance: 11200,
            orders: [10, 5, 8],
            fills: [8, 4, 6],
            qty: [100, 50, 75],
            gross: [800, 400, 600],
            tradeFees: [10, 5, 8],
            adjNet: [790, 395, 592],
            profile: {
              id: '1',
              userId: '1',
              email: 'john@example.com',
              fullName: 'John Doe',
              phoneNumber: '+1234567890',
              role: 'trader',
              onboarded: true,
              passportNumber: 'AB123456',
              currentAddress: '123 Main St',
              permanentAddress: '123 Main St',
              alternateContactNumber: '+0987654321',
              dateOfBirth: '1990-01-01',
              panNumber: 'ABCDE1234F',
              aadhaarNumber: '123456789012',
              educationDetails: 'MBA Finance',
              bloodGroup: 'O+',
              photoFileName: 'photo.jpg',
              share: 15,
              accountNumber: '12345',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }],
          op: [],
          in: [],
          total: []
        };
        setData(simulatedData);
        setWithdrawals([{
          id: '1',
          profileId: '1',
          amount: 500,
          reason: 'Personal',
          status: 'approved',
          reviewedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }]);
      } catch (error) {
        console.error('Failed to fetch performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const consolidateAccountData = (performances: Performance[]): ConsolidatedAccount[] => {
    const accountMap = new Map<number, Performance[]>();

    performances.forEach(perf => {
      if (!accountMap.has(perf.accountNumber)) {
        accountMap.set(perf.accountNumber, []);
      }
      accountMap.get(perf.accountNumber)!.push(perf);
    });

    return Array.from(accountMap.entries()).map(([accountNumber, data]) => {
      const sortedData = data.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
      const latestData = sortedData[0];
      
      const chartData = [...sortedData].map(item => ({
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
    });
  };

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

  const getChangePercentage = (current: number, previous: number): number =>
    previous === 0 ? 0 : ((current - previous) / previous) * 100;

  const getTotalStats = (): Record<PerformanceType, Stats> => {
    const stats = {} as Record<PerformanceType, Stats>;

    PERFORMANCE_TYPES.forEach(type => {
      const typeData = data[type] || [];
      const consolidatedAccounts = consolidateAccountData(typeData);
      stats[type] = {
        totalValue: consolidatedAccounts.reduce((sum, account) => sum + (account.latestData?.total ?? 0), 0),
        endBalance: consolidatedAccounts.reduce((sum, account) => sum + (account.latestData?.endBalance ?? 0), 0),
        share: consolidatedAccounts.reduce((sum, account) => sum + (account.latestData?.profile.share ?? 0), 0),
        empShare: 0,
      };
    });
    return stats;
  };

  const stats = getTotalStats();

  const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, color }) => (
    <div className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl ${color.lightColor} ${color.borderColor} border-2 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${color.color} text-white`}>
          <Icon size={20} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span className="text-xs sm:text-sm font-medium">{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <h3 className={`text-sm sm:text-lg font-semibold ${color.textColor} mb-1`}>{title}</h3>
      <p className="text-lg sm:text-2xl font-bold text-gray-800 break-words">{value}</p>
    </div>
  );

  const CustomTab: React.FC<CustomTabProps> = ({ type, isActive, onClick }) => {
    const { label, icon: Icon } = TAB_CONFIG[type];
    return (
      <button
        onClick={onClick}
        className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-full font-medium transition-colors duration-300 text-sm sm:text-base ${isActive ? 'bg-white shadow text-blue-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
      >
        <Icon size={14} />
        <span className="hidden xs:inline sm:inline">{label}</span>
        <span className="xs:hidden sm:hidden">{label.charAt(0)}</span>
      </button>
    );
  };

  const consolidatedData = consolidateAccountData(data[activeTab]);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Tab Navigation - Responsive */}
        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 mb-4 sm:mb-6 bg-gray-100 p-2 rounded-xl">
          {PERFORMANCE_TYPES.map(type => (
            <CustomTab key={type} type={type} isActive={activeTab === type} onClick={() => setActiveTab(type)} />
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          </div>
        ) : (
          <>
            {/* Stats Grid - Fully Responsive */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <StatCard
                title="Total Value"
                value={formatCurrency(stats[activeTab].totalValue)}
                icon={DollarSign}
                color={TAB_CONFIG[activeTab]}
              />
              <StatCard
                title="End Balance"
                value={formatCurrency(stats[activeTab].endBalance)}
                icon={TrendingUp}
                color={TAB_CONFIG[activeTab]}
              />
              <StatCard
                title="Total Share"
                value={stats[activeTab].share.toString()}
                icon={FileText}
                color={TAB_CONFIG[activeTab]}
              />
              <StatCard
                title="Emp Share"
                value={((stats[activeTab].totalValue * (stats[activeTab].share / 100)).toFixed(2).toString())}
                icon={FileText}
                color={TAB_CONFIG[activeTab]}
              />
              <div className="xs:col-span-2 sm:col-span-3 md:col-span-1">
                <StatCard
                  title="Net Amount"
                  value={(() => {
                    const gross = stats[activeTab].totalValue * (stats[activeTab].share / 100);
                    const net = gross - (withdrawals[0]?.amount ?? 0);
                    const adjustedNet = activeTab === 'total' ? net : Math.max(0, net);
                    return adjustedNet.toFixed(2);
                  })()}
                  icon={FileText}
                  color={TAB_CONFIG[activeTab]}
                />
              </div>
            </div>

            {/* Account Data Cards */}
            {consolidatedData.map(account => (
              <div
                key={account.accountNumber}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 shadow-sm mb-4 sm:mb-6"
              >
                {/* Account Header - Responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-800 break-words">
                      {account.profile.fullName} - {account.accountNumber}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">{account.accountType}</p>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 flex items-center space-x-2">
                    <Clock size={14} />
                    <span className="break-words">{formatDate(account.latestData.recordedAt)}</span>
                  </div>
                </div>

                {/* Withdrawals Chart - Responsive */}
                {withdrawals.length > 0 && (
                  <div className="bg-white p-3 sm:p-6 rounded-xl border border-gray-200 mb-6 sm:mb-10">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Withdrawals Money Timeline</h3>
                    <div className="w-full overflow-x-auto">
                      <div className="min-w-[300px] h-[200px] sm:h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={withdrawals
                              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                              .map(w => ({
                                date: new Date(w.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                }),
                                amount: w.amount
                              }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 12 }}
                              interval="preserveStartEnd"
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="amount" stroke="#f97316" fill="#fed7aa" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Metric Charts - Responsive Grid */}
                <div className="mt-6 sm:mt-10 space-y-6 sm:space-y-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {([
                      'orders',
                      'fills',
                      'qty',
                      'startBalance',
                      'stockLocate',
                      'techFees',
                      'adjFees',
                      'unrealizedDelta',
                      'total',
                      'cashInOut',
                      'Transfer',
                      'endUnrealized',
                      'endBalance',
                      'gross',
                      'tradeFees',
                      'adjNet',
                    ] as const).map((metric, index) => (
                      <div key={metric} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3 capitalize">
                          {metric.replace(/([A-Z])/g, ' $1')}
                        </h4>
                        <div className="w-full overflow-x-auto">
                          <div className="min-w-[280px] h-[180px] sm:h-[220px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={account.historicalData
                                  .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
                                  .map((item) => ({
                                    date: new Date(item.recordedAt).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true,
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
                                <Tooltip 
                                  contentStyle={{ fontSize: '12px' }}
                                />
                                <Area
                                  type="natural"
                                  dataKey="value"
                                  stroke={index % 3 === 0 ? "#3b82f6" : index % 3 === 1 ? "#a855f7" : "#10b981"}
                                  fill={index % 3 === 0 ? "#dbeafe" : index % 3 === 1 ? "#f3e8ff" : "#d1fae5"}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}