import React from 'react';
import { Bell, Calendar, AlertTriangle, ChevronRight } from 'lucide-react';

const NoticeCard: React.FC = () => {
    const notices = [
        {
            id: 1,
            title: "Manutenção Programada",
            date: "Hoje, 23:00",
            type: "warning",
            description: "O sistema ficará indisponível para atualização de segurança."
        },
        {
            id: 2,
            title: "Reunião Geral",
            date: "Sexta, 14:00",
            type: "info",
            description: "Apresentação dos resultados do trimestre no auditório."
        },
        {
            id: 3,
            title: "Novo Benefício",
            date: "12 Dez",
            type: "success",
            description: "O vale-cultura foi creditado no cartão de benefícios."
        }
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
            case 'info': return <Calendar size={18} className="text-blue-500" />;
            case 'success': return <Bell size={18} className="text-emerald-500" />;
            default: return <Bell size={18} />;
        }
    };

    return (
        <div className="h-full w-full relative rounded-[32px] overflow-hidden shadow-2xl shadow-[#00000010] bg-white/60 backdrop-blur-3xl border border-white/40 flex flex-col">
            {/* Header */}
            <div className="p-8 pb-4 border-b border-gray-200/50 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Mural de Avisos</h2>
                    <p className="text-gray-500 text-sm mt-1">Atualizações importantes da empresa</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Bell size={20} />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto no-scrollbar">
                {notices.map((notice) => (
                    <div key={notice.id} className="group p-4 rounded-2xl bg-white/40 border border-white/50 hover:bg-white/80 transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                {getIcon(notice.type)}
                                <span className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">{notice.date}</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>
                        <h3 className="text-gray-900 font-semibold mb-1 text-[15px]">{notice.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{notice.description}</p>
                    </div>
                ))}

                {/* Empty state filler if needed to look full */}
                <div className="p-4 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center py-8 opacity-60">
                    <p className="text-sm text-gray-400 font-medium">Não há mais avisos recentes</p>
                </div>
            </div>

            {/* Footer Action */}
            <div className="p-6 pt-4 border-t border-gray-200/50 bg-white/20">
                <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10">
                    Ver todos os comunicados
                </button>
            </div>
        </div>
    );
};

export default NoticeCard;
