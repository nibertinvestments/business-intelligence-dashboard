export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="mt-2 text-sm text-gray-700">
          Generate and manage your business reports
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sales Report</h3>
          <p className="text-sm text-gray-600 mb-4">Monthly sales performance analysis</p>
          <button className="btn btn-primary btn-sm">Generate</button>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">User engagement and activity report</p>
          <button className="btn btn-primary btn-sm">Generate</button>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Financial Summary</h3>
          <p className="text-sm text-gray-600 mb-4">Revenue and expense breakdown</p>
          <button className="btn btn-primary btn-sm">Generate</button>
        </div>
      </div>
    </div>
  );
}