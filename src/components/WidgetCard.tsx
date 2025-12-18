import React from 'react';

interface WidgetCardProps {
    icon: React.ElementType; // Or custom icon node
    title: string;
    subtitle?: string;
    extra?: string;
    bgColor?: string; // Optional custom bg logic
    image?: string; // For album art
}

const WidgetCard: React.FC<WidgetCardProps> = ({ title, subtitle, extra, icon: Icon, image }) => {
    return (
        <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-[20px] p-4 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden group">
            {/* Icon / Image container */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-white/80 to-white/40 shadow-inner">
                {image ? (
                    <img src={image} alt={title} className="w-full h-full object-cover rounded-xl" />
                ) : (
                    <Icon size={24} className="text-gray-700" />
                )}
            </div>

            <div>
                <h3 className="text-[15px] font-semibold text-gray-800 leading-tight">{title}</h3>
                {subtitle && <p className="text-[13px] text-gray-500 font-medium">{subtitle}</p>}
                {extra && <p className="text-[11px] text-gray-400 mt-0.5">{extra}</p>}
            </div>
        </div>
    );
};

export default WidgetCard;
