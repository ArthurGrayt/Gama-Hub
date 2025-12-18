import React from 'react';

const TopBar: React.FC = () => {
    return (
        <header className="px-8 py-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-white/50 shadow-sm">
                    <img
                        src="https://ui-avatars.com/api/?name=User+Name&background=0D8ABC&color=fff"
                        alt="User Avatar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div>
                    <h2 className="text-2xl font-light text-gray-800 tracking-tight">
                        Olá, <span className="font-medium">Arthur!</span>
                    </h2>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
