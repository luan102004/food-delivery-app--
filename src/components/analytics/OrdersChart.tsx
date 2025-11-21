'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OrdersChartProps {
  data: Array<{ date: string; orders: number }>;
}

export default function OrdersChart({ data }: OrdersChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: 12 }} />
        <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}
          formatter={(value: number) => [value, 'Orders']}
        />
        <Bar dataKey="orders" fill="#22c55e" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}