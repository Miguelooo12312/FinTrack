/*======================================================
    MOTO.JS
    FinTrack v1.0
======================================================*/

"use strict";

let editingMaintenanceId = null;

let newVehiclePhoto = null;

/*======================================================
    CATÁLOGO DE MANTENIMIENTOS
======================================================*/

const maintenanceTypes={

    aceite:{

        nombre:"Cambio de aceite",

        icono:"🛢",

        color:"green"

    },

    pastillas:{

        nombre:"Cambio de pastillas",

        icono:"🛑",

        color:"yellow"

    },

    kit:{

        nombre:"Kit de arrastre",

        icono:"⚙",

        color:"blue"

    },

    llantas:{

        nombre:"Cambio de llantas",

        icono:"🛞",

        color:"orange"

    },

    bateria:{

        nombre:"Cambio de batería",

        icono:"🔋",

        color:"purple"

    },

    soat:{

        nombre:"SOAT",

        icono:"📄",

        color:"red"

    },

    tecnomecanica:{

        nombre:"Tecnomecánica",

        icono:"🔧",

        color:"cyan"

    },

    otro:{

        nombre:"Otro mantenimiento",

        icono:"🧰",

        color:"gray"

    }

};

/*======================================================
    UTILIDADES MANTENIMIENTO
======================================================*/

function getMaintenanceName(tipo){

    return maintenanceTypes[tipo]?.nombre

        || maintenanceTypes.otro.nombre;

}

function getMaintenanceIcon(tipo){

    return maintenanceTypes[tipo]?.icono

        || maintenanceTypes.otro.icono;

}

function getMaintenanceColor(tipo){

    return maintenanceTypes[tipo]?.color

        || maintenanceTypes.otro.color;

}

/*======================================================
    RENDER GENERAL
======================================================*/

function renderMoto(){

    if(!(finTrack.vehiculos || []).length){
        const hero = document.getElementById("moto-hero");
        if(hero) hero.innerHTML = `<section class="vehicle-empty"><i class="fa-solid fa-car-side"></i><h2>Agrega tu vehículo</h2><p>Configura un vehículo para recibir recordatorios, historial y análisis de mantenimiento.</p><button class="primary-btn" onclick="openAddVehicleModal()"><i class="fa-solid fa-plus"></i> Agregar vehículo</button></section>`;
        ["moto-reminders","moto-stats","moto-history"].forEach(id => { const element=document.getElementById(id); if(element) element.innerHTML=""; });
        return;
    }

    renderMotoHero();

    renderMotoReminders();

    renderMotoStats();

    renderMotoHistory();

}

/*======================================================
    HERO
======================================================*/

function renderMotoHero(){

    const hero =
        document.getElementById("moto-hero");

    if(!hero) return;


    hero.innerHTML = `

<section class="moto-hero">


    <!--========================================
        SELECTOR DE VEHÍCULO
    ========================================-->

    <div class="vehicle-selector">

    <button
        type="button"
        onclick="toggleVehicleSelector()"
        class="vehicle-selector-button"
    >

        <span>

            ${
                finTrack.moto.tipo === "moto"
                    ? "🏍️"
                    : "🚗"
            }

        </span>

        <span>

            ${finTrack.moto.marca}
            ${finTrack.moto.modelo}

        </span>

        <i class="fa-solid fa-chevron-down"></i>

    </button>


    <div class="vehicle-selector-menu">

        <div class="vehicle-selector-current">

            <small>
                Vehículo actual
            </small>

            <strong>

                ${finTrack.moto.marca}
                ${finTrack.moto.modelo}

            </strong>

        </div>


        <div class="vehicle-selector-list">

            ${(finTrack.vehiculos || [])
                .map(vehicle => `

                    <div class="vehicle-option-row">
                        <button
                            type="button"
                            class="vehicle-option ${
                                vehicle.id === finTrack.activeVehicleId
                                    ? "active"
                                    : ""
                            }"
                            onclick="selectVehicle('${vehicle.id}')"
                        >

                            <span>
                                ${vehicle.tipo === "moto" ? "🏍️" : "🚗"}
                            </span>

                            <span>
                                ${vehicle.marca} ${vehicle.modelo}
                            </span>

                        </button>

                        <button
                            type="button"
                            class="delete-vehicle-button"
                            onclick="deleteVehicle('${vehicle.id}')"
                            ${
                                finTrack.vehiculos.length === 1
                                    ? "disabled title=\"Debes conservar al menos un vehículo\""
                                    : "title=\"Eliminar vehículo\""
                            }
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>

                `)
                .join("")}

        </div>


        <button
            type="button"
            class="add-vehicle-button"
            onclick="openAddVehicleModal()"
        >

            <i class="fa-solid fa-plus"></i>

            Agregar vehículo

        </button>

    </div>

</div>


    <!--========================================
        FOTO DEL VEHÍCULO
    ========================================-->

    <div class="moto-hero-main">

    <div class="moto-hero-image">

        ${
            finTrack.moto.foto
                ? `
                    <img
                        src="${finTrack.moto.foto}"
                        alt="${finTrack.moto.marca} ${finTrack.moto.modelo}"
                    >
                `
                : `
                    <button
                        type="button"
                        class="vehicle-image-placeholder"
                        onclick="openVehiclePhotoPicker()"
                    >
                        <i class="fa-solid ${
                            finTrack.moto.tipo === "moto"
                                ? "fa-motorcycle"
                                : "fa-car-side"
                        }"></i>
                        <span>Subir foto del vehículo</span>
                    </button>
                `
        }

    </div>


    <!--========================================
        INFORMACIÓN DEL VEHÍCULO
    ========================================-->

    <div class="moto-hero-info">

        <span class="moto-brand">

            ${finTrack.moto.marca}

        </span>


        <h1>

            ${finTrack.moto.modelo}

        </h1>


        <p class="moto-last-service">

            ${
                finTrack.moto.tipo === "moto"
                    ? "🏍️ Moto"
                    : "🚗 Carro"
            }

        </p>

    </div>


    </div>

    <button
        type="button"
        class="vehicle-photo-upload"
        onclick="openVehiclePhotoPicker()"
    >
        <i class="fa-solid fa-image"></i>
        Cambiar foto
    </button>


    <!--========================================
        TARJETAS DEL HERO
    ========================================-->

        <div class="moto-hero-cards">

         <article
    class="moto-info-card editable"
    onclick="openMileageModal()">

    <small>

        Kilometraje

    </small>

    <strong>

        ${finTrack.moto.kilometraje.toLocaleString("es-CO")} km

    </strong>

</article>

           <strong class="status-good">

    

</strong>
        </div>

</section>

`;

}

/*======================================================
    SELECTOR DE VEHÍCULOS
======================================================*/

function toggleVehicleSelector(){

    const selector =
        document.querySelector(
            ".vehicle-selector"
        );

    if(!selector) return;

    selector.classList.toggle("active");

}

/*======================================================
    SELECCIONAR VEHÍCULO
======================================================*/

function selectVehicle(id){

    const vehicle =
        finTrack.vehiculos.find(
            item => item.id === id
        );


    if(!vehicle){

        console.warn(
            "Vehículo no encontrado:",
            id
        );

        return;

    }


    finTrack.activeVehicleId =
        vehicle.id;


    /*
        Por ahora mantenemos compatibilidad
        con todo el módulo actual.
    */

    finTrack.moto = vehicle;


    /*----------------------------------------
        CERRAR SELECTOR
    ----------------------------------------*/

    const selector =
        document.querySelector(
            ".vehicle-selector"
        );

    if(selector){

        selector.classList.remove("active");

    }


    /*----------------------------------------
        ACTUALIZAR VISTA
    ----------------------------------------*/

    renderMotoHero();

    updateMotoData();

}

function deleteVehicle(id){

    const vehicle = finTrack.vehiculos.find(item => item.id === id);

    if(!vehicle) return;

    const shouldDelete = confirm(
        `¿Eliminar ${vehicle.marca} ${vehicle.modelo}? Esta acción no se puede deshacer.`
    );

    if(!shouldDelete) return;

    finTrack.vehiculos = finTrack.vehiculos.filter(
        item => item.id !== id
    );

    if(finTrack.activeVehicleId === id){

        const nextVehicle = finTrack.vehiculos[0];

        finTrack.activeVehicleId = nextVehicle?.id || null;
        finTrack.moto = nextVehicle || null;

    }

    saveData(finTrack);
    renderMoto();
    updateVehicleAccess?.();

}

/*======================================================
    AGREGAR VEHÍCULO
======================================================*/

function getNewVehicleReminders(kilometraje){

    return {
        aceite:{ ultimoCambioKm:kilometraje, proximoCambioKm:kilometraje + 2000, fecha:null, observaciones:"" },
        pastillas:{ ultimoCambioKm:kilometraje, proximoCambioKm:kilometraje + 8000, fecha:null, observaciones:"" },
        kit:{ ultimoCambioKm:kilometraje, proximoCambioKm:kilometraje + 18000, fecha:null, observaciones:"" },
        bateria:{ ultimoCambioKm:0, proximoCambioKm:0, fecha:null, observaciones:"" },
        llantas:{ ultimoCambioKm:0, proximoCambioKm:0, fecha:null, observaciones:"" },
        otro:{ ultimoCambioKm:0, proximoCambioKm:0, fecha:null, observaciones:"" },
        soat:{ vence:"" },
        tecnomecanica:{ vence:"" }
    };

}

function readVehiclePhoto(file, onLoad){

    if(!file) return;

    if(!file.type.startsWith("image/")){

        alert("Selecciona una imagen PNG o JPG.");

        return;

    }

    if(file.size > 3 * 1024 * 1024){

        alert("La imagen debe pesar menos de 3 MB.");

        return;

    }

    const reader = new FileReader();

    reader.addEventListener("load", () => onLoad(reader.result));

    reader.readAsDataURL(file);

}

function handleNewVehiclePhoto(event){

    const file = event.target.files[0];

    readVehiclePhoto(file, photo => {

        newVehiclePhoto = photo;

        const helper = document.getElementById("new-vehicle-photo-help");

        if(helper){
            helper.textContent = "Foto lista para guardar.";
        }

    });

}

function openVehiclePhotoPicker(){

    const input = document.createElement("input");

    input.type = "file";
    input.accept = "image/png,image/jpeg";

    input.addEventListener("change", () => {

        readVehiclePhoto(input.files[0], photo => {

            finTrack.moto.foto = photo;
            saveData(finTrack);
            renderMoto();

        });

    });

    input.click();

}

function ensureAddVehicleModal(){

    let modal = document.getElementById("add-vehicle-modal");

    if(modal) return modal;

    modal = document.createElement("div");
    modal.id = "add-vehicle-modal";
    modal.className = "modal";

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fa-solid fa-car-side"></i> Agregar vehículo</h2>
                <button type="button" class="modal-close" onclick="closeAddVehicleModal()">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <form onsubmit="saveNewVehicle(event)">
                <div class="modal-body">
                    <div class="form-group">
                        <label for="new-vehicle-type">Tipo</label>
                        <select id="new-vehicle-type" required>
                            <option value="moto">Moto</option>
                            <option value="carro">Carro</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="new-vehicle-brand">Marca</label>
                        <input id="new-vehicle-brand" type="text" autocomplete="off" required>
                    </div>

                    <div class="form-group">
                        <label for="new-vehicle-model">Modelo</label>
                        <input id="new-vehicle-model" type="text" autocomplete="off" required>
                    </div>

                    <div class="form-group">
                        <label for="new-vehicle-year">Año</label>
                        <input id="new-vehicle-year" type="number" min="1900" max="2100">
                    </div>

                    <div class="form-group">
                        <label for="new-vehicle-mileage">Kilometraje actual</label>
                        <input id="new-vehicle-mileage" type="number" min="0" value="0" required>
                    </div>

                    <div class="form-group">
                        <label for="new-vehicle-photo">Foto del vehículo</label>
                        <input
                            id="new-vehicle-photo"
                            type="file"
                            accept="image/png,image/jpeg"
                            onchange="handleNewVehiclePhoto(event)"
                        >
                        <small id="new-vehicle-photo-help">
                            Sube una imagen PNG para una mejor experiencia visual.
                        </small>
                    </div>
                </div>

                <div class="modal-actions">
                    <button type="button" class="secondary-btn" onclick="closeAddVehicleModal()">Cancelar</button>
                    <button type="submit" class="primary-btn">Agregar vehículo</button>
                </div>
            </form>
        </div>
    `;

    modal.addEventListener("click", event => {

        if(event.target === modal){
            closeAddVehicleModal();
        }

    });

    document.body.appendChild(modal);

    return modal;

}

function openAddVehicleModal(){

    const selector = document.querySelector(".vehicle-selector");

    if(selector){
        selector.classList.remove("active");
    }

    newVehiclePhoto = null;

    const modal = ensureAddVehicleModal();
    const form = modal.querySelector("form");
    const helper = modal.querySelector("#new-vehicle-photo-help");

    form.reset();

    if(helper){
        helper.textContent =
            "Sube una imagen PNG para una mejor experiencia visual.";
    }

    modal.classList.add("active");

}

function closeAddVehicleModal(){

    const modal = document.getElementById("add-vehicle-modal");

    if(modal){
        modal.classList.remove("active");
    }

}

function saveNewVehicle(event){

    event.preventDefault();

    const marca = document.getElementById("new-vehicle-brand").value.trim();
    const modelo = document.getElementById("new-vehicle-model").value.trim();
    const tipo = document.getElementById("new-vehicle-type").value;
    const año = Number(document.getElementById("new-vehicle-year").value) || null;
    const kilometraje = Number(document.getElementById("new-vehicle-mileage").value);

    if(!marca || !modelo || kilometraje < 0) return;

    const vehicle = {
        id: crypto.randomUUID(),
        marca,
        modelo,
        tipo,
        año,
        kilometraje,
        estadoIA:"",
        foto:newVehiclePhoto,
        recordatorios:getNewVehicleReminders(kilometraje),
        historial:[]
    };

    finTrack.vehiculos.push(vehicle);
    finTrack.activeVehicleId = vehicle.id;
    finTrack.moto = vehicle;

    saveData(finTrack);
    closeAddVehicleModal();
    renderMoto();
    updateVehicleAccess?.();

}

/*======================================================
    CONFIGURACIÓN RECORDATORIOS
======================================================*/

const motoReminders = [

    {
        type:"aceite",
        icon:"🛢",
        title:"Aceite"
    },

    {
        type:"pastillas",
        icon:"🛑",
        title:"Pastillas"
    },

    {
        type:"kit",
        icon:"⚙",
        title:"Kit de arrastre"
    },

    {
        type:"soat",
        icon:"📄",
        title:"SOAT"
    },

    {
        type:"tecnomecanica",
        icon:"🔧",
        title:"Tecnomecánica"
    }

];


function renderMotoReminders(){

    const container = document.getElementById("moto-reminders");

    if(!container) return;

    let cards = "";

    motoReminders.forEach(item=>{

        let status;
        let value;

if(item.type==="soat"){

    status = calculateDateStatus(

        finTrack.moto.recordatorios.soat.vence

    );

    value = getReminderValue("soat");

}

else if(item.type==="tecnomecanica"){

    status = calculateDateStatus(

        finTrack.moto.recordatorios.tecnomecanica.vence

    );

    value = getReminderValue("tecnomecanica");

}

        else{

            status=calculateReminderStatus(

                getRemainingKm(item.type)

            );

            value=getReminderValue(item.type);

        }

        cards += createReminderCard({

            icon:item.icon,

            title:item.title,

            status,

            value,

            type:item.type

        });

    });

    container.innerHTML = `

        <h2 class="moto-section-title">

            Próximos mantenimientos

        </h2>

        <div class="moto-reminders-grid">

            ${cards}

        </div>

    `;

}

function createReminderCard({

    icon,
    title,
    status,
    value,
    type

}){

    const labels={

        green:"En buen estado",

        yellow:"Próximo mantenimiento",

        red:"Requiere atención"

    };

    return `

    <article
    class="moto-reminder-card ${status}"
    ${(
        type === "soat" ||
        type === "tecnomecanica"
    )
        ? `onclick="openDocumentDateModal('${type}')"`
        : ""
    }
>

        <div class="moto-reminder-top">

            <div class="moto-reminder-icon">

                ${icon}

            </div>

        </div>

        <div class="moto-reminder-body">

            <h3>

                ${title}

            </h3>

            <strong>

                ${value}

            </strong>

        </div>

        <div class="moto-reminder-footer">

            <span class="status-dot ${status}"></span>

            <small>

                ${labels[status]}

            </small>

        </div>

    </article>

    `;

}

/*======================================================
    CALCULAR ESTADO DEL RECORDATORIO
======================================================*/

function calculateReminderStatus(restante){

    if(restante <= 0){

        return "red";

    }

    if(restante <= 500){

        return "yellow";

    }

    return "green";

}

/*======================================================
    CALCULAR ESTADO POR FECHA
======================================================*/

function calculateDateStatus(fecha){

    if(!fecha){

        return "yellow";

    }

    const hoy = new Date();

    const vencimiento = new Date(fecha);

    const diferencia = Math.ceil(

        (vencimiento - hoy) / (1000 * 60 * 60 * 24)

    );

    if(diferencia <= 30){

        return "red";

    }

    if(diferencia <= 90){

        return "yellow";

    }

    return "green";

}

/*======================================================
    OBTENER KM RESTANTES
======================================================*/

function getRemainingKm(tipo){

    const actual = finTrack.moto.kilometraje;

    const proximo =

        finTrack.moto.recordatorios[tipo].proximoCambioKm;

    return proximo - actual;

}

/*======================================================
    TEXTO DEL RECORDATORIO
======================================================*/

function getReminderValue(tipo){

    if(tipo==="soat" || tipo==="tecnomecanica"){

        const fecha = finTrack.moto.recordatorios[tipo].vence;

        if(!fecha){

            return "Configurar fecha";

        }

        const hoy = new Date();

        const vence = new Date(fecha);

        const dias = Math.ceil(

            (vence-hoy)/(1000*60*60*24)

        );

        if(dias<=0){

            return "Vencido";

        }

        if(dias===1){

            return "1 día";

        }

        if(dias<30){

            return `${dias} días`;

        }

        const meses=Math.floor(dias/30);

        return `${meses} meses`;

    }

    return `${getRemainingKm(tipo).toLocaleString("es-CO")} km`;

}


/*======================================================
    ESTADÍSTICAS
======================================================*/

function renderMotoStats(){

    const stats = getMotoStats();

    const container = document.getElementById("moto-stats");

    if(!container) return;

    container.innerHTML = `

        <h2 class="moto-section-title">

            Estadísticas

        </h2>

        <div class="moto-stats-grid">

            ${createStatCard({

                icon:"🛠",

                value:stats.total,

                title:"Mantenimientos"

            })}

            ${createStatCard({

                icon:"🔧",

                value:stats.ultimo
                    ? stats.ultimo.nombre
                    : "Sin registros",

                title:"Último"

            })}

            ${createStatCard({

                icon:"🛣",

                value:`${getKmSinceOil().toLocaleString("es-CO")} km`,

                title:"Desde aceite"

            })}

            ${createStatCard({

                icon:"⏭",
            
                value:stats.proximo
            
                    ? `${maintenanceCatalog[stats.proximo.tipo].nombre} · ${stats.proximo.restante.toLocaleString("es-CO")} km`
            
                    : "Sin programar",
            
                title:"Próximo"
            
            })}

        </div>

    `;

}

/*======================================================
    TARJETA ESTADÍSTICA
======================================================*/

function createStatCard({

    icon,

    value,

    title

}){

    return `

    <article class="moto-stat-card">

        <div class="moto-stat-icon">

            ${icon}

        </div>

        <strong>

            ${value}

        </strong>

        <small>

            ${title}

        </small>

    </article>

    `;

}

/*======================================================
    OBTENER ESTADÍSTICAS
======================================================*/

function getTotalMoto(){

    return finTrack.moto.historial.length;

}

function getAverageMoto(){

    if(!finTrack.moto.historial.length){

        return 0;

    }

    return Math.round(

        getTotalMoto()/

        finTrack.moto.historial.length

    );

}

function getLastMaintenance(){

    if(!finTrack.moto.historial.length){

        return "Sin registros";

    }

    return finTrack.moto.historial[0].tipo;

}

function getKmSinceOil(){

    const aceite=

        finTrack.moto.recordatorios.aceite;

    return Math.max(

        0,

        finTrack.moto.kilometraje-

        aceite.ultimoCambioKm

    );

}

/*======================================================
    MOTOR DE ESTADÍSTICAS
======================================================*/

function getMotoStats(){

    const historial =
        finTrack.moto.historial || [];


    /*========================================
        TOTAL DE MANTENIMIENTOS
    ========================================*/

    const total =
        historial.length;


    /*========================================
        ÚLTIMO MANTENIMIENTO
    ========================================*/

    const ultimo =
        historial.length

            ? [...historial].sort(

                (a,b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)

            )[0]

            : null;


    /*========================================
        PRÓXIMO MANTENIMIENTO
    ========================================*/

    const tiposKm = [

        "aceite",
        "pastillas",
        "kit"

    ];


    let proximo = null;


    tiposKm.forEach(tipo => {

        const recordatorio =
            finTrack.moto.recordatorios[tipo];


        if(!recordatorio) return;


        const restante =
            recordatorio.proximoCambioKm -
            finTrack.moto.kilometraje;


        if(restante <= 0) return;


        if(
            !proximo ||
            restante < proximo.restante
        ){

            proximo = {

                tipo,

                restante

            };

        }

    });


    return {

        total,

        ultimo,

        proximo

    };

}

/*======================================================
    HISTORIAL
======================================================*/


function renderMotoHistory(){

    const container=document.getElementById("moto-history");

    if(!container) return;

    container.innerHTML=`

    <section class="moto-history">

        <div class="history-header">

            <div>

                <h2 class="moto-section-title">

                    Historial de mantenimiento

                </h2>

                <p>

                    Consulta todos los mantenimientos realizados.

                </p>

            </div>

        </div>

        <div class="history-toolbar">

            <input

                id="moto-search"

                type="text"

                placeholder="Buscar mantenimiento...">

            <select id="moto-filter">

                <option value="todos">

                    Todos

                </option>

                <option value="aceite">

                    Aceite

                </option>

                <option value="pastillas">

                    Pastillas

                </option>

                <option value="kit">

                    Kit

                </option>

                <option value="llantas">

                    Llantas

                </option>

                <option value="bateria">

                    Batería

                </option>

                <option value="soat">

                    SOAT

                </option>

                <option value="tecnomecanica">

                    Tecnomecánica

                </option>

            </select>

        </div>

        <div id="moto-history-list">

        </div>

    </section>

    `;

    renderMotoHistoryList();

    const searchInput =
    document.getElementById("moto-search");

const filterSelect =
    document.getElementById("moto-filter");


if(searchInput){

    searchInput.addEventListener(
        "input",
        renderMotoHistoryList
    );

}


if(filterSelect){

    filterSelect.addEventListener(
        "change",
        renderMotoHistoryList
    );

}

    initMotoHistoryControls();

}

/*======================================================
    LISTA HISTORIAL
======================================================*/

function renderMotoHistoryList(){

    const list =
        document.getElementById(
            "moto-history-list"
        );

    if(!list) return;


    const historial =
        finTrack.moto.historial || [];


    /*========================================
        CONTROLES
    ========================================*/

    const searchInput =
        document.getElementById(
            "moto-search"
        );

    const filterSelect =
        document.getElementById(
            "moto-filter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const filter =
        filterSelect
            ? filterSelect.value
            : "todos";


    /*========================================
        FILTRAR
    ========================================*/

    const filtered =
        historial.filter(item => {

            const matchesSearch =
                !search ||

                (item.nombre || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (item.tipo || "")
                    .toLowerCase()
                    .includes(search)

                ||

                (item.observaciones || "")
                    .toLowerCase()
                    .includes(search);


            const matchesFilter =
                filter === "todos" ||

                item.tipo === filter;


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    /*========================================
        SIN RESULTADOS
    ========================================*/

    if(!filtered.length){

        list.innerHTML = `

            <div class="moto-empty">

                <i class="fa-solid fa-magnifying-glass"></i>

                <h3>

                    No encontramos resultados

                </h3>

                <p>

                    Prueba con otro término
                    o cambia el filtro.

                </p>

            </div>

        `;

        return;

    }


    /*========================================
        AGRUPAR RESULTADOS
    ========================================*/

    const groups =
        groupMotoHistory(filtered);


    list.innerHTML = "";


    Object.entries(groups).forEach(

        ([month, items]) => {

            const total =
                items.length;


            list.innerHTML += `

                <section class="moto-month">

                    <header
                        class="moto-month-header">

                        <div>

                            <h3>

                                ▼ ${month}

                            </h3>

                            <small>

                                ${items.length}
                                mantenimientos

                            </small>

                        </div>

                        <strong>

                            ${total} registros

                        </strong>

                    </header>

                    <div
                        class="moto-month-list">

                        ${
                            items
                                .map(
                                    createMaintenanceCard
                                )
                                .join("")
                        }

                    </div>

                </section>

            `;

        }

    );

}

/*======================================================
    CONTROLES DEL HISTORIAL
======================================================*/

function initMotoHistoryControls(){

    const searchInput =
        document.getElementById(
            "moto-search"
        );

    const filterSelect =
        document.getElementById(
            "moto-filter"
        );


    if(searchInput){

        searchInput.addEventListener(
            "input",
            renderMotoHistoryList
        );

    }


    if(filterSelect){

        filterSelect.addEventListener(
            "change",
            renderMotoHistoryList
        );

    }

}

/*======================================================
    AGRUPAR HISTORIAL POR MES
======================================================*/

function groupMotoHistory(
    historial = finTrack.moto.historial || []
){

    const groups = {};


    historial.forEach(item => {

        const date =
            new Date(item.fecha);


        const key =
            date.toLocaleDateString(

                "es-CO",

                {
                    month: "long",
                    year: "numeric"
                }

            );


        if(!groups[key]){

            groups[key] = [];

        }


        groups[key].push(item);

    });


    return groups;

}

/*======================================================
    TARJETA MANTENIMIENTO
======================================================*/

function createMaintenanceCard(item){

const icon=getMaintenanceIcon(item.tipo);

const title=getMaintenanceName(item.tipo);

const color=getMaintenanceColor(item.tipo);

    const fecha=new Date(item.fecha)
        .toLocaleDateString("es-CO",{

            day:"numeric",

            month:"short",

            year:"numeric"

        });

        return `

        <article class="moto-history-card ${color}">
    
            <div class="moto-history-icon">

            ${icon}

        </div>

        <div class="moto-history-info">

            <h4>

                ${title}

            </h4>

            <small>

                📅 ${fecha}

            </small>

            <small>

                🛣 ${item.kilometraje.toLocaleString("es-CO")} km

            </small>

           <small>

    ⏭ Próximo: ${item.proximoKm.toLocaleString("es-CO")} km

</small>

            <p>

                ${item.observaciones || ""}

            </p>

        </div>

        <div class="moto-history-actions">

            <button

                onclick="editMaintenance('${item.id}')">

                <i class="fa-solid fa-pen"></i>

            </button>

            <button

                onclick="deleteMaintenance('${item.id}')">

                <i class="fa-solid fa-trash"></i>

            </button>

        </div>

    </article>

    `;

}

/*======================================================
    CRUD MANTENIMIENTOS
======================================================*/


/*======================================================
    EDITAR MANTENIMIENTO
======================================================*/

function editMaintenance(id){

    const maintenance =
        finTrack.moto.historial.find(

            item => item.id === id

        );


    if(!maintenance){

        console.warn(
            "Mantenimiento no encontrado:",
            id
        );

        return;

    }


    openMaintenanceModal();

    editingMaintenanceId = id;


    selectMaintenanceType(
        maintenance.tipo
    );


    document.getElementById(
        "maintenance-km"
    ).value =
        maintenance.kilometraje;


    document.getElementById(
        "maintenance-date"
    ).value =
        maintenance.fecha;


    document.getElementById(
        "maintenance-next-km"
    ).value =
        maintenance.proximoKm;


    document.getElementById(
        "maintenance-notes"
    ).value =
        maintenance.observaciones || "";


    const saveButton =
        document.getElementById(
            "save-maintenance"
        );


    if(saveButton){

        saveButton.textContent =
            "Guardar cambios";

    }

}


/*======================================================
    ELIMINAR MANTENIMIENTO
======================================================*/

function deleteMaintenance(id){

    const confirmDelete =
        confirm(
            "¿Deseas eliminar este mantenimiento?"
        );


    if(!confirmDelete){

        return;

    }


    finTrack.moto.historial =
        finTrack.moto.historial.filter(

            item => item.id !== id

        );


    updateMotoData();

}


/*======================================================
    ACTUALIZAR KILOMETRAJE
======================================================*/

function updateMileage(km){

    const actual =
        finTrack.moto.kilometraje;


    const nuevoKm =
        Number(km);


    if(!Number.isFinite(nuevoKm)){

        return false;

    }


    if(nuevoKm < actual){

        return false;

    }


    finTrack.moto.kilometraje =
        nuevoKm;


    updateMotoData();


    return true;

}

/*======================================================
    EXPORTS
======================================================*/

window.renderMoto = renderMoto;

window.editMaintenance = editMaintenance;

window.deleteMaintenance = deleteMaintenance;

window.updateMileage = updateMileage;

window.toggleVehicleSelector =
    toggleVehicleSelector;

window.selectVehicle =
    selectVehicle;

window.deleteVehicle =
    deleteVehicle;

window.openAddVehicleModal =
    openAddVehicleModal;

window.closeAddVehicleModal =
    closeAddVehicleModal;

window.saveNewVehicle =
    saveNewVehicle;

window.handleNewVehiclePhoto =
    handleNewVehiclePhoto;

window.openVehiclePhotoPicker =
    openVehiclePhotoPicker;


/*======================================================
    ACTUALIZAR DATOS MOTO
======================================================*/

function updateMotoData(){

    rebuildMotoReminders();

    saveData(finTrack);

    renderMoto();

}
/*======================================================
    RECONSTRUIR RECORDATORIOS
======================================================*/

/*======================================================
    RECONSTRUIR RECORDATORIOS
======================================================*/

function rebuildMotoReminders(){

    const historial =
        finTrack.moto.historial || [];

    const recordatorios =
        finTrack.moto.recordatorios || {};


    /*========================================
        OBTENER EL ÚLTIMO MANTENIMIENTO
        DE CADA TIPO
    ========================================*/

    const latest = {};


    historial.forEach(item => {

        if(!item.tipo) return;

        const actual = latest[item.tipo];


        if(!actual){

            latest[item.tipo] = item;

            return;

        }


        const fechaActual =
            new Date(actual.fecha);

        const fechaNueva =
            new Date(item.fecha);


        if(fechaNueva >= fechaActual){

            latest[item.tipo] = item;

        }

    });


    /*========================================
        ACTUALIZAR RECORDATORIOS
    ========================================*/

    Object.entries(latest).forEach(

        ([tipo, item]) => {

            const reminder =
                recordatorios[tipo];

            if(!reminder) return;


            reminder.ultimoCambioKm =
                item.kilometraje;


            reminder.proximoCambioKm =
                item.proximoKm;


            reminder.fecha =
                item.fecha;


            reminder.observaciones =
                item.observaciones || "";

        }

    );

}

/*======================================================
    MODAL KILOMETRAJE
======================================================*/

function openMileageModal(){

    const modal =
        document.getElementById("mileage-modal");

    if(!modal) return;

    const input =
        document.getElementById("mileage-input");

    if(input){

        input.value =
            finTrack.moto.kilometraje;

    }

    modal.classList.add("active");

    if(input){

        input.focus();

    }

}


function closeMileageModal(){

    const modal =
        document.getElementById("mileage-modal");

    if(!modal) return;

    modal.classList.remove("active");

}


function saveMileage(){

    const input =
        document.getElementById("mileage-input");

    if(!input) return;

    const km =
        Number(input.value);

    if(!Number.isFinite(km)){

        alert("Ingresa un kilometraje válido.");

        return;

    }

    if(!updateMileage(km)){

        alert(
            "El kilometraje no puede ser menor al actual."
        );

        return;

    }

    closeMileageModal();

}


/*======================================================
    EXPORTAR
======================================================*/

window.openMileageModal = openMileageModal;
window.closeMileageModal = closeMileageModal;
window.saveMileage = saveMileage;
