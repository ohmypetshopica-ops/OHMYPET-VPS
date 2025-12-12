// public/core/supabase.js

// ---- ESTE ARCHIVO AHORA SOLO EXPORTA LA URL DEL NUEVO BACKEND API ----
const API_BASE_URL = 'http://146.190.39.209:3000/api'; 

// Exportar la URL del nuevo backend API para que los módulos frontend
// puedan usar la función nativa 'fetch()'
export const API_URL = API_BASE_URL;

// Dejamos un objeto vacío llamado 'supabase' para COMPATIBILIDAD.
// Todas las llamadas a 'supabase.from()' ahora lanzarán un error para forzar la migración
// a 'fetch(API_URL + ...)' en el código del frontend.
export const supabase = {
    auth: {
        signInWithPassword: () => { throw new Error("MIGRACION: Usa fetch() a API_URL/auth/login en lugar de supabase.auth"); },
        signUp: () => { throw new Error("MIGRACION: Usa fetch() a API_URL/auth/register en lugar de supabase.auth"); },
        getUser: () => { throw new Error("MIGRACION: Usa fetch() a API_URL/auth/user en lugar de supabase.auth"); }
    },
    from: (table) => { throw new Error(`MIGRACION: Usa fetch() a API_URL/${table} en lugar de supabase.from('${table}')`); },
    storage: {
        from: (bucket) => { throw new Error("MIGRACION: Usa SFTP para archivos en el servidor en lugar de supabase.storage"); }
    }
};