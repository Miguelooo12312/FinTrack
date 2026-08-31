"use strict";

const themePalette = {
    red: { primary:"#e50914", hover:"#ff2d38", glow:"rgba(229,9,20,.35)" },
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
    const content = JSON.stringify(finTrack, null, 2);
    const blob = new Blob([content], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fintrack-respaldo-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

function importBackup(file){
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try{
            const imported = JSON.parse(reader.result);
            if(!imported || !Array.isArray(imported.movimientos) || !imported.usuario) throw new Error("Formato no válido");
            if(!confirm("Esto reemplazará los datos actuales de FinTrack en este navegador. ¿Deseas continuar?")) return;
            finTrack = migrateData(imported);
            initializeVehicles();
            recalculateFinances();
            saveData(finTrack);
            applyTheme();
            updateHeader(); updateDashboard(); renderHistory(); renderGoal(); renderAnalytics(); renderCategorySettings();
            alert("Respaldo cargado correctamente.");
        }catch(error){
            alert("No pudimos cargar ese archivo. Selecciona un respaldo de FinTrack válido.");
        }
    };
    reader.readAsText(file);
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
    document.getElementById("local-session-info").addEventListener("click", () => alert("Ahora FinTrack funciona en modo local: tus datos quedan en este navegador. Para iniciar sesión desde otros dispositivos se necesita conectar una base de datos y autenticación segura. Ya puedes descargar un respaldo aquí y cargarlo en otro navegador."));
}
