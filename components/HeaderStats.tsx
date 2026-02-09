
import React from 'react';
import { CakeIcon, HouseHeartIcon, PeopleIcon } from './Icons';

interface HeaderStatsProps {
    stats: {
        total: number;
        total3Anos: number;
        totalBonfim: number;
    };
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, title: string, isAlert?: boolean }> = ({ icon, label, value, title, isAlert }) => (
    <div
        className={`total-cadastros-info flex items-center text-white px-3 py-1.5 rounded-md shadow ${isAlert ? 'bg-red-500 border-red-600' : 'bg-blue-500 border-blue-600'}`}
        title={title}
    >
        {icon}
        <span className="ml-2 font-medium">{label}:</span>
        <span className="ml-1.5 font-bold">{value}</span>
    </div>
);

const HeaderStats: React.FC<HeaderStatsProps> = ({ stats }) => {
    return (
        <div className="flex justify-start items-center space-x-4 flex-wrap gap-y-2">
            <StatCard
                icon={<PeopleIcon />}
                label="Total"
                value={stats.total}
                title="Total de crianças cadastradas"
                isAlert={stats.total > 90}
            />
            <StatCard
                icon={<CakeIcon />}
                label="3 Anos"
                value={stats.total3Anos}
                title="Total de crianças com 3 anos"
            />
            <StatCard
                icon={<HouseHeartIcon />}
                label="Bonfim"
                value={stats.totalBonfim}
                title="Total de cadastros da comum Bonfim e similares"
            />
        </div>
    );
};

export default HeaderStats;
