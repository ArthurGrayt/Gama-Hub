import React, { useState } from 'react';
import {
    LayoutGrid,
    Grid,
    Wallet,
    Settings,
    FileText,
    Zap,
    ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, active, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={twMerge(
                "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group",
                active
                    ? "bg-white/50 shadow-sm text-gray-900"
                    : "text-gray-500 hover:bg-white/30 hover:text-gray-700"
            )}
        >
            <Icon size={20} className={clsx("transition-colors", active ? "text-blue-500 fill-blue-500/10" : "text-gray-400 group-hover:text-gray-600")} />
            <span className="font-medium text-[15px]">{label}</span>
            {active && <ChevronRight size={16} className="ml-auto text-gray-400" />}
        </div>
    );
};

const Sidebar: React.FC = () => {
    const [activeItem, setActiveItem] = useState('Visão Geral');

    const menuItems = [
        { label: 'Visão Geral', icon: LayoutGrid }, // Using LayoutGrid as generic home/overview
        { label: 'Aplicativos', icon: Grid },
        { label: 'Financeiro', icon: Wallet },
        { label: 'Operacional', icon: Zap },
        { label: 'Documentos', icon: FileText },
        { label: 'Configurações', icon: Settings },
    ];

    return (
        <aside className="w-[280px] h-full flex flex-col p-6 pr-2 bg-transparent">
            <div className="mb-8 px-2">
                <h1 className="text-xl font-semibold text-gray-800 tracking-tight">Visão Geral Rápida</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <NavItem
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        active={activeItem === item.label}
                        onClick={() => setActiveItem(item.label)}
                    />
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
