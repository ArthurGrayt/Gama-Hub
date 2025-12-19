import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
  TouchSensor
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';

import MainLayout from './layouts/MainLayout';
import NoticeCard from './components/NoticeCard';
import AppCard from './components/AppCard';
import { SortableAppCard } from './components/SortableAppCard';
import AddAppModal from './components/AddAppModal';
import LoginPage from './components/LoginPage';
import { Bot, Mail, Shield, Cloud, Layout, FileText, Search, Plus, Pencil, Calendar, Database, Globe, Lock, MessageCircle, Monitor, LogOut } from 'lucide-react';
import { supabase } from './services/supabase';
import type { GamaHubApp } from './services/supabase';
import type { Session } from '@supabase/supabase-js';

// Define the App data structure used in the UI
interface AppData {
  id: number;
  title: string;
  description: string;
  iconName: string;
  statusColor: 'green' | 'blue' | 'yellow' | 'gray';
  cardColor?: string;
  url?: string;
  users_acessers?: string[];
}

// Icon mapping registry
const iconMap: Record<string, React.ReactNode> = {
  Bot: <Bot size={32} />,
  Mail: <Mail size={32} />,
  Shield: <Shield size={32} />,
  Cloud: <Cloud size={32} />,
  Layout: <Layout size={32} />,
  FileText: <FileText size={32} />,
  Calendar: <Calendar size={32} />,
  Database: <Database size={32} />,
  Globe: <Globe size={32} />,
  Lock: <Lock size={32} />,
  MessageCircle: <MessageCircle size={32} />,
  Monitor: <Monitor size={32} />
};

// Helper to get color classes for icons based on status
const getIconClass = (color: string) => {
  switch (color) {
    case 'green': return 'text-emerald-500';
    case 'blue': return 'text-blue-500';
    case 'yellow': return 'text-amber-400';
    case 'gray': return 'text-gray-400';
    default: return 'text-blue-500';
  }
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [apps, setApps] = useState<AppData[]>([]);
  const [userProfile, setUserProfile] = useState<{ username: string; img_url: string; role: number } | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<number | null>(null); // For DragOverlay

  // Configure sensors for DnD
  // Using PointerSensor with activation constraint for "Click and Hold" behavior
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay for "Click and Hold" to start drag
        tolerance: 5, // 5px tolerance for movement during delay
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Initialize session and apps (moved fetch calls to separate function to reuse)
  const initializeData = async (userId: string) => {
    // 1. Fetch User Profile
    await fetchUserProfile(userId);
    // 2. Fetch Apps
    await fetchApps();
    setIsLoading(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        initializeData(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        initializeData(session.user.id);
      } else {
        setApps([]);
        setUserProfile(null);
        setIsEditMode(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username, img_url, role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile({ username: 'Usuário', img_url: '', role: 0 });
      } else if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile({ username: 'Usuário', img_url: '', role: 0 });
    }
  };

  const fetchApps = async () => {
    try {
      const { data: appsData, error: appsError } = await supabase
        .from('gamahub_apps')
        .select('*')
        .order('created_at', { ascending: true });

      if (appsError) throw appsError;

      let mappedApps: AppData[] = [];
      if (appsData) {
        mappedApps = appsData.map((item: GamaHubApp) => ({
          id: item.id!,
          title: item.nome,
          description: item.descricao,
          iconName: item.icone,
          statusColor: 'green',
          cardColor: item.cor,

          url: item.url_app,
          users_acessers: item.users_acessers || []
        }));
      }

      setApps(mappedApps);

    } catch (error) {
      console.error('Error in fetchApps:', error);
    }
  };

  // DnD Handlers
  const handleDragStart = (event: any) => {
    if (isEditMode) return;
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (active.id !== over?.id) {
      setApps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Save to backend - DISABLED (Removed user_dashboard)
        // saveUserDashboard(newOrder);

        return newOrder;
      });
    }
  };

  // Extended AppData to include file for saving
  interface AppDataToSave extends AppData {
    file?: File;
    existingIconUrl?: string;
  }

  const handleSaveApp = async (appData: AppDataToSave) => {
    try {
      let iconToSave = appData.iconName;

      // Check if there is a file to upload
      if (appData.file) {
        const file = appData.file;
        const fileExt = file.name.split('.').pop();
        const fileName = `docs/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName);

        iconToSave = publicUrl;
      } else if (appData.existingIconUrl) {
        // If editing and we kept the existing uploaded icon
        iconToSave = appData.existingIconUrl;
      }

      const appDataToDb = {
        nome: appData.title,
        descricao: appData.description,
        icone: iconToSave,
        cor: appData.cardColor || 'bg-white',

        url_app: appData.url || '',
        users_acessers: appData.users_acessers
      };

      if (appData.id) {
        // Update existing app
        const { error } = await supabase
          .from('gamahub_apps')
          .update(appDataToDb)
          .eq('id', appData.id);

        if (error) throw error;
      } else {
        // Create new app
        const { error } = await supabase
          .from('gamahub_apps')
          .insert([{
            ...appDataToDb,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }

      if (session) fetchApps();

    } catch (error) {
      console.error('Error saving app:', error);
      alert('Erro ao salvar o app. Tente novamente.');
    }
  };

  const handleEditApp = (app: AppData) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleDeleteApp = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este app?')) {
      try {
        const { error } = await supabase
          .from('gamahub_apps')
          .delete()
          .eq('id', id);

        if (error) throw error;
        if (session) fetchApps();
      } catch (error) {
        console.error('Error deleting app:', error);
        alert('Erro ao excluir o app. Tente novamente.');
      }
    }
  };

  const openNewAppModal = () => {
    setEditingApp(null);
    setIsModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Helper to get Icon Node for Rendering
  const getIconNode = (app: AppData) => {
    if (app.iconName === 'favicon' && app.url) {
      return (
        <img
          src={`https://www.google.com/s2/favicons?domain=${app.url}&sz=64`}
          alt={`${app.title} icon`}
          className="w-8 h-8 rounded-md object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      );
    } else if (app.iconName && app.iconName.startsWith('http')) {
      return (
        <img
          src={app.iconName}
          alt={`${app.title} icon`}
          className="w-10 h-10 rounded-lg object-cover bg-white/50 backdrop-blur-sm"
        />
      );
    } else {
      const IconComponent = iconMap[app.iconName] || iconMap['Bot'];
      return React.cloneElement(IconComponent as React.ReactElement<{ className?: string }>, { className: getIconClass(app.statusColor) });
    }
  };

  // Filter apps based on users_acessers
  const filteredApps = apps.filter(app => {
    // 1. Admins (role >= 6) see ALL apps
    if (userProfile && userProfile.role >= 6) return true;

    // 2. Regular users see only apps where they are in users_acessers
    if (session?.user?.id && app.users_acessers?.includes(session.user.id)) return true;

    return false;
  });

  // If not logged in, show Login Page
  if (!session) {
    return <LoginPage />;
  }

  return (
    <MainLayout>
      <AddAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveApp}
        initialData={editingApp}
      // userRole prop removed -- access control for editing is handled by parent visibility check
      />

      {/* Page Title Section */}
      <div className="mb-6 mt-2 flex items-center justify-between">
        <div className="flex items-center gap-5">
          {/* Brand Logo */}
          <div className="bg-white/80 backdrop-blur-xl p-3 rounded-[20px] shadow-sm border border-white/60">
            <img src="/src/assets/logo.png" alt="Gama Hub Logo" className="w-12 h-12 object-contain" />
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight leading-snug">
            Gama Hub <span className="text-gray-400 font-light mx-2">–</span> <span className="text-gray-700">Central de recursos Gama Center</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* User Profile */}
          {userProfile && (
            <div className="flex items-center gap-3 px-4 py-1.5 bg-white/50 backdrop-blur-sm rounded-full border border-white/60 shadow-sm mr-2">
              <div className="flex flex-col items-end hidden md:flex">
                <span className="text-sm font-semibold text-gray-800 leading-none">{userProfile.username}</span>
              </div>
              {userProfile.img_url ? (
                <img
                  src={userProfile.img_url}
                  alt={userProfile.username}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-2 border-white shadow-sm text-blue-600 font-bold text-lg">
                  {userProfile.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          )}

          {/* Edit Mode Toggle - Only role > 6 */}
          {userProfile && userProfile.role >= 6 && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all shadow-sm border ${isEditMode ? 'bg-gray-900 text-white border-gray-900' : 'bg-white/50 text-gray-600 border-white/60 hover:bg-white hover:shadow-md'}`}
            >
              <Pencil size={18} />
              {isEditMode ? 'Concluir Edição' : 'Editar Apps'}
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-3 rounded-full font-medium transition-all shadow-sm border bg-white/50 text-red-500 border-white/60 hover:bg-red-50 hover:border-red-100 hover:shadow-md h-[46px] w-[46px] flex items-center justify-center"
            title="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_3fr] gap-8 min-h-[600px]">
        {/* Left Column: Notice Panel */}
        <div className="lg:col-span-1 self-start lg:h-[520px] min-h-[400px]">
          <NoticeCard />
        </div>

        {/* Right Section: Apps Grid */}
        <div className="flex flex-col gap-8">
          {/* Search Bar */}
          <div className="bg-white/60 backdrop-blur-3xl border border-white/50 pl-5 pr-2 py-2.5 rounded-[24px] flex items-center gap-4 w-full shadow-sm hover:shadow-lg transition-all focus-within:shadow-xl focus-within:bg-white/80 focus-within:-translate-y-0.5 group">
            <Search size={22} className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="O que você está procurando hoje?"
              className="bg-transparent border-none outline-none text-gray-700 placeholder-gray-400/90 text-[16px] font-medium w-full h-11"
            />
          </div>

          {/* Apps Grid with DnD Context */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr overflow-y-auto max-h-[65vh] p-2 pb-6 no-scrollbar">

              {/* Loading State */}
              {isLoading && (
                <div className="col-span-full flex justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredApps.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  Nenhum app encontrado.
                </div>
              )}

              {/* Render Sortable App Cards */}
              {!isLoading && (
                <SortableContext
                  items={filteredApps.map(a => a.id)}
                  strategy={rectSortingStrategy}
                >
                  {filteredApps.map((app) => (
                    <SortableAppCard
                      key={app.id}
                      id={app.id}
                      app={app}
                      isEditMode={isEditMode}
                      onEdit={() => handleEditApp(app)}
                      onDelete={() => handleDeleteApp(app.id)}
                      iconNode={getIconNode(app)}
                    />
                  ))}
                </SortableContext>
              )}

              {/* Add New App Card (Visible only in Edit Mode) */}
              {
                isEditMode && (
                  <button
                    onClick={openNewAppModal}
                    className="group h-full min-h-[240px] rounded-[32px] border-2 border-dashed border-gray-300 hover:border-blue-500 bg-white/20 hover:bg-blue-50/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4 transition-all cursor-pointer animate-in fade-in zoom-in-95 duration-300"
                  >
                    <div className="w-16 h-16 rounded-full bg-white group-hover:bg-blue-600 shadow-sm group-hover:shadow-xl group-hover:shadow-blue-600/20 flex items-center justify-center transition-all duration-300">
                      <Plus size={32} className="text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-gray-500 font-medium group-hover:text-blue-600 transition-colors">Adicionar Novo App</span>
                  </button>
                )
              }
            </div>

            {/* Drag Overlay for smooth animation */}
            <DragOverlay>
              {activeId ? (
                (() => {
                  const app = apps.find(a => a.id === activeId);
                  if (!app) return null;
                  return (
                    <AppCard
                      title={app.title}
                      description={app.description}
                      icon={getIconNode(app)}
                      statusColor={app.statusColor}
                      cardColor={app.cardColor}
                      url={app.url}
                      isEditMode={isEditMode}
                    />
                  )
                })()
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </MainLayout>
  );
}

export default App;
