
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Bot, Mail, Shield, Cloud, Layout, FileText, Calendar, Database, Globe, Lock, MessageCircle, Monitor, Upload } from 'lucide-react';

interface AddAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (app: any) => void;
    initialData?: any | null; // Optional prop for editing
}

const iconOptions = [
    { name: 'upload', icon: <Upload size={24} />, label: 'Adicionar do seu dispositivo' },
    { name: 'favicon', icon: <Globe size={24} />, label: 'Usar ícone do site' },
    { name: 'Bot', icon: <Bot size={24} /> },
    { name: 'Mail', icon: <Mail size={24} /> },
    { name: 'Shield', icon: <Shield size={24} /> },
    { name: 'Cloud', icon: <Cloud size={24} /> },
    { name: 'Layout', icon: <Layout size={24} /> },
    { name: 'FileText', icon: <FileText size={24} /> },
    { name: 'Calendar', icon: <Calendar size={24} /> },
    { name: 'Database', icon: <Database size={24} /> },
    { name: 'Lock', icon: <Lock size={24} /> },
    { name: 'MessageCircle', icon: <MessageCircle size={24} /> },
    { name: 'Monitor', icon: <Monitor size={24} /> },
];

const cardColorOptions = [
    { name: 'bg-white', label: 'Branco', class: 'bg-white' },
    { name: 'bg-blue-50', label: 'Azul Suave', class: 'bg-blue-50' },
    { name: 'bg-emerald-50', label: 'Verde Suave', class: 'bg-emerald-50' },
    { name: 'bg-amber-50', label: 'Amarelo Suave', class: 'bg-amber-50' },
    { name: 'bg-purple-50', label: 'Roxo Suave', class: 'bg-purple-50' },
    { name: 'bg-pink-50', label: 'Rosa Suave', class: 'bg-pink-50' },
];

const AddAppModal: React.FC<AddAppModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Bot');
    const [selectedCardColor, setSelectedCardColor] = useState('bg-white');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load initial data when modal opens or initialData changes
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setSelectedCardColor(initialData.cardColor || 'bg-white');
            setUrl(initialData.url || '');

            // Check if icon is a URL (custom upload) vs internal name
            if (initialData.iconName && initialData.iconName.startsWith('http')) {
                setSelectedIcon('upload');
                setPreviewUrl(initialData.iconName);
            } else {
                setSelectedIcon(initialData.iconName || 'Bot');
                setPreviewUrl(null);
            }
            setFile(null);
        } else {
            // Reset if adding new
            setTitle('');
            setDescription('');
            setSelectedIcon('Bot');
            setSelectedCardColor('bg-white');
            setUrl('');
            setFile(null);
            setPreviewUrl(null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // If current icon is 'upload' but we have a preview URL and NO new file,
        // it means we keep the existing image URL.
        // If we have a new file, we pass it to be uploaded.

        onSave({
            id: initialData?.id, // Pass ID back if editing
            title,
            description,
            iconName: selectedIcon,
            statusColor: 'green',
            cardColor: selectedCardColor,
            url: url || undefined,
            file: file, // Pass the file object
            existingIconUrl: (selectedIcon === 'upload' && !file) ? previewUrl : undefined
        });
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setSelectedIcon('upload');
        }
    };

    const handleIconSelect = (name: string) => {
        if (name === 'upload') {
            fileInputRef.current?.click();
        } else {
            setSelectedIcon(name);
            setFile(null);
            setPreviewUrl(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initialData ? 'Editar App' : 'Adicionar Novo App'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-black/5 transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Title Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Nome do App</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Novo Sistema"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Descrição</label>
                        <textarea
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Breve descrição da funcionalidade..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                        />
                    </div>

                    {/* Icon Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Ícone</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <div className="grid grid-cols-6 gap-2">
                            {iconOptions.map((opt) => (
                                <div key={opt.name} className="relative group">
                                    <button
                                        type="button"
                                        onClick={() => handleIconSelect(opt.name)}
                                        className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all relative overflow-hidden ${selectedIcon === opt.name
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105'
                                            : 'bg-white/50 hover:bg-white text-gray-500 hover:scale-105'
                                            }`}
                                    >
                                        {/* Render Preview for Upload option if available */}
                                        {opt.name === 'upload' && previewUrl ? (
                                            <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
                                        ) : (
                                            opt.icon
                                        )}
                                    </button>

                                    {/* Tooltip for special options */}
                                    {opt.label && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                            {opt.label}
                                            {/* Little arrow */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Card Color Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Cor do Card</label>
                        <div className="grid grid-cols-3 gap-3">
                            {cardColorOptions.map((opt) => (
                                <button
                                    key={opt.name}
                                    type="button"
                                    onClick={() => setSelectedCardColor(opt.name)}
                                    className={`py-3 rounded-xl flex items-center justify-center gap-2 transition-all border ${selectedCardColor === opt.name
                                            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md transform scale-[1.02]'
                                            : 'border-gray-100 hover:border-gray-200'
                                        } ${opt.class}`}
                                >
                                    <span className={`text-sm font-medium ${opt.name === 'bg-gray-900' ? 'text-white' : 'text-gray-700'}`}>{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">URL do App</label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Ex: https://dominio.com/app"
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        />
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl text-gray-700 font-medium hover:bg-black/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            {initialData ? 'Salvar Alterações' : 'Adicionar App'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddAppModal;
