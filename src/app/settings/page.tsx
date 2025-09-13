export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-700">
          Configure your dashboard preferences and organization settings
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Organization Name</label>
              <input type="text" className="input" defaultValue="Example Company" />
            </div>
            <div>
              <label className="label">Time Zone</label>
              <select className="input">
                <option>UTC</option>
                <option>America/New_York</option>
                <option>America/Los_Angeles</option>
                <option>Europe/London</option>
              </select>
            </div>
            <div>
              <label className="label">Default Currency</label>
              <select className="input">
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
                <option>JPY</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Dashboard Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="label">Auto Refresh</label>
                <p className="text-sm text-gray-500">Automatically refresh dashboard data</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-indigo-600" defaultChecked />
            </div>
            <div>
              <label className="label">Refresh Interval (minutes)</label>
              <input type="number" className="input" defaultValue="5" min="1" max="60" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="label">Show Grid</label>
                <p className="text-sm text-gray-500">Display grid lines on charts</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-indigo-600" defaultChecked />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="label">Email Notifications</label>
                <p className="text-sm text-gray-500">Receive notifications via email</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-indigo-600" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="label">Browser Notifications</label>
                <p className="text-sm text-gray-500">Show browser notifications</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="label">Alert Notifications</label>
                <p className="text-sm text-gray-500">Receive alerts for threshold breaches</p>
              </div>
              <input type="checkbox" className="h-4 w-4 text-indigo-600" defaultChecked />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
          <div className="space-y-4">
            <button className="btn btn-outline">Change Password</button>
            <button className="btn btn-outline">Two-Factor Authentication</button>
            <button className="btn btn-outline">API Keys</button>
            <div className="pt-4 border-t border-gray-200">
              <button className="btn btn-ghost text-red-600">Sign Out</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button className="btn btn-ghost">Cancel</button>
        <button className="btn btn-primary">Save Changes</button>
      </div>
    </div>
  );
}