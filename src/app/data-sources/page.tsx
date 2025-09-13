export default function DataSourcesPage() {
  const dataSources = [
    {
      id: 1,
      name: 'PostgreSQL Main',
      type: 'PostgreSQL',
      status: 'Connected',
      lastSync: '2 minutes ago',
    },
    {
      id: 2,
      name: 'Analytics API',
      type: 'REST API',
      status: 'Connected',
      lastSync: '5 minutes ago',
    },
    {
      id: 3,
      name: 'MongoDB Logs',
      type: 'MongoDB',
      status: 'Disconnected',
      lastSync: '2 hours ago',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Data Sources</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your database connections and data integrations
          </p>
        </div>
        <button className="btn btn-primary">Add Data Source</button>
      </div>
      
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Connected Sources</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {dataSources.map((source) => (
            <div key={source.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`h-3 w-3 rounded-full ${
                  source.status === 'Connected' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{source.name}</h4>
                  <p className="text-sm text-gray-500">{source.type}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  source.status === 'Connected' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {source.status}
                </span>
                <p className="text-xs text-gray-500 mt-1">Last sync: {source.lastSync}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}