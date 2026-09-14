"use strict";

const themePalette = {
    red: { primary:"#e50914", hover:"#ff2d38", glow:"rgba(229,9,20,.35)" },
    pink: { primary:"#ec4899", hover:"#f472b6", glow:"rgba(236,72,153,.35)" },
    purple: { primary:"#8e44ff", hover:"#ab76ff", glow:"rgba(142,68,255,.35)" },
    blue: { primary:"#257cff", hover:"#5ea2ff", glow:"rgba(37,124,255,.35)" }
};

function applyTheme(theme = finTrack.configuracion.tema || "red"){
    const palette = themePalette[theme] || themePalette.red;
    document.documentElement.style.setProperty("--primary", palette.primary);
    document.documentElement.style.setProperty("--primary-hover", palette.hover);
    document.documentElement.style.setProperty("--theme-glow", palette.glow);
    document.documentElement.dataset.theme = theme;
    document.querySelectorAll(".theme-option").forEach(button => button.classList.toggle("active", button.dataset.theme === theme));
}

function deleteCustomCategory(type, category){
    finTrack.categorias[type] = finTrack.categorias[type].filter(item => item !== category);
    saveData(finTrack);
    renderCategorySettings();
}

function renderCategorySettings(){
    const containers = { ingresos:document.getElementById("income-category-tags"), gastos:document.getElementById("expense-category-tags") };
    Object.entries(containers).forEach(([type, container]) => {
        if(!container) return;
        container.innerHTML = "";
        (finTrack.categorias[type] || []).forEach(category => {
            const tag = document.createElement("span");
            tag.className = "category-tag";
            tag.innerHTML = `${category}<button type="button" aria-label="Eliminar ${category}"><i class="fa-solid fa-xmark"></i></button>`;
            tag.querySelector("button").addEventListener("click", () => deleteCustomCategory(type, category));
            container.appendChild(tag);
        });
    });
}

function downloadBackup(){
    const backup = {
        app:"FinTrack",
        version:1,
        exportedAt:new Date().toISOString(),
        data:finTrack
    };
    const content = JSON.stringify(backup, null, 2);
    const blob = new Blob([content], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fintrack-respaldo-${new Date().toISOString().slice(0,10)}.json`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    const status = document.getElementById("backup-status");
    if(status) status.textContent = `Respaldo preparado: ${link.download}. Revisa la carpeta de descargas de tu navegador.`;
}

function importBackup(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
        try{
            const parsed = JSON.parse(reader.result);
            const imported = parsed && parsed.app === "FinTrack" && parsed.data ? parsed.data : parsed;
            if(!imported || !Array.isArray(imported.movimientos) || !imported.usuario) throw new Error("Formato no válido");
            if(!syncService.user) throw new Error("Inicia sesión antes de migrar tus datos a tu cuenta.");
            if(!confirm("Se integrarán los movimientos y objetivos de este respaldo a tu cuenta. No se borrarán los datos que ya tienes en FinTrack. ¿Continuar?")) return;
            finTrack = mergeImportedData(finTrack, migrateData(imported));
            initializeVehicles();
            recalculateFinances();
            saveData(finTrack);
            await syncService.uploadNow(finTrack);
            applyTheme();
            updateHeader(); updateDashboard(); renderHistory(); renderGoal(); renderAnalytics(); renderCategorySettings();
            const status = document.getElementById("backup-status");
            if(status) status.textContent = "Datos anteriores migrados y sincronizados con tu cuenta.";
            alert("Tus datos anteriores ya fueron migrados a tu cuenta.");
        }catch(error){
            const status = document.getElementById("backup-status");
            if(status) status.textContent = error.message || "No se pudo migrar el archivo. Selecciona un respaldo válido de FinTrack.";
            alert(error.message || "No pudimos cargar ese archivo. Selecciona un respaldo de FinTrack válido.");
        }finally{
            const input = document.getElementById("import-data");
            if(input) input.value = "";
        }
    };
    reader.readAsText(file);
}

function movementFingerprint(movement){
    return [movement.tipo, movement.fecha, movement.monto, movement.categoria, movement.descripcion || ""].join("|");
}

function mergeImportedData(current, imported){
    const merged = migrateData(structuredClone(current));
    const known = new Set((merged.movimientos || []).map(movementFingerprint));
    (imported.movimientos || []).forEach(movement => {
        const fingerprint = movementFingerprint(movement);
        if(!known.has(fingerprint)){
            const copy = structuredClone(movement);
            if(merged.movimientos.some(item => String(item.id) === String(copy.id))) copy.id = `${copy.id}-${crypto.randomUUID()}`;
            merged.movimientos.push(copy); known.add(fingerprint);
        }
    });
    const goalKeys = new Set((merged.objetivos || []).map(goal => `${goal.nombre}|${goal.objetivo}`));
    (imported.objetivos || []).forEach(goal => {
        const key = `${goal.nombre}|${goal.objetivo}`;
        if(!goalKeys.has(key)){ merged.objetivos.push(structuredClone(goal)); goalKeys.add(key); }
    });
    return merged;
}

function initSettings(){
    const name = document.getElementById("settings-name");
    if(!name) return;
    name.value = finTrack.usuario.nombre || "";
    applyTheme();
    renderCategorySettings();
    document.getElementById("save-profile").addEventListener("click", () => {
        const value = name.value.trim();
        if(!value) return alert("Escribe el nombre con el que quieres que te llame FinTrack.");
        finTrack.usuario.nombre = value;
        saveData(finTrack);
        updateHeader();
        alert("Perfil actualizado.");
    });
    document.querySelectorAll(".theme-option").forEach(button => button.addEventListener("click", () => {
        finTrack.configuracion.tema = button.dataset.theme;
        saveData(finTrack);
        applyTheme();
    }));
    document.querySelectorAll(".category-add-form").forEach(form => form.addEventListener("submit", event => {
        event.preventDefault();
        const input = form.querySelector("input");
        const category = input.value.trim();
        const type = form.dataset.categoryType;
        if(!category) return;
        const list = finTrack.categorias[type] ||= [];
        if(list.some(item => item.toLowerCase() === category.toLowerCase())) return alert("Esa categoría ya existe.");
        list.push(category);
        input.value = "";
        saveData(finTrack);
        renderCategorySettings();
    }));
    document.getElementById("export-data").addEventListener("click", downloadBackup);
    document.getElementById("import-data").addEventListener("change", event => importBackup(event.target.files[0]));
    document.getElementById("local-session-info").addEventListener("click", () => {
        document.getElementById("open-auth-modal").click();
    });
}
