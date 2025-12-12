// public/core/redirect.js

import { supabase } from './supabase.js';

const redirectToDashboard = async () => {
    // 1. LEER SESIÓN DESDE LOCALSTORAGE (NUEVO)
    const authString = localStorage.getItem('ohmypet_auth');
    if (!authString) return; 

    const authData = JSON.parse(authString);
    const user = authData.id;
    const profile = authData; // Usamos el objeto completo como perfil

    if (user) {
        if (profile) {
            // AQUÍ ESTÁ LA CORRECCIÓN
            if (profile.role === 'dueño' || profile.role === 'admin') {
                // Dueños van al dashboard de administrador
                window.location.href = '/public/modules/dashboard/dashboard-overview.html';
            } else if (profile.role === 'empleado') {
                // Empleados van a su nuevo dashboard móvil
                window.location.href = '/public/modules/employee/dashboard.html';
            } else if (profile.role === 'cliente') {
                // Clientes verifican onboarding
                if (profile.onboarding_completed) {
                    window.location.href = '/public/index.html';
                } else {
                    window.location.href = '/public/modules/profile/onboarding.html';
                }
            } else {
                // Rol desconocido va al inicio
                window.location.href = '/public/index.html';
            }
        }
    }
};

export { redirectToDashboard };