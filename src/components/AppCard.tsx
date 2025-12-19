import React from 'react';
import { Pencil, Trash2, Star } from 'lucide-react';

interface AppCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    statusColor?: 'green' | 'yellow' | 'blue' | 'gray'; // For the dot
    cardColor?: string;
    url?: string;
    isEditMode?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
    fixed?: boolean;
    onToggleFixed?: () => void;
}

const AppCard: React.FC<AppCardProps> = ({
    title,
    description,
    icon,
    statusColor = 'green',
    cardColor = 'bg-white',
    url,
    isEditMode = false,
    fixed = false,
    onEdit,
    onDelete,
    onToggleFixed
}) => {

    const statusMap = {
        green: 'bg-green-500',
        yellow: 'bg-yellow-400',
        blue: 'bg-blue-500',
        gray: 'bg-gray-300'
    };

    const handleCardClick = () => {
        if (!isEditMode && url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleToggleFixed = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFixed?.();
    };

    return (
        <div
            onClick={handleCardClick}
            className={`${cardColor} rounded-[24px] p-8 flex flex-col h-full min-h-[240px] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group border border-transparent hover:border-blue-100 overflow-hidden cursor-pointer`}
        >
            {/* Star / Fix Button - Visible on Hover or if Fixed */}
            {!isEditMode && (
                <button
                    onClick={handleToggleFixed}
                    className={`absolute bottom-4 right-4 z-20 p-2 rounded-full transition-all duration-200 ${fixed
                        ? 'bg-yellow-100 text-yellow-500 opacity-100'
                        : 'bg-white/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-yellow-500'
                        }`}
                    title={fixed ? "Desafixar" : "Fixar"}
                >
                    <Star size={18} fill={fixed ? "currentColor" : "none"} strokeWidth={fixed ? 0 : 2} />
                </button>
            )}

            {/* Edit Mode Overlays */}
            {isEditMode && (
                <div className="absolute top-4 right-4 flex gap-2 z-20 animate-in fade-in duration-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
                        className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-blue-600 hover:scale-110 transition-all"
                        title="Editar"
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
                        className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-red-600 hover:scale-110 transition-all"
                        title="Excluir"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}

            {/* Header: Icon + Status Dot */}
            <div className="flex justify-between items-start mb-6">
                {/* Icon Container */}
                <div className="w-10 h-10 flex items-center justify-center">
                    {icon}
                </div>
                {/* Status Dot */}
                <div className={`w-3 h-3 rounded-full ${statusMap[statusColor]}`} />
            </div>

            {/* Body */}
            <div className="mb-0 flex-1">
                <h3 className="text-xl font-medium text-gray-900 mb-3 tracking-tight">
                    {title}
                </h3>
                <p className="text-[15px] text-gray-500 leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default AppCard;

