// public/modules/dashboard/clients.api.js

// Importamos la API_URL del nuevo backend
import { supabase, API_URL } from '../../core/supabase.js';

// --- FUNCIÓN CENTRAL DE FETCH CON RESILIENCIA (NUEVO) ---
const fetchApi = async (path, method = 'GET', body = null) => {
    let attempts = 0;
    const maxAttempts = 5; // Intentaremos hasta 5 veces
    
    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${API_URL}/clients${path}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : null
            });

            // Si el servidor Express responde con éxito, devolvemos los datos.
            if (response.ok) {
                 const data = await response.json();
                 
                 // Manejamos errores lógicos o fallos de la DB reportados por la API
                 if (data.success === false) {
                    console.error(`API Error:`, data.error);
                    throw new Error(data.message || data.error || 'Error interno de la API.');
                 }
                 
                 // ÉXITO: Devolvemos los datos
                 return { data: data.data || data, error: null };
            } 
            
            // Si hay un error 500 o de conexión (que causa ECONNRESET), reintentamos
            if (response.status === 500 || response.status === 503) {
                throw new Error('Internal Server Error (Backend warming up).');
            }

            // Para otros errores HTTP (400s)
            throw new Error(`HTTP Error: ${response.status}`);

        } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
                console.error(`Fetch falló después de ${maxAttempts} intentos para ${path}:`, error);
                // NOTA: EL ERROR DE CONEXIÓN TERMINA AQUÍ.
                return { data: null, error: new Error(`No se pudo conectar a la API después de ${maxAttempts} intentos. El servidor de Node.js no está estable.`) };
            }

            // Espera exponencial: 1s, 2s, 4s, 8s, 16s...
            const delay = Math.pow(2, attempts) * 500; 
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    // Devolvemos fallo si el ciclo termina
    return { data: null, error: new Error("La conexión a la API falló inesperadamente.") };
};


/**
 * Obtiene la lista de clientes con métricas básicas (Usa GET /api/clients/).
 */
export const getClients = async () => {
    const { data } = await fetchApi('/');
    return data || [];
};

/**
 * Obtiene clientes con sus mascotas anidadas (Usa GET /api/clients/pets).
 */
export const getClientsWithPets = async () => {
    const { data } = await fetchApi('/pets');
    return data || [];
};

/**
 * Búsqueda de clientes (Usa GET /api/clients/search).
 */
export const searchClients = async (searchTerm) => {
    const { data } = await fetchApi(`/search?term=${encodeURIComponent(searchTerm)}`);
    return data || [];
};

// --- PENDIENTES DE IMPLEMENTACIÓN DE RUTA ---
export const getClientDetails = async (clientId) => {
    // ESTA RUTA DEBE SER IMPLEMENTADA EN EL BACKEND
    const { data, error } = await fetchApi(`/details/${clientId}`);
    // Simulación de estructura esperada por el frontend para no fallar
    if (error) return null;
    return {
        profile: data[0] || {}, 
        pets: data[1] || [], 
        appointments: data[2] || []
    };
};

export const registerClientFromDashboard = async (clientData) => {
    const { error } = await fetchApi('/register', 'POST', clientData);
    if (error) return { success: false, error };
    return { success: true };
};

export const updateClientProfile = async (clientId, profileData) => {
    const { error } = await fetchApi(`/update/${clientId}`, 'PUT', profileData);
    if (error) return { success: false, error };
    return { success: true };
};

export const deleteClient = async (clientId) => {
    const { error } = await fetchApi(`/${clientId}`, 'DELETE');
    if (error) return { success: false, error };
    return { success: true };
};