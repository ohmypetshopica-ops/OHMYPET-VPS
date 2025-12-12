// public/modules/dashboard/clients.api.js

// Importamos la API_URL del nuevo backend
import { supabase, API_URL } from '../../core/supabase.js';

// Función genérica para manejar el fetch a la API
const fetchApi = async (path, method = 'GET', body = null) => {
    try {
        const response = await fetch(`${API_URL}/clients${path}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : null
        });
        
        const data = await response.json();
        
        if (!response.ok || data.error) {
            console.error(`API Error on ${path}:`, data.error || response.statusText);
            return { data: null, error: data.error || new Error(response.statusText) };
        }
        
        // La API devuelve { success: true, data: [...] }
        return { data: data.data || [], error: null };

    } catch (error) {
        console.error(`Fetch failed for ${path}:`, error);
        return { data: null, error };
    }
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

/**
 * Obtiene detalles profundos de un cliente.
 * NOTA: POR AHORA DEVUELVE NULL. Debes crear la ruta /api/clients/:id en Node.js.
 */
export const getClientDetails = async (clientId) => {
    // Ruta pendiente de implementación: GET /api/clients/details/:id
    return null;
};

/**
 * Registra cliente nuevo (Usa POST /api/clients/register).
 */
export const registerClientFromDashboard = async (clientData) => {
    const { error } = await fetchApi('/register', 'POST', clientData);
    if (error) return { success: false, error };
    return { success: true };
};

/**
 * Actualiza perfil.
 * NOTA: POR AHORA DEVUELVE FALLO. Debes crear la ruta PUT/PATCH /api/clients/:id.
 */
export const updateClientProfile = async (clientId, profileData) => {
    const { error } = await fetchApi(`/${clientId}`, 'PUT', profileData);
    if (error) return { success: false, error };
    return { success: true };
};

/**
 * Elimina cliente.
 * NOTA: POR AHORA DEVUELVE FALLO. Debes crear la ruta DELETE /api/clients/:id.
 */
export const deleteClient = async (clientId) => {
    const { error } = await fetchApi(`/${clientId}`, 'DELETE');
    if (error) return { success: false, error };
    return { success: true };
};