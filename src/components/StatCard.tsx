import React, { ReactNode } from 'react';

interface StatCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: ReactNode;
  sub: string;
  valueColor?: string;
}

export default function StatCard({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  valueColor,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg, color: iconColor }}>
        <i className={`fa-solid ${icon}`}></i>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
