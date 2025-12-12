// public/modules/dashboard/dashboard.api.js

import { supabase, API_URL } from '../../core/supabase.js';

// --- FUNCIONES DE CONTEO (Reemplazo de Supabase.count) ---

const fetchCount = async (table, filter = {}) => {
    // Nota: Como no tenemos una API real de conteo, usaremos una API de lista y contamos en el frontend.
    // ESTO DEBERÍA SER REEMPLAZADO POR UNA RUTA EN NODE.JS PARA EFICIENCIA.
    // Por ahora, usamos fetch de prueba.
    try {
        const response = await fetch(`${API_URL}/status`); // Ruta de prueba para evitar fallos
        const data = await response.json();
        
        // Simulamos un conteo exitoso para evitar que el dashboard se rompa
        // En tu backend Node.js, esta ruta devolvería el conteo real desde Postgres.
        if (table === 'profiles') return 50; 
        if (table === 'pets') return 80;
        if (table === 'appointments') return 5;
        if (table === 'products') return 25;
        
        return 0;
    } catch (error) {
        console.error(`Error fetching count for ${table}:`, error);
        return 0;
    }
};

// [1] REEMPLAZO: Conteo de Clientes
export const getClientCount = async () => {
    // Antes: supabase.from('profiles').select('...', { count: 'exact', head: true })
    return fetchCount('profiles');
};

// [2] REEMPLAZO: Conteo de Mascotas
export const getPetCount = async () => {
    // Antes: supabase.from('pets').select('...', { count: 'exact', head: true })
    return fetchCount('pets');
};

// [3] REEMPLAZO: Conteo de Citas Pendientes
export const getAppointmentsCount = async () => {
    // Antes: supabase.from('appointments').select('...', { count: 'exact', head: true }).eq('status', 'pendiente')
    return fetchCount('appointments', { status: 'pendiente' });
};

// [4] REEMPLAZO: Conteo de Productos
export const getProductsCount = async () => {
    // Antes: supabase.from('products').select('...', { count: 'exact', head: true })
    return fetchCount('products');
};

// [5] REEMPLAZO: Obtener próximas citas (Simulación con datos dummy)
export const getUpcomingAppointments = async () => {
    // Esto es temporal hasta que desarrollemos la ruta real en Node.js
    // Simula el retorno para que la UI no se rompa
    return []; 
};

// [6] REEMPLAZO: Estadísticas Mensuales (Simulación)
export const getMonthlyAppointmentsStats = async () => {
    // Esto es temporal hasta que desarrollemos la ruta real en Node.js
    return []; 
};

// [7] REEMPLAZO: Mascotas para Recordatorios (Simulación)
export const getPetsNeedingAppointment = async () => {
    // Esto es temporal hasta que desarrollemos la ruta real en Node.js
    return []; 
};


// Re-exportamos todo lo demás, ya que NO usamos supabase.js directamente en este archivo
export * from './appointments.api.js';
export * from './clients.api.js';
export * from './pets.api.js';
export * from './products.api.js';
export * from './sales.api.js';
export * from './calendar.api.js';