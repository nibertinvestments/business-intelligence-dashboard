import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, BarChart } from '@/components/ui/Chart';

export default function DashboardPage() {
  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 13000 },
    { month: 'Apr', revenue: 18000 },
    { month: 'May', revenue: 22000 },
    { month: 'Jun', revenue: 25000 },
  ];

  const userActivityData = [
    { day: 'Mon', users: 1200 },
    { day: 'Tue', users: 1500 },
    { day: 'Wed', users: 1300 },
    { day: 'Thu', users: 1800 },
    { day: 'Fri', users: 2200 },
    { day: 'Sat', users: 1900 },
    { day: 'Sun', users: 1600 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-700">
          Welcome to your Business Intelligence Dashboard
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-indigo-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">$</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Revenue
                </dt>
                <dd className="text-lg font-medium text-gray-900">$71,897</dd>
              </dl>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <div className="flex items-center text-sm text-green-600">
              <span>+2.1%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardContent className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-green-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">👥</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Users
                </dt>
                <dd className="text-lg font-medium text-gray-900">2,345</dd>
              </dl>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <div className="flex items-center text-sm text-green-600">
              <span>+4.5%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardContent className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-yellow-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">📊</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Conversion Rate
                </dt>
                <dd className="text-lg font-medium text-gray-900">3.65%</dd>
              </dl>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <div className="flex items-center text-sm text-red-600">
              <span>-0.3%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardContent className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-md bg-red-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">⚡</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Avg. Response Time
                </dt>
                <dd className="text-lg font-medium text-gray-900">1.2s</dd>
              </dl>
            </div>
          </CardContent>
          <div className="px-6 pb-6">
            <div className="flex items-center text-sm text-green-600">
              <span>-0.1s</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding={false}>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={revenueData} height={250} />
          </CardContent>
        </Card>

        <Card padding={false}>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={userActivityData} height={250} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card padding={false}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <div className="divide-y divide-gray-200">
          {[
            {
              id: 1,
              action: 'New user registration',
              user: 'john@example.com',
              time: '2 minutes ago',
            },
            {
              id: 2,
              action: 'Dashboard created',
              user: 'jane@example.com',
              time: '5 minutes ago',
            },
            {
              id: 3,
              action: 'Report generated',
              user: 'bob@example.com',
              time: '10 minutes ago',
            },
          ].map((activity) => (
            <div key={activity.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.user}</p>
                </div>
                <p className="text-sm text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}