export default function AdminDashboardPage() {
  // Swapped to Font Awesome class names
  const stats = [
    { label: "Total Revenue", value: "$45,231.89", change: "+20.1%", positive: true, iconClass: "fa-solid fa-dollar-sign" },
    { label: "Orders", value: "356", change: "+8.2%", positive: true, iconClass: "fa-solid fa-cart-shopping" },
    { label: "Active Customers", value: "2,342", change: "+14.5%", positive: true, iconClass: "fa-solid fa-users" },
    { label: "Low Stock Items", value: "12", change: "-2.4%", positive: false, iconClass: "fa-solid fa-box" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 mt-1">Here is what is happening in your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="flex flex-col bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              {/* Renders the Font Awesome Icon */}
              <i className={`${stat.iconClass} text-gray-400 text-xl`} aria-hidden="true"></i>
            </div>
            
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View all
            </button>
          </div>
          
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-100 rounded-lg bg-gray-50">
            <p className="text-gray-500 text-sm">Recent orders table will load here</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900">
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              Add New Product
            </button>
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <i className="fa-solid fa-tag" aria-hidden="true"></i>
              Create Discount Code
            </button>
          </div>
        </div>

      </div>
      
    </div>
  );
}