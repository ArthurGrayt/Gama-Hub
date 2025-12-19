
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Bot, Mail, Shield, Cloud, Layout, FileText, Calendar, Database, Globe, Lock, MessageCircle, Monitor, Upload, Search, Users } from 'lucide-react';
import { supabase } from '../services/supabase';

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

interface User {
    user_id: string; // Correct column name from public.users usually 'id' or 'user_id', checking App.tsx usage: eq('user_id', userId). Wait, App.tsx uses 'user_id' in queries to 'users' table? Yes: .eq('user_id', userId).
    username: string;
    img_url: string;
    role: number;
}

const AddAppModal: React.FC<AddAppModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('Bot');
    const [selectedCardColor, setSelectedCardColor] = useState('bg-white');
    const [url, setUrl] = useState('');

    // User Access Control State
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoadingUsers(true);
            try {
                const { data, error } = await supabase
                    .from('users')
                    .select('user_id, username, img_url, role')
                    .order('username');

                if (error) throw error;
                // Filter out admins (role >= 6) as they have implicit access
                if (data) {
                    const filteredData = data.filter((u: User) => u.role < 6);
                    setUsers(filteredData);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setIsLoadingUsers(false);
            }
        };

        if (isOpen) {
            fetchUsers();
        }
    }, [isOpen]);

    // Load initial data when modal opens or initialData changes
    useEffect(() => {
        if (initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setSelectedCardColor(initialData.cardColor || 'bg-white');
            setUrl(initialData.url || '');
            // Load selected users from existing app data
            // Ensure we handle case where users_acessers might be null/undefined
            setSelectedUserIds(initialData.users_acessers || []);

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
            setSelectedUserIds([]); // Start empty for new app? User request: "Usuarios não selecionados não devem estar no array". Implicit: Start empty.

            setFile(null);
            setPreviewUrl(null);
            setPreviewUrl(null);
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        onSave({
            id: initialData?.id, // Pass ID back if editing
            title,
            description,
            iconName: selectedIcon,
            statusColor: 'green',
            cardColor: selectedCardColor,
            url: url || undefined,
            file: file, // Pass the file object
            existingIconUrl: (selectedIcon === 'upload' && !file) ? previewUrl : undefined,
            users_acessers: selectedUserIds
        });
        onClose();
    };

    // User Selection Handlers
    const toggleUser = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleAllUsers = () => {
        // If all filtered users are selected, deselect them. Otherwise, select all filtered users.
        const filteredUsers = users.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));
        const allFilteredSelected = filteredUsers.every(u => selectedUserIds.includes(u.user_id));

        if (allFilteredSelected) {
            // Deselect all visible
            const idsToRemove = new Set(filteredUsers.map(u => u.user_id));
            setSelectedUserIds(prev => prev.filter(id => !idsToRemove.has(id)));
        } else {
            // Select all visible
            const newIds = filteredUsers.map(u => u.user_id);
            setSelectedUserIds(prev => Array.from(new Set([...prev, ...newIds])));
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <div className="relative w-full max-w-lg bg-white/80 backdrop-blur-3xl rounded-[32px] shadow-2xl border border-white/50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200/50 flex-shrink-0">
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

                <div className="overflow-y-auto custom-scrollbar">
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




                        {/* User Access Control Section */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Users size={16} />
                                    Usuários com Acesso
                                    <span className="text-xs font-normal text-gray-500 ml-1">
                                        ({selectedUserIds.length} selecionados)
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    onClick={toggleAllUsers}
                                    className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    {filteredUsers.every(u => selectedUserIds.includes(u.user_id)) && filteredUsers.length > 0 ? 'Desmarcar Todos' : 'Selecionar Todos'}
                                </button>
                            </div>

                            <div className="bg-gray-50/50 border border-gray-200 rounded-xl overflow-hidden">
                                {/* Search Bar */}
                                <div className="p-3 border-b border-gray-200/50 bg-white/50">
                                    <div className="relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Buscar usuário..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Users List */}
                                <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                    {isLoadingUsers ? (
                                        <div className="p-4 text-center text-sm text-gray-500">Carregando usuários...</div>
                                    ) : filteredUsers.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">Nenhum usuário encontrado.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-1">
                                            {filteredUsers.map(user => (
                                                <div
                                                    key={user.user_id}
                                                    onClick={() => toggleUser(user.user_id)}
                                                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all border ${selectedUserIds.includes(user.user_id)
                                                        ? 'bg-blue-50 border-blue-200'
                                                        : 'hover:bg-white border-transparent'
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedUserIds.includes(user.user_id)
                                                        ? 'bg-blue-600 border-blue-600'
                                                        : 'bg-white border-gray-300'
                                                        }`}>
                                                        {selectedUserIds.includes(user.user_id) && <Check size={12} className="text-white" />}
                                                    </div>

                                                    {user.img_url ? (
                                                        <img src={user.img_url} alt={user.username} className="w-8 h-8 rounded-full object-cover bg-gray-200" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-bold">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="text-sm text-gray-700 font-medium truncate">{user.username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

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
        </div>
    );
};

export default AddAppModal;
