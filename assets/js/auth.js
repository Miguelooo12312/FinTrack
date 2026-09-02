"use strict";

/* Punto de integración: aquí se conectará el proveedor de autenticación.
   Nunca se guarda una contraseña en localStorage. */
const authService = {
    async signIn({ email, password }) {
        if(!this.endpoint) throw new Error("AUTH_NOT_CONFIGURED");
        return fetch(`${this.endpoint}/auth/login`, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ email, password })
        });
    },
    async register({ name, email, password }) {
        if(!this.endpoint) throw new Error("AUTH_NOT_CONFIGURED");
        return fetch(`${this.endpoint}/auth/register`, {
            method:"POST",
            headers:{ "Content-Type":"application/json" },
            body:JSON.stringify({ name, email, password })
        });
    },
    endpoint: null
};

function initAuthModal(){
    const modal = document.getElementById("auth-modal");
    const form = document.getElementById("auth-form");
    const nameGroup = document.getElementById("auth-name-group");
    const title = document.getElementById("auth-title");
    const description = document.getElementById("auth-description");
    const submit = document.getElementById("submit-auth");
    const toggle = document.getElementById("toggle-auth-mode");
    const feedback = document.getElementById("auth-feedback");
    let isRegistering = false;

    const close = () => modal.classList.remove("active");
    const render = () => {
        title.textContent = isRegistering ? "Crear cuenta" : "Iniciar sesión";
        description.textContent = isRegistering ? "Crea tu acceso para sincronizar FinTrack cuando conectemos la base de datos." : "Accede para sincronizar tus datos cuando conectemos la base de datos.";
        submit.textContent = isRegistering ? "Crear cuenta" : "Iniciar sesión";
        toggle.textContent = isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate";
        nameGroup.classList.toggle("hidden", !isRegistering);
        document.getElementById("auth-name").required = isRegistering;
        feedback.textContent = "";
    };

    document.getElementById("open-auth-modal").addEventListener("click", () => {
        form.reset();
        isRegistering = false;
        render();
        modal.classList.add("active");
        document.getElementById("auth-email").focus();
    });
    document.getElementById("close-auth-modal").addEventListener("click", close);
    document.getElementById("cancel-auth").addEventListener("click", close);
    toggle.addEventListener("click", () => { isRegistering = !isRegistering; render(); });
    modal.addEventListener("click", event => { if(event.target === modal) close(); });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const credentials = {
            name:document.getElementById("auth-name").value.trim(),
            email:document.getElementById("auth-email").value.trim(),
            password:document.getElementById("auth-password").value
        };
        try{
            await (isRegistering ? authService.register(credentials) : authService.signIn(credentials));
        }catch(error){
            feedback.textContent = error.message === "AUTH_NOT_CONFIGURED"
                ? "El formulario está listo, pero aún falta conectar la base de datos y el servicio de autenticación. No guardamos tu contraseña localmente."
                : "No fue posible completar la solicitud. Inténtalo de nuevo.";
        }
    });
}
