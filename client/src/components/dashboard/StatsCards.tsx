import { Stats } from "@/types";
import { Truck, Package, Factory, Users } from "lucide-react";
import { useDataStream } from "@/hooks/useDataStream";

export default function StatsCards() {
  const { stats, loading } = useDataStream();

  // Format large numbers with commas
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined) return "N/A";
    return num.toLocaleString();
  };

  // Format cargo with M/K suffix
  const formatCargo = (num: number | undefined): string => {
    if (num === undefined) return "N/A";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M barrels`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K barrels`;
    return `${num} barrels`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-200"></div>
              <div className="ml-4 w-full">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-5 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Vessels",
      value: formatNumber(stats?.activeVessels),
      icon: <Truck className="h-6 w-6 text-primary" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Cargo",
      value: formatCargo(Number(stats?.totalCargo)),
      icon: <Package className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "Active Refineries",
      value: formatNumber(stats?.activeRefineries),
      icon: <Factory className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Brokers",
      value: formatNumber(stats?.activeBrokers),
      icon: <Users className="h-6 w-6 text-yellow-600" />,
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm p-4 flex items-center">
          <div className={`h-12 w-12 rounded-full ${card.bgColor} flex items-center justify-center flex-shrink-0`}>
            {card.icon}
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">{card.title}</p>
            <p className="text-xl font-medium text-gray-900">{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
