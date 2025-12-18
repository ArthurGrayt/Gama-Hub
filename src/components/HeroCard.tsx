import React from 'react';

const HeroCard: React.FC = () => {
    return (
        <div className="h-full w-full relative rounded-[32px] overflow-hidden group shadow-2xl shadow-[#00000020]">
            {/* Background Image with Zoom Effect */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976&auto=format&fit=crop"
                    alt="Hero"
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                />
                {/* Gradient Overlay - Smooth noise-free gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>

            {/* Content Bottom */}
            <div className="absolute bottom-0 left-0 p-10 w-full text-white z-10">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight drop-shadow-sm">
                    Aplicativos para <br />gerenciar seu dia
                </h2>
                <p className="text-white/90 text-[17px] mb-8 max-w-[90%] font-medium leading-relaxed drop-shadow-sm">
                    Obtenha os aplicativos e segurança e o armazenamento em nuvem necessários para alcançar suas metas.
                </p>
                <button className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-semibold text-[15px] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2">
                    Saiba mais
                </button>
            </div>
        </div>
    );
};

export default HeroCard;
