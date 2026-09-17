"use strict";

/* La clave anon no concede privilegios: RLS en schema.sql protege cada fila. */
const syncService = {
    client:null, user:null, timer:null, sessionTimer:null, applyingRemote:false, channel:null,
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
            this.armSessionExpiry();
            document.getElementById("auth-modal")?.classList.remove("active");
            window.setTimeout(() => checkDueLoans?.(), 700);
            if(localStorage.getItem("fintrack_show_welcome") === "1"){
                localStorage.removeItem("fintrack_show_welcome");
                window.setTimeout(showWelcomeTour, 350);
            }
        }
        if(!this.user){
            clearTimeout(this.sessionTimer);
            if(this.channel){ this.client.removeChannel(this.channel); this.channel = null; }
            this.clearPrivateView();
        }
    },
    armSessionExpiry(){
        const started = Number(localStorage.getItem(SESSION_STARTED_KEY)) || Date.now();
        localStorage.setItem(SESSION_STARTED_KEY, String(started));
        clearTimeout(this.sessionTimer);
        const remaining = Math.max(0, 24 * 60 * 60 * 1000 - (Date.now() - started));
        this.sessionTimer = setTimeout(() => this.signOut(), remaining);
    },
    clearPrivateView(){
        clearPrivateData();
        this.refreshInterface();
        const modal = document.getElementById("auth-modal");
        modal?.classList.add("active");
    },
    async signOut(){
        if(this.client) await this.client.auth.signOut();
        this.clearPrivateView();
    },
    async loadRemoteData(){
        const {data:profile, error} = await this.client.from("fintrack_profiles").select("data").eq("user_id", this.user.id).maybeSingle();
        if(error){ console.error("No se pudieron descargar los datos de FinTrack.", error); return; }
        if(profile?.data && Object.keys(profile.data).length) this.applyRemoteData(profile.data);
        else {
            if(this.newAccountPending){
                finTrack = createPrivateData();
                finTrack.usuario.nombre = this.user.user_metadata?.name || "";
                this.newAccountPending = false;
            }
            await this.flush(finTrack);
        }
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
        renderGoal?.(); renderAnalytics?.(); renderCategorySettings?.(); updateVehicleAccess?.();
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
        const menuEmail = document.getElementById("account-menu-email");
        if(text) text.textContent = loggedIn ? `Sesión iniciada como ${this.user.email}. Tus cambios se sincronizan entre dispositivos.` : "Estás usando FinTrack en modo local. Inicia sesión cuando quieras sincronizar tus datos.";
        if(badge) badge.innerHTML = loggedIn ? '<i class="fa-solid fa-cloud"></i> Sincronización activa' : '<i class="fa-solid fa-hard-drive"></i> Modo local activo';
        login?.classList.toggle("hidden", loggedIn); signout?.classList.toggle("hidden", !loggedIn);
        if(avatar) avatar.setAttribute("aria-label", loggedIn ? "Cuenta y sincronización activas" : "Iniciar sesión o registrarse");
        if(menuEmail) menuEmail.textContent = loggedIn ? this.user.email : "Tu cuenta";
        if(!loggedIn) document.getElementById("account-menu")?.classList.add("hidden");
    }
};
window.syncService = syncService;

const authService = {
    async signIn({email, password}){ const {error} = await syncService.client.auth.signInWithPassword({email, password}); if(error) throw error; },
    async register({name, email, password}){
        syncService.newAccountPending = true;
        localStorage.setItem("fintrack_show_welcome", "1");
        const {data, error} = await syncService.client.auth.signUp({email, password, options:{data:{name}}});
        if(error){ syncService.newAccountPending = false; localStorage.removeItem("fintrack_show_welcome"); throw error; }
        return data;
    },
    async resetPassword(email){
        const redirectTo = `${window.location.origin}${window.location.pathname}`;
        const {error} = await syncService.client.auth.resetPasswordForEmail(email, {redirectTo});
        if(error) throw error;
    }
};

function showWelcomeTour(){
    if(document.getElementById("welcome-tour")) return;
    const tour = document.createElement("div");
    tour.id = "welcome-tour";
    tour.className = "welcome-tour";
    tour.innerHTML = `<section><i class="fa-solid fa-sparkles"></i><p>BIENVENIDO A FINTRACK</p><h2>Tu dinero, más claro desde hoy.</h2><div class="welcome-steps"><span><b>1</b> Registra ingresos, gastos, ahorros o préstamos.</span><span><b>2</b> Consulta estadísticas, dinero disponible y lo que te deben.</span><span><b>3</b> Añade objetivos y, si quieres, un vehículo.</span></div><button class="primary-btn" type="button">Comenzar a organizarme <i class="fa-solid fa-arrow-right"></i></button></section>`;
    tour.querySelector("button").addEventListener("click", () => tour.remove());
    document.body.appendChild(tour);
}

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
        if(syncService.user){ document.getElementById("account-menu")?.classList.toggle("hidden"); return; }
        form.reset(); isRegistering = false; isRecovering = false; render(); modal.classList.add("active"); document.getElementById("auth-email").focus();
    });
    document.getElementById("close-auth-modal").addEventListener("click", close);
    document.getElementById("cancel-auth").addEventListener("click", close);
    document.getElementById("account-signout")?.addEventListener("click", () => syncService.signOut());
    document.getElementById("avatar-signout")?.addEventListener("click", () => syncService.signOut());
    document.addEventListener("click", event => {
        if(!event.target.closest("#open-auth-modal") && !event.target.closest("#account-menu")) document.getElementById("account-menu")?.classList.add("hidden");
    });
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
