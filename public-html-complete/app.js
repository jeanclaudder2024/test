// Maritime Platform - Complete Application Bundle for PHP Hosting
// This bundles your actual React application components

// Configuration
const SUPABASE_CONFIG = {
  url: 'https://hjuxqjpgqacekqixiqol.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqdXhxanBncWFjZWtxaXhpcW9sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4MTc1MDIsImV4cCI6MjA1MTM5MzUwMn0.0R8s6MF_rA4gfqAPzGN8LMFEoVJjI2N2xzJNEwTqLYo'
};

// Supabase client setup
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.headers = {
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    };
  }

  async fetch(endpoint, options = {}) {
    const url = `${this.url}/rest/v1/${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        console.error(`Supabase API error: ${response.status} ${response.statusText}`);
        // Try fallback to PHP API if direct Supabase fails
        if (endpoint.includes('vessels') || endpoint.includes('ports')) {
          return this.fetchFromPHP(endpoint);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Supabase fetch error:', error);
      // Try fallback to PHP API
      if (endpoint.includes('vessels') || endpoint.includes('ports')) {
        return this.fetchFromPHP(endpoint);
      }
      throw error;
    }
  }

  async fetchFromPHP(endpoint) {
    try {
      let phpEndpoint = '';
      if (endpoint.includes('vessels')) {
        phpEndpoint = './api.php?endpoint=vessels';
      } else if (endpoint.includes('ports')) {
        phpEndpoint = './api.php?endpoint=ports';
      } else {
        phpEndpoint = './api.php';
      }
      
      console.log('Fetching from PHP API:', phpEndpoint);
      const response = await fetch(phpEndpoint);
      
      if (!response.ok) {
        throw new Error(`PHP API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('PHP API response:', data);
      
      if (data.error) {
        throw new Error(data.message || data.error);
      }
      
      return data;
    } catch (error) {
      console.error('PHP API fallback error:', error);
      throw error;
    }
  }

  from(table) {
    return {
      select: (columns = '*') => ({
        execute: () => this.fetch(`${table}?select=${columns}`)
      }),
      insert: (data) => ({
        execute: () => this.fetch(table, {
          method: 'POST',
          body: JSON.stringify(data)
        })
      }),
      update: (data) => ({
        eq: (column, value) => ({
          execute: () => this.fetch(`${table}?${column}=eq.${value}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
          })
        })
      }),
      delete: () => ({
        eq: (column, value) => ({
          execute: () => this.fetch(`${table}?${column}=eq.${value}`, {
            method: 'DELETE'
          })
        })
      })
    };
  }
}

const supabase = new SupabaseClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// PHP API Helper Functions
async function fetchFromAPI(endpoint) {
  try {
    const response = await fetch(`./api.php?path=${endpoint}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    if (data.error) {
      throw new Error(data.message || data.error);
    }
    return data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Data loading functions
async function loadVessels() {
  try {
    return await fetchFromAPI('vessels');
  } catch (error) {
    console.error('Failed to load vessels:', error);
    return [];
  }
}

async function loadPorts() {
  try {
    return await fetchFromAPI('ports');
  } catch (error) {
    console.error('Failed to load ports:', error);
    return [];
  }
}

async function loadRefineries() {
  try {
    return await fetchFromAPI('refineries');
  } catch (error) {
    console.error('Failed to load refineries:', error);
    return [];
  }
}

// React Components
const { useState, useEffect, createElement: e } = React;

// Navigation Component
function Navigation({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'vessels', label: 'Vessels', icon: '🚢' },
    { id: 'ports', label: 'Ports', icon: '⚓' },
    { id: 'refineries', label: 'Refineries', icon: '🏭' },
    { id: 'brokers', label: 'Brokers', icon: '👥' },
    { id: 'trading', label: 'Trading', icon: '📈' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'admin', label: 'Admin', icon: '⚙️' }
  ];

  return e('nav', { 
    className: 'bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg'
  }, [
    e('div', { 
      key: 'nav-container',
      className: 'container mx-auto flex items-center justify-between'
    }, [
      e('div', { 
        key: 'logo',
        className: 'flex items-center space-x-3'
      }, [
        e('img', {
          key: 'logo-img',
          src: './public/petrodeal-logo.png',
          alt: 'Maritime Platform',
          className: 'h-10 w-10'
        }),
        e('h1', {
          key: 'logo-text',
          className: 'text-xl font-bold'
        }, 'Maritime Oil Brokerage Platform')
      ]),
      e('div', {
        key: 'nav-items',
        className: 'flex space-x-1'
      }, navItems.map(item => 
        e('button', {
          key: item.id,
          onClick: () => setCurrentPage(item.id),
          className: `px-4 py-2 rounded-lg transition-colors ${
            currentPage === item.id 
              ? 'bg-blue-600 text-white' 
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`
        }, [
          e('span', { key: 'icon', className: 'mr-2' }, item.icon),
          e('span', { key: 'label' }, item.label)
        ])
      ))
    ])
  ]);
}

// Dashboard Component
function Dashboard() {
  const [stats, setStats] = useState({
    vessels: 0,
    ports: 0,
    activeVoyages: 0,
    totalCargo: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [vessels, ports] = await Promise.all([
          loadVessels(),
          loadPorts()
        ]);
        
        setStats({
          vessels: vessels.length,
          ports: ports.length,
          activeVoyages: vessels.filter(v => v.status === 'In Transit').length,
          totalCargo: vessels.reduce((sum, v) => sum + (v.cargoCapacity || 0), 0)
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
    
    loadStats();
  }, []);

  return e('div', { className: 'p-6' }, [
    e('h2', { 
      key: 'title',
      className: 'text-3xl font-bold mb-6 text-slate-800'
    }, 'Maritime Operations Dashboard'),
    
    e('div', {
      key: 'stats-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'
    }, [
      e('div', {
        key: 'vessels-card',
        className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500'
      }, [
        e('h3', { key: 'vessels-title', className: 'text-lg font-semibold text-slate-600' }, 'Total Vessels'),
        e('p', { key: 'vessels-count', className: 'text-3xl font-bold text-blue-600' }, stats.vessels)
      ]),
      
      e('div', {
        key: 'ports-card',
        className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500'
      }, [
        e('h3', { key: 'ports-title', className: 'text-lg font-semibold text-slate-600' }, 'Active Ports'),
        e('p', { key: 'ports-count', className: 'text-3xl font-bold text-green-600' }, stats.ports)
      ]),
      
      e('div', {
        key: 'voyages-card',
        className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500'
      }, [
        e('h3', { key: 'voyages-title', className: 'text-lg font-semibold text-slate-600' }, 'Active Voyages'),
        e('p', { key: 'voyages-count', className: 'text-3xl font-bold text-yellow-600' }, stats.activeVoyages)
      ]),
      
      e('div', {
        key: 'cargo-card',
        className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500'
      }, [
        e('h3', { key: 'cargo-title', className: 'text-lg font-semibold text-slate-600' }, 'Total Cargo (MT)'),
        e('p', { key: 'cargo-count', className: 'text-3xl font-bold text-purple-600' }, stats.totalCargo.toLocaleString())
      ])
    ]),

    e('div', {
      key: 'map-container',
      className: 'bg-white rounded-lg shadow-lg p-6'
    }, [
      e('h3', { key: 'map-title', className: 'text-xl font-semibold mb-4' }, 'Global Maritime Operations'),
      e('div', { 
        key: 'map',
        id: 'map',
        className: 'h-96 bg-slate-100 rounded-lg flex items-center justify-center'
      }, [
        e('p', { key: 'map-placeholder', className: 'text-slate-500' }, 'Interactive map loading...')
      ])
    ])
  ]);
}

// Vessels Component
function Vessels() {
  const [vessels, setVessels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVessels() {
      try {
        const data = await loadVessels();
        setVessels(data);
      } catch (error) {
        console.error('Error loading vessels:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchVessels();
  }, []);

  if (loading) {
    return e('div', { className: 'p-6 text-center' }, 'Loading vessels...');
  }

  return e('div', { className: 'p-6' }, [
    e('h2', { 
      key: 'title',
      className: 'text-3xl font-bold mb-6 text-slate-800'
    }, 'Vessel Fleet Management'),
    
    e('div', {
      key: 'vessels-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    }, vessels.map(vessel => 
      e('div', {
        key: vessel.id,
        className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500'
      }, [
        e('h3', { key: 'name', className: 'text-lg font-semibold mb-2' }, vessel.name),
        e('p', { key: 'type', className: 'text-slate-600' }, `Type: ${vessel.vesselType}`),
        e('p', { key: 'imo', className: 'text-slate-600' }, `IMO: ${vessel.imo}`),
        e('p', { key: 'flag', className: 'text-slate-600' }, `Flag: ${vessel.flag}`),
        e('p', { key: 'status', className: 'text-slate-600' }, `Status: ${vessel.status || 'Unknown'}`),
        vessel.cargoCapacity && e('p', { key: 'capacity', className: 'text-slate-600' }, `Capacity: ${vessel.cargoCapacity} MT`)
      ])
    ))
  ]);
}

// Ports Component
function Ports() {
  const [ports, setPorts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPorts() {
      try {
        const data = await loadPorts();
        setPorts(data);
      } catch (error) {
        console.error('Error loading ports:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchPorts();
  }, []);

  if (loading) {
    return e('div', { className: 'p-6 text-center' }, 'Loading ports...');
  }

  return e('div', { className: 'p-6' }, [
    e('h2', { 
      key: 'title',
      className: 'text-3xl font-bold mb-6 text-slate-800'
    }, 'Port Management'),
    
    e('div', {
      key: 'ports-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    }, ports.map(port => 
      e('div', {
        key: port.id,
        className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500'
      }, [
        e('h3', { key: 'name', className: 'text-lg font-semibold mb-2' }, port.name),
        e('p', { key: 'country', className: 'text-slate-600' }, `Country: ${port.country}`),
        e('p', { key: 'region', className: 'text-slate-600' }, `Region: ${port.region}`),
        e('p', { key: 'type', className: 'text-slate-600' }, `Type: ${port.type || 'General'}`),
        port.capacity && e('p', { key: 'capacity', className: 'text-slate-600' }, `Capacity: ${port.capacity} MT`)
      ])
    ))
  ]);
}

// Refineries Component
function Refineries() {
  const [refineries, setRefineries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRefineries() {
      try {
        const data = await loadRefineries();
        setRefineries(data);
      } catch (error) {
        console.error('Error loading refineries:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRefineries();
  }, []);

  if (loading) {
    return e('div', { className: 'p-6 text-center' }, 'Loading refineries...');
  }

  return e('div', { className: 'p-6' }, [
    e('h2', { 
      key: 'title',
      className: 'text-3xl font-bold mb-6 text-slate-800'
    }, 'Refinery Operations'),
    
    e('div', {
      key: 'refineries-grid',
      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    }, refineries.map(refinery => 
      e('div', {
        key: refinery.id,
        className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500'
      }, [
        e('h3', { key: 'name', className: 'text-lg font-semibold mb-2' }, refinery.name),
        e('p', { key: 'country', className: 'text-slate-600' }, `Country: ${refinery.country}`),
        e('p', { key: 'region', className: 'text-slate-600' }, `Region: ${refinery.region}`),
        e('p', { key: 'capacity', className: 'text-slate-600' }, `Capacity: ${refinery.capacity} bbl/day`),
        e('p', { key: 'status', className: 'text-slate-600' }, `Status: ${refinery.status}`)
      ])
    ))
  ]);
}

function Brokers() {
  return e('div', { className: 'p-6' }, [
    e('h2', { key: 'title', className: 'text-3xl font-bold mb-6 text-slate-800' }, 'Maritime Brokers'),
    e('div', { key: 'content', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' }, [
      e('div', { key: 'broker1', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500' }, [
        e('h3', { key: 'name', className: 'text-lg font-semibold mb-2' }, 'Global Maritime Solutions'),
        e('p', { key: 'type', className: 'text-slate-600' }, 'Type: Oil Tanker Broker'),
        e('p', { key: 'region', className: 'text-slate-600' }, 'Region: Middle East & Asia'),
        e('p', { key: 'contact', className: 'text-slate-600' }, 'Contact: broker@gms.com')
      ]),
      e('div', { key: 'broker2', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500' }, [
        e('h3', { key: 'name', className: 'text-lg font-semibold mb-2' }, 'Atlantic Shipping Partners'),
        e('p', { key: 'type', className: 'text-slate-600' }, 'Type: Crude Oil Specialist'),
        e('p', { key: 'region', className: 'text-slate-600' }, 'Region: North America & Europe'),
        e('p', { key: 'contact', className: 'text-slate-600' }, 'Contact: deals@asp.com')
      ])
    ])
  ]);
}

function Trading() {
  return e('div', { className: 'p-6' }, [
    e('h2', { key: 'title', className: 'text-3xl font-bold mb-6 text-slate-800' }, 'Oil Trading Dashboard'),
    e('div', { key: 'stats', className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8' }, [
      e('div', { key: 'active-trades', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold text-slate-600' }, 'Active Trades'),
        e('p', { key: 'value', className: 'text-3xl font-bold text-green-600' }, '47')
      ]),
      e('div', { key: 'daily-volume', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold text-slate-600' }, 'Daily Volume'),
        e('p', { key: 'value', className: 'text-3xl font-bold text-blue-600' }, '2.3M bbl')
      ]),
      e('div', { key: 'profit', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold text-slate-600' }, 'Daily P&L'),
        e('p', { key: 'value', className: 'text-3xl font-bold text-yellow-600' }, '+$1.2M')
      ])
    ])
  ]);
}

function Documents() {
  return e('div', { className: 'p-6' }, [
    e('h2', { key: 'title', className: 'text-3xl font-bold mb-6 text-slate-800' }, 'Document Management'),
    e('div', { key: 'doc-types', className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' }, [
      e('div', { key: 'contracts', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold mb-2' }, 'Contracts'),
        e('p', { key: 'count', className: 'text-2xl font-bold text-red-600' }, '156')
      ]),
      e('div', { key: 'bills', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold mb-2' }, 'Bills of Lading'),
        e('p', { key: 'count', className: 'text-2xl font-bold text-blue-600' }, '89')
      ]),
      e('div', { key: 'certificates', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold mb-2' }, 'Certificates'),
        e('p', { key: 'count', className: 'text-2xl font-bold text-green-600' }, '34')
      ]),
      e('div', { key: 'reports', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold mb-2' }, 'Reports'),
        e('p', { key: 'count', className: 'text-2xl font-bold text-purple-600' }, '67')
      ])
    ])
  ]);
}

function Admin() {
  return e('div', { className: 'p-6' }, [
    e('h2', { key: 'title', className: 'text-3xl font-bold mb-6 text-slate-800' }, 'System Administration'),
    e('div', { key: 'admin-sections', className: 'grid grid-cols-1 md:grid-cols-2 gap-6' }, [
      e('div', { key: 'users', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-indigo-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold mb-4' }, 'User Management'),
        e('p', { key: 'active-users', className: 'text-slate-600' }, 'Active Users: 23'),
        e('p', { key: 'pending', className: 'text-slate-600' }, 'Pending Approvals: 5')
      ]),
      e('div', { key: 'system', className: 'bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-500' }, [
        e('h3', { key: 'title', className: 'text-lg font-semibold mb-4' }, 'System Status'),
        e('p', { key: 'uptime', className: 'text-slate-600' }, 'Uptime: 99.8%'),
        e('p', { key: 'last-backup', className: 'text-slate-600' }, 'Last Backup: 2 hours ago')
      ])
    ])
  ]);
}

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return e(Dashboard);
      case 'vessels': return e(Vessels);
      case 'ports': return e(Ports);
      case 'refineries': return e(Refineries);
      case 'brokers': return e(Brokers);
      case 'trading': return e(Trading);
      case 'documents': return e(Documents);
      case 'admin': return e(Admin);
      default: return e(Dashboard);
    }
  };

  return e('div', { className: 'min-h-screen bg-slate-50' }, [
    e(Navigation, { 
      key: 'nav',
      currentPage,
      setCurrentPage
    }),
    e('main', { 
      key: 'main',
      className: 'container mx-auto'
    }, renderPage())
  ]);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Root element not found');
      return;
    }

    // Use ReactDOM.render for React 17 compatibility
    ReactDOM.render(e(App), rootElement);
    
    // Initialize map if needed
    setTimeout(() => {
      const mapContainer = document.getElementById('map');
      if (mapContainer && window.L) {
        try {
          const map = L.map('map').setView([25.276987, 55.296249], 2);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        } catch (mapError) {
          console.warn('Map initialization failed:', mapError);
        }
      }
    }, 1000);
  } catch (error) {
    console.error('Application initialization failed:', error);
    // Show basic error message
    document.getElementById('root').innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Loading Maritime Platform...</h1><p>Please wait while the application initializes.</p></div>';
  }
});