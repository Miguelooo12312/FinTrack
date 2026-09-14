"use strict";

/* La clave anon no concede privilegios: RLS en schema.sql protege cada fila. */
const syncService = {
    client:null, user:null, timer:null, applyingRemote:false, channel:null,
    get configured(){ return Boolean(window.FINTRACK_SUPABASE_URL && window.FINTRACK_SUPABASE_ANON_KEY && window.supabase); },
    async initialize(){
        // El login es la primera pantalla. La app solo se revela al terminar
        // de comprobar una sesión existente para evitar un parpadeo del panel.
        document.body.classList.add("auth-loading");
        document.getElementById("auth-modal")?.classList.add("active");
        if(!this.configured){ this.renderAccount(); document.body.classList.remove("auth-loading"); return; }
        this.client = window.supabase.createClient(window.FINTRACK_SUPABASE_URL, window.FINTRACK_SUPABASE_ANON_KEY, { auth:{persistSession:true, autoRefreshToken:true} });
        const {data:{session}} = await this.client.auth.getSession();
        await this.setSession(session);
        document.body.classList.remove("auth-loading");
        this.client.auth.onAuthStateChange(async (event, session) => {
            await this.setSession(session);
            if(event === "PASSWORD_RECOVERY") document.dispatchEvent(new Event("fintrack-password-recovery"));
        });
    },
    async setSession(session){
        const previous = this.user?.id;
        this.user = session?.user || null;
        this.renderAccount();
        if(this.user && previous !== this.user.id){
            await this.loadRemoteData(); this.subscribe();
            document.getElementById("auth-modal")?.classList.remove("active");
        }
        if(!this.user && this.channel){ this.client.removeChannel(this.channel); this.channel = null; }
    },
    async loadRemoteData(){
        const {data:profile, error} = await this.client.from("fintrack_profiles").select("data").eq("user_id", this.user.id).maybeSingle();
        if(error){ console.error("No se pudieron descargar los datos de FinTrack.", error); return; }
        if(profile?.data && Object.keys(profile.data).length) this.applyRemoteData(profile.data);
        else await this.flush(finTrack); // Primera sesión: sube los datos locales existentes.
    },
    applyRemoteData(remoteData){
        this.applyingRemote = true;
        try{
            finTrack = migrateData(remoteData);
            initializeVehicles();
            recalculateFinances();
            this.refreshInterface();
        }finally{ this.applyingRemote = false; }
    },
    refreshInterface(){
        applyTheme?.(); updateHeader?.(); updateDashboard?.(); renderHistory?.();
        renderGoal?.(); renderAnalytics?.(); renderCategorySettings?.();
    },
    scheduleSave(data){
        if(!this.user || this.applyingRemote) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.flush(data), 700);
    },
    async flush(data){
        if(!this.user || !this.client || this.applyingRemote) return;
        const {error} = await this.client.from("fintrack_profiles").upsert({ user_id:this.user.id, data, updated_at:new Date().toISOString() }, {onConflict:"user_id"});
        if(error) console.error("No se pudieron sincronizar los datos de FinTrack.", error);
    },
    async uploadNow(data = finTrack){
        if(!this.user) throw new Error("Inicia sesión antes de migrar tus datos.");
        await this.flush(data);
    },
    subscribe(){
        if(this.channel) this.client.removeChannel(this.channel);
        const userId = this.user.id;
        this.channel = this.client.channel(`fintrack-profile-${userId}`).on(
            "postgres_changes",
            {event:"UPDATE", schema:"public", table:"fintrack_profiles", filter:`user_id=eq.${userId}`},
            payload => { if(payload.new?.data) this.applyRemoteData(payload.new.data); }
        ).subscribe();
    },
    renderAccount(){
        const loggedIn = Boolean(this.user);
        const text = document.getElementById("account-status-text");
        const badge = document.getElementById("account-mode-badge");
        const login = document.getElementById("local-session-info");
        const signout = document.getElementById("account-signout");
        const avatar = document.getElementById("open-auth-modal");
        if(text) text.textContent = loggedIn ? `Sesión iniciada como ${this.user.email}. Tus cambios se sincronizan entre dispositivos.` : "Estás usando FinTrack en modo local. Inicia sesión cuando quieras sincronizar tus datos.";
        if(badge) badge.innerHTML = loggedIn ? '<i class="fa-solid fa-cloud"></i> Sincronización activa' : '<i class="fa-solid fa-hard-drive"></i> Modo local activo';
        login?.classList.toggle("hidden", loggedIn); signout?.classList.toggle("hidden", !loggedIn);
        if(avatar) avatar.setAttribute("aria-label", loggedIn ? "Cuenta y sincronización activas" : "Iniciar sesión o registrarse");
    }
};
window.syncService = syncService;

const authService = {
    async signIn({email, password}){ const {error} = await syncService.client.auth.signInWithPassword({email, password}); if(error) throw error; },
    async register({name, email, password}){
        const {data, error} = await syncService.client.auth.signUp({email, password, options:{data:{name}}});
        if(error) throw error;
        return data;
    },
    async resetPassword(email){
        const redirectTo = `${window.location.origin}${window.location.pathname}`;
        const {error} = await syncService.client.auth.resetPasswordForEmail(email, {redirectTo});
        if(error) throw error;
    }
};

function initAuthModal(){
    const modal = document.getElementById("auth-modal"), form = document.getElementById("auth-form");
    const nameGroup = document.getElementById("auth-name-group"), title = document.getElementById("auth-title");
    const description = document.getElementById("auth-description"), submit = document.getElementById("submit-auth");
    const toggle = document.getElementById("toggle-auth-mode"), reset = document.getElementById("request-password-reset");
    const feedback = document.getElementById("auth-feedback");
    let isRegistering = false, isRecovering = false;
    const close = () => modal.classList.remove("active");
    const render = () => {
        title.textContent = isRecovering ? "Nueva contraseña" : (isRegistering ? "Crear cuenta" : "Iniciar sesión");
        description.textContent = isRecovering ? "Elige una contraseña nueva para proteger tu cuenta." : (isRegistering ? "Crea una cuenta para conservar tus datos seguros y sincronizados." : "Accede a tus datos desde cualquier dispositivo.");
        submit.textContent = isRecovering ? "Guardar contraseña" : (isRegistering ? "Crear cuenta" : "Iniciar sesión");
        toggle.textContent = isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate";
        nameGroup.classList.toggle("hidden", !isRegistering);
        toggle.classList.toggle("hidden", isRecovering); reset.classList.toggle("hidden", isRegistering || isRecovering);
        document.getElementById("auth-name").required = isRegistering;
        document.getElementById("auth-password").autocomplete = isRegistering || isRecovering ? "new-password" : "current-password";
        const email = document.getElementById("auth-email");
        email.closest(".form-group").classList.toggle("hidden", isRecovering);
        email.disabled = isRecovering;
        feedback.textContent = "";
    };
    document.getElementById("open-auth-modal").addEventListener("click", () => {
        if(syncService.user) return;
        form.reset(); isRegistering = false; isRecovering = false; render(); modal.classList.add("active"); document.getElementById("auth-email").focus();
    });
    document.getElementById("close-auth-modal").addEventListener("click", close);
    document.getElementById("cancel-auth").addEventListener("click", close);
    document.getElementById("account-signout")?.addEventListener("click", () => syncService.client?.auth.signOut());
    toggle.addEventListener("click", () => { isRegistering = !isRegistering; render(); });
    document.addEventListener("fintrack-password-recovery", () => {
        isRecovering = true; isRegistering = false; form.reset(); render(); modal.classList.add("active");
        document.getElementById("auth-password").focus();
    });
    modal.addEventListener("click", event => { if(event.target === modal) close(); });
    reset.addEventListener("click", async () => {
        const email = document.getElementById("auth-email").value.trim();
        if(!email) return feedback.textContent = "Escribe tu correo para recibir el enlace de recuperación.";
        try{ await authService.resetPassword(email); feedback.textContent = "Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña."; }
        catch(_error){ feedback.textContent = "No se pudo solicitar la recuperación. Inténtalo de nuevo."; }
    });
    form.addEventListener("submit", async event => {
        event.preventDefault();
        if(!syncService.configured) return feedback.textContent = "Falta configurar Supabase. Consulta README-SUPABASE.md.";
        const credentials = {name:document.getElementById("auth-name").value.trim(), email:document.getElementById("auth-email").value.trim(), password:document.getElementById("auth-password").value};
        submit.disabled = true;
        try{
            if(isRecovering){
                const {error} = await syncService.client.auth.updateUser({password:credentials.password});
                if(error) throw error;
                feedback.textContent = "Contraseña actualizada. Ya puedes usar tu cuenta.";
                isRecovering = false; window.setTimeout(close, 900); return;
            }
            const result = isRegistering ? await authService.register(credentials) : await authService.signIn(credentials);
            if(isRegistering && !result.session) feedback.textContent = "Revisa tu correo y confirma la cuenta antes de iniciar sesión.";
            else close();
        }catch(error){ feedback.textContent = error.message || "No fue posible completar la solicitud. Inténtalo de nuevo."; }
        finally{ submit.disabled = false; }
    });
    syncService.initialize().catch(error => console.error("No se pudo iniciar la sincronización.", error));
}
