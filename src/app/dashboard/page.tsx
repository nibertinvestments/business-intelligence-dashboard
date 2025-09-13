export default function DashboardPage() {
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
        <div className="card p-6">
          <div className="flex items-center">
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
          </div>
          <div className="mt-5">
            <div className="flex items-center text-sm text-green-600">
              <span>+2.1%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
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
          </div>
          <div className="mt-5">
            <div className="flex items-center text-sm text-green-600">
              <span>+4.5%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
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
          </div>
          <div className="mt-5">
            <div className="flex items-center text-sm text-red-600">
              <span>-0.3%</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
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
          </div>
          <div className="mt-5">
            <div className="flex items-center text-sm text-green-600">
              <span>-0.1s</span>
              <span className="ml-1 text-gray-500">from last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Revenue Trend
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be implemented here</p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            User Activity
          </h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chart will be implemented here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
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
      </div>
    </div>
  );
}