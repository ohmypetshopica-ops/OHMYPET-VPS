// core/auth-client.js

import { supabase } from './supabase.js';

const checkUserSession = async () => {
    // 1. Leer sesión directamente de localStorage
    const authString = localStorage.getItem('ohmypet_auth');

    if (!authString) {
        // Si no hay sesión local, redirige al login de clientes
        window.location.href = '/public/modules/login/login.html';
        return;
    }
    
    try {
        const authData = JSON.parse(authString);
        // 2. Verificar que sea un cliente
        if (authData.role !== 'cliente') {
            // Si hay datos, pero no es cliente (ej: admin que entró por otro lado), limpiamos
            localStorage.removeItem('ohmypet_auth');
            window.location.href = '/public/modules/login/login.html';
        }
    } catch (e) {
        // En caso de error de JSON, limpiamos la sesión.
        localStorage.removeItem('ohmypet_auth');
        window.location.href = '/public/modules/login/login.html';
    }
};

checkUserSession();