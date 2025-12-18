import React from 'react';

interface AlertBannerProps {
    message: string;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ message }) => {
    return (
        <div className="w-full bg-[#464775] text-white py-3 px-6 text-sm font-medium flex items-center justify-center shadow-md relative z-20">
            <span>{message}</span>
        </div>
    );
};

export default AlertBanner;
