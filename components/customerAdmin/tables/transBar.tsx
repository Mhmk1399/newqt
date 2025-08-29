'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DynamicBar from '@/components/dynamicBar';

// Transaction interface based on your actual API structure
interface Transaction {
  _id: string;
  date: string;
  subject: string;
  debtor: number;
  fastener: number;
  users: {
    _id: string;
    name: string;
    email: string;
  };
  customer: {
    _id: string;
    name: string;
    email: string;
    businessName: string;
  };
  __v: number;
}

interface TransactionStats {
  totalDebtor: number;
  totalFastener: number;
  totalTransactions: number;
  avgDebtorAmount: number;
  avgFastenerAmount: number;
  netAmount: number;
  recentTransactions: Transaction[];
}

interface UserGroup {
  [key: string]: string | number;
  name: string;
  count: number;
  value: number;
  debtor: number;
  fastener: number;
}

interface DateGroup {
  [key: string]: string | number;
  name: string;
  count: number;
  value: number;
  debtor: number;
  fastener: number;
}

interface DebtorFastenerData {
  [key: string]: string | number;
  name: string;
  value: number;
  count: number;
}

interface SubjectGroup {
  [key: string]: string | number;
  name: string;
  count: number;
  value: number;
  debtor: number;
  fastener: number;
}

interface UserSummary {
  name: string;
  email: string;
  totalDebtor: number;
  totalFastener: number;
  transactionCount: number;
  netAmount: number;
}

interface SubjectSummary {
  subject: string;
  totalDebtor: number;
  totalFastener: number;
  transactionCount: number;
  netAmount: number;
}

export const TransBar: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<TransactionStats>({
    totalDebtor: 0,
    totalFastener: 0,
    totalTransactions: 0,
    avgDebtorAmount: 0,
    avgFastenerAmount: 0,
    netAmount: 0,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get customer ID from token (similar to customer forms)
  const getCustomerIdFromToken = (): string | null => {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        console.error("توکن مشتری در localStorage یافت نشد");
        return null;
      }

      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      console.log("توکن رمزگشایی شده:", decodedToken);

      if (decodedToken.userId) {
        return decodedToken.userId;
      } else {
        console.error("customerId در محتوای توکن یافت نشد");
        return null;
      }
    } catch (error) {
      console.error("خطا در رمزگشایی توکن:", error);
      return null;
    }
  };

  // Fetch transactions data - wrapped in useCallback to fix useEffect dependency
  const fetchTransactions = useCallback(async () => {
    const customerId = getCustomerIdFromToken();
    if (!customerId) {
      setError('امکان بارگذاری اطلاعات مشتری وجود ندارد. لطفاً دوباره وارد شوید.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/transactions/byCustomer', {
        headers: {
          'customerId': customerId,
        },
      });
      const result = await response.json();

      if (result.success) {
        const transactionData = result.data || [];
        setTransactions(transactionData);
        
        // Calculate statistics
        const totalDebtor = transactionData.reduce((sum: number, t: Transaction) => sum + (t.debtor || 0), 0);
        const totalFastener = transactionData.reduce((sum: number, t: Transaction) => sum + (t.fastener || 0), 0);
        const totalTransactions = transactionData.length;
        const avgDebtorAmount = totalTransactions > 0 ? totalDebtor / totalTransactions : 0;
        const avgFastenerAmount = totalTransactions > 0 ? totalFastener / totalTransactions : 0;
        const netAmount = totalFastener - totalDebtor;
        const recentTransactions = transactionData.slice(0, 5);

        setStats({
          totalDebtor,
          totalFastener,
          totalTransactions,
          avgDebtorAmount,
          avgFastenerAmount,
          netAmount,
          recentTransactions,
        });
        
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since getCustomerIdFromToken doesn't depend on state

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Process transactions data for different chart types
  const processTransactionsByUser = (): UserGroup[] => {
    const userGroups = transactions.reduce((acc, transaction) => {
      const userName = transaction.users?.name || 'نامشخص';
      
      if (!acc[userName]) {
        acc[userName] = { 
          name: userName, 
          count: 0, 
          value: 0,
          debtor: 0,
          fastener: 0
        };
      }
      acc[userName].count += 1;
      acc[userName].debtor += transaction.debtor || 0;
      acc[userName].fastener += transaction.fastener || 0;
      acc[userName].value = acc[userName].fastener - acc[userName].debtor;
      return acc;
    }, {} as Record<string, UserGroup>);

    return Object.values(userGroups);
  };

  const processTransactionsByDate = (): DateGroup[] => {
    const dateGroups = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const dateKey = date.toLocaleDateString('fa-IR', { 
        year: 'numeric', 
        month: 'short'
      });

      if (!acc[dateKey]) {
        acc[dateKey] = { 
          name: dateKey, 
          count: 0, 
          value: 0,
          debtor: 0,
          fastener: 0
        };
      }
      acc[dateKey].count += 1;
      acc[dateKey].debtor += transaction.debtor || 0;
      acc[dateKey].fastener += transaction.fastener || 0;
      acc[dateKey].value = acc[dateKey].fastener - acc[dateKey].debtor;
      return acc;
    }, {} as Record<string, DateGroup>);

    return Object.values(dateGroups);
  };

  const processDebtorVsFastener = (): DebtorFastenerData[] => {
    return [
      {
        name: 'بدهکار',
        value: stats.totalDebtor,
        count: transactions.length
      },
      {
        name: 'بستانکار',
        value: stats.totalFastener,
        count: transactions.length
      }
    ];
  };

  const processTransactionsBySubject = (): SubjectGroup[] => {
    const subjectGroups = transactions.reduce((acc, transaction) => {
      const subject = transaction.subject || 'نامشخص';
      
      if (!acc[subject]) {
        acc[subject] = { 
          name: subject, 
          count: 0, 
          value: 0,
          debtor: 0,
          fastener: 0
        };
      }
      acc[subject].count += 1;
      acc[subject].debtor += transaction.debtor || 0;
      acc[subject].fastener += transaction.fastener || 0;
      acc[subject].value = acc[subject].fastener - acc[subject].debtor;
      return acc;
    }, {} as Record<string, SubjectGroup>);

    return Object.values(subjectGroups);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">خطا در بارگذاری تراکنش‌ها</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
          <button 
            onClick={fetchTransactions}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">تحلیل تراکنش‌های مالی من</h1>
          <p className="text-gray-600 mt-1">نمای کلی از تراکنش‌های مالی مربوط به حساب شما</p>
        </div>
        <button
          onClick={fetchTransactions}
          className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>بروزرسانی</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">کل تراکنش‌ها</p>
              <p className="text-2xl font-bold">{stats.totalTransactions.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">کل بدهکار</p>
              <p className="text-2xl font-bold">{stats.totalDebtor.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-red-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">کل بستانکار</p>
              <p className="text-2xl font-bold">{stats.totalFastener.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-r ${stats.netAmount >= 0 ? 'from-emerald-500 to-emerald-600' : 'from-orange-500 to-orange-600'} rounded-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-opacity-80 text-sm">خالص مبلغ</p>
              <p className="text-2xl font-bold">{stats.netAmount.toLocaleString('fa-IR')}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid using DynamicBar component */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Debtor vs Fastener Chart */}
        <DynamicBar
          dataType="customers"
          data={processDebtorVsFastener()}
          chartType="pie"
          title="مقایسه بدهکار و بستانکار"
          height={350}
          customConfig={{
            dataKey: 'name',
            valueKey: 'value',
            colors: ['#EF4444', '#10B981'],
          }}
        />

        {/* Transactions by User Chart */}
        <DynamicBar
          dataType="users"
          data={processTransactionsByUser()}
          chartType="bar"
          title="تراکنش‌ها بر اساس کاربر"
          height={350}
          customConfig={{
            dataKey: 'name',
            valueKey: 'value',
            colors: ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'],
          }}
        />

        {/* Transactions by Subject Chart */}
        <DynamicBar
          dataType="customers"
          data={processTransactionsBySubject()}
          chartType="pie"
          title="تراکنش‌ها بر اساس موضوع"
          height={350}
          customConfig={{
            dataKey: 'name',
            valueKey: 'count',
            colors: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'],
          }}
        />

        {/* Monthly Transactions Trend */}
        <DynamicBar
          dataType="customers"
          data={processTransactionsByDate()}
          chartType="line"
          title="روند ماهانه تراکنش‌ها"
          height={350}
          customConfig={{
            dataKey: 'name',
            valueKey: 'value',
            colors: ['#3B82F6'],
          }}
        />
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">آخرین تراکنش‌های من</h3>
          <span className="text-sm text-gray-500">
            {stats.recentTransactions.length} از {stats.totalTransactions} تراکنش
          </span>
        </div>

        {stats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">تاریخ</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">موضوع</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">کاربر</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">بدهکار</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">بستانکار</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">خالص</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentTransactions.map((transaction, index) => {
                  const netAmount = transaction.fastener - transaction.debtor;
                  return (
                    <tr key={transaction._id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-900 truncate max-w-xs" title={transaction.subject}>
                          {transaction.subject}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.users?.name || 'نامشخص'}</p>
                          <p className="text-sm text-gray-500">{transaction.users?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-red-600">
                          {transaction.debtor.toLocaleString('fa-IR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">
                          {transaction.fastener.toLocaleString('fa-IR')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {netAmount.toLocaleString('fa-IR')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>هیچ تراکنشی موجود نیست</p>
          </div>
        )}
      </div>

      {/* Transaction Summary by User */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">خلاصه تراکنش‌های من بر اساس کاربر</h3>
        
        {transactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(
              transactions.reduce((acc, transaction) => {
                const userName = transaction.users?.name || 'نامشخص';
                const userEmail = transaction.users?.email || '';
                
                if (!acc[userName]) {
                  acc[userName] = {
                    name: userName,
                    email: userEmail,
                    totalDebtor: 0,
                    totalFastener: 0,
                    transactionCount: 0,
                    netAmount: 0,
                  };
                }
                
                acc[userName].totalDebtor += transaction.debtor || 0;
                acc[userName].totalFastener += transaction.fastener || 0;
                acc[userName].transactionCount += 1;
                acc[userName].netAmount = acc[userName].totalFastener - acc[userName].totalDebtor;
                
                return acc;
              }, {} as Record<string, UserSummary>)
            )
            .sort(([,a], [,b]) => Math.abs(b.netAmount) - Math.abs(a.netAmount))
            .slice(0, 6)
            .map(([userName, data]) => (
              <div key={userName} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 truncate">{data.name}</h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {data.transactionCount} تراکنش
                  </span>
                </div>
                {data.email && (
                  <p className="text-sm text-gray-600 mb-3 truncate">{data.email}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">بدهکار:</span>
                    <span className="text-sm font-semibold text-red-600">
                      {data.totalDebtor.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">بستانکار:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {data.totalFastener.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">خالص:</span>
                    <span className={`text-lg font-bold ${data.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.netAmount.toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>داده‌ای برای نمایش موجود نیست</p>
          </div>
        )}
      </div>

      {/* Transaction Summary by Subject */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">خلاصه تراکنش‌ها بر اساس موضوع</h3>
        
        {transactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(
              transactions.reduce((acc, transaction) => {
                const subject = transaction.subject || 'نامشخص';
                
                if (!acc[subject]) {
                  acc[subject] = {
                    subject: subject,
                    totalDebtor: 0,
                    totalFastener: 0,
                    transactionCount: 0,
                    netAmount: 0,
                  };
                }
                
                acc[subject].totalDebtor += transaction.debtor || 0;
                acc[subject].totalFastener += transaction.fastener || 0;
                acc[subject].transactionCount += 1;
                acc[subject].netAmount = acc[subject].totalFastener - acc[subject].totalDebtor;
                
                return acc;
              }, {} as Record<string, SubjectSummary>)
            )
            .sort(([,a], [,b]) => b.transactionCount - a.transactionCount)
            .map(([subject, data]) => (
              <div key={subject} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 truncate" title={data.subject}>{data.subject}</h4>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {data.transactionCount}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">بدهکار:</span>
                    <span className="text-xs font-semibold text-red-600">
                      {data.totalDebtor.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">بستانکار:</span>
                    <span className="text-xs font-semibold text-green-600">
                      {data.totalFastener.toLocaleString('fa-IR')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="text-xs font-medium text-gray-700">خالص:</span>
                    <span className={`text-sm font-bold ${data.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.netAmount.toLocaleString('fa-IR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>داده‌ای برای نمایش موجود نیست</p>
          </div>
        )}
      </div>

      {/* Monthly Summary Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">خلاصه ماهانه تراکنش‌های من</h3>
        
        <DynamicBar
          dataType="customers"
          data={processTransactionsByDate()}
          chartType="area"
          title=""
          height={400}
          customConfig={{
            dataKey: 'name',
            valueKey: 'value',
            colors: ['#3B82F6'],
          }}
        />
      </div>

      {/* Today's Transactions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">تراکنش‌های امروز</h3>
        
        {(() => {
          const todayTransactions = transactions.filter(t => {
            const today = new Date();
            const transactionDate = new Date(t.date);
            return transactionDate.toDateString() === today.toDateString();
          });

          return todayTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">موضوع</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">کاربر</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">بدهکار</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">بستانکار</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">خالص</th>
                  </tr>
                </thead>
                <tbody>
                  {todayTransactions.map((transaction, index) => {
                    const netAmount = transaction.fastener - transaction.debtor;
                    return (
                      <tr key={transaction._id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 truncate max-w-xs" title={transaction.subject}>
                            {transaction.subject}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{transaction.users?.name || 'نامشخص'}</p>
                            <p className="text-sm text-gray-500">{transaction.users?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-red-600">
                            {transaction.debtor.toLocaleString('fa-IR')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-green-600">
                            {transaction.fastener.toLocaleString('fa-IR')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {netAmount.toLocaleString('fa-IR')}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>امروز هیچ تراکنشی ثبت نشده است</p>
            </div>
          );
        })()}
      </div>

      {/* Financial Summary Footer */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-6 text-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <p className="text-2xl font-bold">{stats.totalTransactions}</p>
            <p className="text-gray-300 text-sm">کل تراکنش‌های من</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-red-300">{stats.totalDebtor.toLocaleString('fa-IR')}</p>
            <p className="text-gray-300 text-sm">کل بدهکار</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-green-300">{stats.totalFastener.toLocaleString('fa-IR')}</p>
            <p className="text-gray-300 text-sm">کل بستانکار</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-10 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <p className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {stats.netAmount.toLocaleString('fa-IR')}
            </p>
            <p className="text-gray-300 text-sm">خالص مبلغ</p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-2">میانگین بدهکار</p>
              <p className="text-xl font-bold text-red-300">
                {stats.avgDebtorAmount.toLocaleString('fa-IR')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-2">میانگین بستانکار</p>
              <p className="text-xl font-bold text-green-300">
                {stats.avgFastenerAmount.toLocaleString('fa-IR')}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-300 text-sm">
            آخرین بروزرسانی: {new Date().toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">عملیات سریع</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={fetchTransactions}
            className="flex items-center justify-center space-x-2 space-x-reverse p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-blue-700 font-medium">بروزرسانی داده‌ها</span>
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center space-x-2 space-x-reverse p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span className="text-green-700 font-medium">چاپ گزارش</span>
          </button>
          
          <button
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                "تاریخ,موضوع,کاربر,بدهکار,بستانکار,خالص\n" +
                transactions.map(t => 
                  `${new Date(t.date).toLocaleDateString('fa-IR')},${t.subject},${t.users?.name || 'نامشخص'},${t.debtor},${t.fastener},${t.fastener - t.debtor}`
                ).join("\n");
              
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `customer_transactions_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center justify-center space-x-2 space-x-reverse p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors"
          >
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-purple-700 font-medium">دانلود CSV</span>
          </button>
        </div>
      </div>

      {/* Customer Account Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">خلاصه حساب من</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-800 mb-4">وضعیت مالی کلی</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">تعداد کل تراکنش‌ها:</span>
                <span className="font-bold text-blue-900">{stats.totalTransactions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">وضعیت حساب:</span>
                <span className={`font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.netAmount >= 0 ? 'بستانکار' : 'بدهکار'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">مبلغ خالص:</span>
                <span className={`font-bold text-lg ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stats.netAmount).toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-purple-800 mb-4">آمار تراکنش‌ها</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-700">تراکنش‌های امروز:</span>
                <span className="font-bold text-purple-900">
                  {transactions.filter(t => {
                    const today = new Date();
                    const transactionDate = new Date(t.date);
                    return transactionDate.toDateString() === today.toDateString();
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700">تراکنش‌های این ماه:</span>
                <span className="font-bold text-purple-900">
                  {transactions.filter(t => {
                    const now = new Date();
                    const transactionDate = new Date(t.date);
                    return transactionDate.getMonth() === now.getMonth() && 
                           transactionDate.getFullYear() === now.getFullYear();
                  }).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700">میانگین ماهانه:</span>
                <span className="font-bold text-purple-900">
                  {Math.round(stats.totalTransactions / 12)} تراکنش
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Indicator */}
      {stats.netAmount < 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>توجه:</strong> حساب شما دارای بدهی به مبلغ {Math.abs(stats.netAmount).toLocaleString('fa-IR')} تومان می‌باشد.
                لطفاً برای تسویه حساب با واحد مالی تماس بگیرید.
              </p>
            </div>
          </div>
        </div>
      )}

      {stats.netAmount > 0 && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                <strong>عالی!</strong> حساب شما دارای اعتبار به مبلغ {stats.netAmount.toLocaleString('fa-IR')} تومان می‌باشد.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransBar;



