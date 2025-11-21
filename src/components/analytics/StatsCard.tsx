import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: string;
}

export default function StatsCard({ title, value, change, icon: Icon, color = 'primary' }: StatsCardProps) {
  const colorClasses = {
    primary: 'from-primary-500 to-primary-700',
    blue: 'from-blue-500 to-blue-700',
    green: 'from-green-500 to-green-700',
    purple: 'from-purple-500 to-purple-700',
    yellow: 'from-yellow-500 to-yellow-700',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary} text-white rounded-xl p-6 shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-white text-opacity-90 text-sm mb-1">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1">
          <span className={`text-sm font-semibold ${change >= 0 ? 'text-white' : 'text-red-200'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          <span className="text-white text-opacity-75 text-sm">vs last period</span>
        </div>
      )}
    </div>
  );
}