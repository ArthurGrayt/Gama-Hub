import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wofipjazcxwxzzxjsflh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvZmlwamF6Y3h3eHp6eGpzZmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4MDA2NjcsImV4cCI6MjA3NDM3NjY2N30.gKjTEhXbrvRxKcn3cNvgMlbigXypbshDWyVaLqDjcpQ';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Type definition matching the database table
export interface GamaHubApp {
    id?: number;
    nome: string;
    descricao: string;
    icone: string;
    cor: string;
    url_app: string;
    created_at?: string;
    min_role?: number; // Minimum role required to view the app
}

export interface UserDashboard {
    user_id: string; // Foreign Key to auth.users (or public.users)
    apps_visiveis: number[]; // Array of App IDs in display order
    created_at?: string;
}
