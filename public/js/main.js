// public/js/main.js
import { supabase } from '../core/supabase.js';
// Importamos la nueva función que obtiene el usuario
import { getAuthenticatedUser } from '../modules/login/login.api.js';

// Importar cart de forma segura
let updateCartBadge = () => {};
try {
    const cartModule = await import('./cart.js');
    if (cartModule.updateCartBadge) {
        updateCartBadge = cartModule.updateCartBadge;
    }
} catch (error) {
    console.log('Cart no disponible');
}

/**
 * Actualiza la UI del header según el estado de autenticación
 */
const setupUI = async (user) => {
    const guestNav = document.getElementById('guest-nav');
    const userNav = document.getElementById('user-nav');
    const userInitialElement = document.getElementById('user-initial');

    if (!guestNav || !userNav) return false;

    if (user) {
        guestNav.classList.add('hidden');
        userNav.classList.remove('hidden');
        userNav.classList.add('flex');

        // Ya no usamos supabase.from aquí, asumimos que el user ya tiene info
        // o si es necesario, implementamos un fetch al perfil en getAuthenticatedUser
        const profile = user.profile; 

        if (userInitialElement && profile) {
            const displayName = profile.first_name || profile.full_name || profile.last_name;
            if (displayName) {
                userInitialElement.textContent = displayName.charAt(0).toUpperCase();
            } else {
                userInitialElement.textContent = '👤';
            }
        }
    } else {
        guestNav.classList.remove('hidden');
        userNav.classList.add('hidden');
        userNav.classList.remove('flex');
    }
    
    return true;
};

/**
 * Configura el botón de logout
 */
const setupLogoutButton = () => {
    const logoutButton = document.getElementById('logout-btn');
    if (!logoutButton) return;
    
    const newLogoutButton = logoutButton.cloneNode(true);
    logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
    
    newLogoutButton.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            localStorage.clear();
            sessionStorage.clear();
            // NO usamos supabase.auth.signOut, solo limpiamos la sesión localmente
            // y redirigimos.
            window.location.href = '/public/index.html';
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            window.location.href = '/public/index.html';
        }
    });
};

/**
 * SOLUCIÓN: Event delegation en el body para que funcione incluso si el header no existe aún
 */
const setupHeaderEventListeners = () => {
    // Usar event delegation en document.body para capturar clicks incluso si los elementos se cargan después
    document.body.addEventListener('click', (event) => {
        // ... (resto de la lógica del menú, sin cambios)
        
        // Menú de invitado (icono de usuario)
        const profileMenuButton = event.target.closest('#guest-menu-btn');
        if (profileMenuButton) {
            event.preventDefault();
            event.stopPropagation();
            const profileMenu = document.getElementById('guest-dropdown');
            const userProfileMenu = document.getElementById('user-dropdown');
            profileMenu?.classList.toggle('hidden');
            userProfileMenu?.classList.add('hidden');
            return;
        }
        
        // Menú de usuario logueado (círculo con inicial)
        const userProfileButton = event.target.closest('#user-menu-btn');
        if (userProfileButton) {
            event.preventDefault();
            event.stopPropagation();
            const userProfileMenu = document.getElementById('user-dropdown');
            const profileMenu = document.getElementById('guest-dropdown');
            userProfileMenu?.classList.toggle('hidden');
            profileMenu?.classList.add('hidden');
            return;
        }

        // Cerrar menús si se hace clic fuera
        const profileMenu = document.getElementById('guest-dropdown');
        const userProfileMenu = document.getElementById('user-dropdown');
        const clickedInsideProfileMenu = event.target.closest('#guest-dropdown');
        const clickedInsideUserMenu = event.target.closest('#user-dropdown');
        
        if (profileMenu && !profileMenu.classList.contains('hidden') && 
            !profileMenuButton && !clickedInsideProfileMenu) {
            profileMenu.classList.add('hidden');
        }
        
        if (userProfileMenu && !userProfileMenu.classList.contains('hidden') && 
            !userProfileButton && !clickedInsideUserMenu) {
            userProfileMenu.classList.add('hidden');
        }
    });
};

/**
 * Inicializa la UI con reintentos
 */
const initializeUI = async () => {
    // Usamos la nueva función para obtener el estado de autenticación (si hay datos en localStorage)
    const { user, profile } = await getAuthenticatedUser();
    
    // NOTE: Este setup asume que la sesión está guardada localmente (lo que hacía Supabase). 
    // Como estamos simulando, pasamos el perfil.
    let userWithProfile = user ? { ...user, profile } : null;

    let attempts = 0;
    const maxAttempts = 15; 
    
    const trySetup = async () => {
        const success = await setupUI(userWithProfile);
        
        if (success) {
            if (userWithProfile) {
                setupLogoutButton();
            }
        } else {
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(trySetup, 100);
            }
        }
    };
    
    trySetup();
};

/**
 * Inicialización principal
 */
const initialize = () => {
    // IMPORTANTE: Configurar listeners INMEDIATAMENTE, antes de que el header exista
    setupHeaderEventListeners();
    
    // Luego inicializar UI
    initializeUI();
    
    // NOTA: EL onAuthStateChange de Supabase ya no funciona,
    // por lo que confiamos en la carga inicial y la redirección.
    
    // Actualizar badge del carrito
    updateCartBadge();
};

// Múltiples puntos de entrada para asegurar inicialización
document.addEventListener('layoutReady', initialize);
document.addEventListener('DOMContentLoaded', initialize);

// Si el script se carga después del DOMContentLoaded
if (document.readyState !== 'loading') {
    initialize();
}