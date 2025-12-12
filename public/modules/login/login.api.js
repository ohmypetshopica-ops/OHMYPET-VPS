// public/modules/login/login.api.js

import { supabase, API_URL } from '../../core/supabase.js';

// --- FUNCIÓN DE FETCH CON RESILIENCIA (NUEVO) ---
const fetchAuthApi = async (path, method = 'POST', body = null) => {
    let attempts = 0;
    const maxAttempts = 5; 
    
    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${API_URL}/auth${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : null
            });

            const data = await response.json();
            
            if (response.ok && data.success) {
                return { data: data, error: null };
            } 
            
            if (response.status === 500 || response.status === 503) {
                 throw new Error('Backend warming up or temporary error.');
            }

            return { data: null, error: new Error(data.message || 'Credenciales inválidas') };

        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                console.error(`Fetch Login falló después de ${maxAttempts} intentos:`, error);
                return { data: null, error: new Error("La conexión a la API de autenticación no es estable.") };
            }

            const delay = Math.pow(2, attempts) * 500; 
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return { data: null, error: new Error("La conexión a la API falló inesperadamente.") };
};

/**
 * Llama a la API para iniciar sesión. (EXPORTADO CLARAMENTE)
 */
export const signInUser = async (email, password) => {
    const { data, error } = await fetchAuthApi('/login', 'POST', { email, password });
    
    if (error) {
        return { user: null, profile: null, error };
    }
    
    return { user: data.user, profile: data.profile, error: null };
};

/**
 * Llama a la API para obtener el usuario actual y su perfil. (EXPORTADO CLARAMENTE)
 */
export const getAuthenticatedUser = async () => {
    const { data, error } = await fetchAuthApi('/user', 'GET');

    if (error) {
        return { user: null, profile: null, error };
    }
    
    return { user: data.user, profile: data.profile, error: null };
};

export { supabase };