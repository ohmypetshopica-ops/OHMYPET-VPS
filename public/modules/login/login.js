import { supabase } from './login.api.js';
import { redirectToDashboard } from '../../core/redirect.js';
import { recoverPassword } from './password-recovery.api.js';
// CORRECCIÓN: Importamos la función signInUser para usarla en el submit
import { signInUser } from './login.api.js'; 


// --- REDIRECCIÓN INMEDIATA SI YA ESTÁ LOGUEADO ---
document.addEventListener('DOMContentLoaded', redirectToDashboard);

// --- ELEMENTOS DEL DOM ---
const clientLoginForm = document.querySelector('#client-login-form');
const forgotPasswordForm = document.querySelector('#forgot-password-form');
const errorMessage = document.querySelector('#error-message');
const resetMessage = document.querySelector('#reset-message');
const formTitle = document.querySelector('#form-title');
const formSubtitle = document.querySelector('#form-subtitle');
const forgotPasswordLink = document.querySelector('#forgot-password-link');
const backToLoginLink = document.querySelector('#back-to-login-link');

// **** INICIO DE LA NUEVA FUNCIONALIDAD ****
const loginPasswordInput = document.querySelector('#password'); 
const loginToggleBtn = document.querySelector('#toggle-login-password');
const loginEyeIcon = document.querySelector('#login-eye-icon');
const loginEyeSlashIcon = document.querySelector('#login-eye-slash-icon');

if (loginToggleBtn && loginPasswordInput && loginEyeIcon && loginEyeSlashIcon) {
    loginToggleBtn.addEventListener('click', () => {
        const isPassword = loginPasswordInput.type === 'password';
        loginPasswordInput.type = isPassword ? 'text' : 'password';
        loginEyeIcon.classList.toggle('hidden', isPassword);
        loginEyeSlashIcon.classList.toggle('hidden', !isPassword);
    });
}
// **** FIN DE LA NUEVA FUNCIONALIDAD ****


// --- EVENT LISTENERS PARA CAMBIAR DE VISTA ---
forgotPasswordLink.addEventListener('click', () => {
    clientLoginForm.classList.add('hidden');
    forgotPasswordForm.classList.remove('hidden');
    formTitle.textContent = 'Recuperar Contraseña';
    formSubtitle.textContent = 'Ingresa tu correo electrónico para recibir un enlace de recuperación.';
    errorMessage.classList.add('hidden');
    resetMessage.classList.add('hidden');
});

backToLoginLink.addEventListener('click', () => {
    forgotPasswordForm.classList.add('hidden');
    clientLoginForm.classList.remove('hidden');
    formTitle.textContent = '¡Bienvenido de nuevo!';
    formSubtitle.textContent = 'Inicia sesión en tu cuenta para continuar.';
    resetMessage.classList.add('hidden');
});

// --- MANEJO DEL FORMULARIO DE INICIO DE SESIÓN ---
clientLoginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorMessage.classList.add('hidden');

    const email = clientLoginForm.email.value;
    const password = clientLoginForm.password.value;

    // 1. AUTENTICACIÓN CON LA NUEVA FUNCIÓN DE API
    const { user, profile, error } = await signInUser(email, password);

    if (error) {
        console.error('Error al iniciar sesión:', error.message);
        errorMessage.classList.remove('hidden');
        return;
    }

    // 2. SIMULACIÓN DE SESIÓN LOCAL (REEMPLAZO DE setSession de Supabase)
    if (user && profile) {
        const authData = { 
            id: user.id, 
            email: user.email, 
            role: profile.role,
            onboarding_completed: profile.onboarding_completed
        };

        // Guardamos la sesión en localStorage para que el frontend pueda verla
        localStorage.setItem('ohmypet_auth', JSON.stringify(authData));
        
        // 3. REDIRECCIÓN BASADA EN EL ROL
        
        if (profile.role === 'dueño' || profile.role === 'admin') {
            window.location.href = '/public/modules/dashboard/dashboard-overview.html';
        } else if (profile.role === 'empleado') {
            window.location.href = '/public/modules/employee/dashboard.html';
        } else if (profile.role === 'cliente') {
            if (profile.onboarding_completed) {
                window.location.href = '/public/index.html';
            } else {
                window.location.href = '/public/modules/profile/onboarding.html';
            }
        } else {
            window.location.href = '/public/index.html';
        }
    }
});

// --- MANEJO DEL FORMULARIO DE RECUPERACIÓN DE CONTRASEÑA ---
forgotPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetMessage.classList.add('hidden');

    const email = document.querySelector('#reset-email').value;
    
    // NOTE: recoverPassword sigue usando la función original de Supabase (por el enlace mágico)
    const { success, error } = await recoverPassword(email);

    if (success) {
        resetMessage.textContent = 'Si tu correo existe en nuestro sistema, recibirás un enlace de recuperación en breve.';
        resetMessage.className = 'block mb-4 p-4 rounded-md bg-green-100 text-green-700';
    } else {
        resetMessage.textContent = 'Hubo un problema al procesar tu solicitud. Inténtalo de nuevo.';
        resetMessage.className = 'block mb-4 p-4 rounded-md bg-red-100 text-red-700';
    }
    resetMessage.classList.remove('hidden');
});