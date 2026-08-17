/*======================================================
    MOTO.JS
    FinTrack v1.0
======================================================*/

"use strict";

let editingMaintenanceId = null;

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

    </div>


    <!--========================================
        FOTO DEL VEHÍCULO
    ========================================-->

    <div class="moto-hero-image">

        <img
            src="${
                finTrack.moto.foto ||
                "assets/images/moto2.png"
            }"
            alt="${
                finTrack.moto.marca
            } ${
                finTrack.moto.modelo
            }"
        >

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

    </div>

</section>

`;

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