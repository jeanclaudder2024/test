<?php
// Maritime Platform - PHP Version for Shared Hosting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Load configuration
$config = require_once 'config.php';

// Simple routing
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);

// Handle API routes
if (strpos($path, '/api/') === 0) {
    header('Content-Type: application/json');
    
    switch($path) {
        case '/api/vessels':
            handleVessels();
            break;
        case '/api/ports':
            handlePorts();
            break;
        case '/api/refineries':
            handleRefineries();
            break;
        default:
            if (preg_match('/\/api\/vessels\/(\d+)/', $path, $matches)) {
                handleVesselDetails($matches[1]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Not found']);
            }
            break;
    }
    exit;
}

// Serve the main application
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maritime Oil Brokerage Platform</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        .maritime-gradient {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #0369a1 50%, #0284c7 75%, #0891b2 100%);
        }
        .vessel-card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
    </style>
</head>
<body class="maritime-gradient min-h-screen">
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        // Main App Component
        function App() {
            const [vessels, setVessels] = useState([]);
            const [ports, setPorts] = useState([]);
            const [loading, setLoading] = useState(true);
            const [currentView, setCurrentView] = useState('dashboard');

            useEffect(() => {
                fetchData();
            }, []);

            const fetchData = async () => {
                try {
                    const [vesselsRes, portsRes] = await Promise.all([
                        fetch('/api/vessels'),
                        fetch('/api/ports')
                    ]);
                    
                    const vesselsData = await vesselsRes.json();
                    const portsData = await portsRes.json();
                    
                    setVessels(vesselsData);
                    setPorts(portsData);
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            };

            if (loading) {
                return (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-white text-xl">Loading Maritime Platform...</div>
                    </div>
                );
            }

            return (
                <div className="min-h-screen">
                    <Header currentView={currentView} setCurrentView={setCurrentView} />
                    <main className="container mx-auto px-4 py-8">
                        {currentView === 'dashboard' && <Dashboard vessels={vessels} ports={ports} />}
                        {currentView === 'vessels' && <VesselList vessels={vessels} />}
                        {currentView === 'ports' && <PortList ports={ports} />}
                        {currentView === 'map' && <MapView vessels={vessels} ports={ports} />}
                    </main>
                </div>
            );
        }

        // Header Component
        function Header({ currentView, setCurrentView }) {
            const navItems = [
                { id: 'dashboard', label: 'Dashboard' },
                { id: 'vessels', label: 'Vessels' },
                { id: 'ports', label: 'Ports' },
                { id: 'map', label: 'Map' }
            ];

            return (
                <header className="bg-black bg-opacity-20 backdrop-blur-md border-b border-white border-opacity-20">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between h-16">
                            <h1 className="text-white text-xl font-bold">Maritime Platform</h1>
                            <nav className="flex space-x-6">
                                {navItems.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => setCurrentView(item.id)}
                                        className={`text-sm font-medium transition-colors ${
                                            currentView === item.id 
                                                ? 'text-cyan-400' 
                                                : 'text-white hover:text-cyan-300'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </header>
            );
        }

        // Dashboard Component
        function Dashboard({ vessels, ports }) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="vessel-card rounded-lg p-6">
                        <h3 className="text-white text-lg font-semibold mb-2">Total Vessels</h3>
                        <p className="text-cyan-400 text-3xl font-bold">{vessels.length}</p>
                    </div>
                    <div className="vessel-card rounded-lg p-6">
                        <h3 className="text-white text-lg font-semibold mb-2">Active Ports</h3>
                        <p className="text-cyan-400 text-3xl font-bold">{ports.length}</p>
                    </div>
                    <div className="vessel-card rounded-lg p-6">
                        <h3 className="text-white text-lg font-semibold mb-2">Operational</h3>
                        <p className="text-green-400 text-3xl font-bold">98%</p>
                    </div>
                </div>
            );
        }

        // Vessel List Component
        function VesselList({ vessels }) {
            return (
                <div className="vessel-card rounded-lg p-6">
                    <h2 className="text-white text-2xl font-bold mb-6">Vessel Fleet</h2>
                    <div className="grid gap-4">
                        {vessels.map(vessel => (
                            <div key={vessel.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-white font-semibold">{vessel.name}</h3>
                                        <p className="text-gray-300 text-sm">IMO: {vessel.imo}</p>
                                        <p className="text-gray-300 text-sm">Type: {vessel.vesselType}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-cyan-400">{vessel.flag}</p>
                                        <p className="text-gray-300 text-sm">{vessel.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Port List Component
        function PortList({ ports }) {
            return (
                <div className="vessel-card rounded-lg p-6">
                    <h2 className="text-white text-2xl font-bold mb-6">Port Network</h2>
                    <div className="grid gap-4">
                        {ports.map(port => (
                            <div key={port.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-white font-semibold">{port.name}</h3>
                                        <p className="text-gray-300 text-sm">{port.country}</p>
                                        <p className="text-gray-300 text-sm">Region: {port.region}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-cyan-400">{port.type}</p>
                                        <p className="text-gray-300 text-sm">{port.status}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        // Map View Component
        function MapView({ vessels, ports }) {
            useEffect(() => {
                // Initialize Leaflet map
                const map = L.map('map').setView([25.0, 55.0], 6);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // Add vessel markers
                vessels.forEach(vessel => {
                    if (vessel.currentLat && vessel.currentLng) {
                        L.marker([parseFloat(vessel.currentLat), parseFloat(vessel.currentLng)])
                            .addTo(map)
                            .bindPopup(`<b>${vessel.name}</b><br>Type: ${vessel.vesselType}<br>Flag: ${vessel.flag}`);
                    }
                });

                // Add port markers
                ports.forEach(port => {
                    if (port.lat && port.lng) {
                        L.marker([parseFloat(port.lat), parseFloat(port.lng)], {
                            icon: L.icon({
                                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjRUY0NDQ0Ii8+Cjwvc3ZnPgo=',
                                iconSize: [24, 24]
                            })
                        })
                            .addTo(map)
                            .bindPopup(`<b>${port.name}</b><br>Country: ${port.country}<br>Type: ${port.type}`);
                    }
                });

                return () => map.remove();
            }, [vessels, ports]);

            return (
                <div className="vessel-card rounded-lg p-6">
                    <h2 className="text-white text-2xl font-bold mb-6">Maritime Map</h2>
                    <div id="map" style={{ height: '500px', borderRadius: '8px' }}></div>
                </div>
            );
        }

        // Render the app
        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>

<?php
// API Functions
function handleVessels() {
    global $config;
    
    // Fetch from Supabase
    $vessels = fetchFromSupabase('vessels', $config);
    echo json_encode($vessels ?: []);
}

function handlePorts() {
    global $config;
    
    // Fetch from Supabase
    $ports = fetchFromSupabase('ports', $config);
    echo json_encode($ports ?: []);
}

function handleRefineries() {
    global $config;
    
    // Fetch from Supabase
    $refineries = fetchFromSupabase('refineries', $config);
    echo json_encode($refineries ?: []);
}

function handleVesselDetails($id) {
    global $config;
    
    // Fetch specific vessel from Supabase
    $vessel = fetchFromSupabase("vessels?id=eq.$id", $config);
    echo json_encode($vessel ? $vessel[0] : null);
}

function fetchFromSupabase($table, $config) {
    $url = $config['supabase_url'] . '/rest/v1/' . $table;
    
    $headers = [
        'apikey: ' . $config['supabase_key'],
        'Authorization: Bearer ' . $config['supabase_key'],
        'Content-Type: application/json'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200) {
        return json_decode($response, true);
    }
    
    return null;
}
?>