"use strict";

/*======================================================
    MOTOMODAL V2
======================================================*/
/*======================================================
    ESTADO DEL MODAL
======================================================*/

let currentMaintenanceType = "aceite";

/*--------------------------------------
    Catálogo de mantenimientos
--------------------------------------*/

const maintenanceCatalog = {

    aceite:{

        nombre:"Cambio de aceite",

        icono:"🛢",

        intervalo:2000

    },

    pastillas:{

        nombre:"Cambio de pastillas",

        icono:"🛑",

        intervalo:8000

    },

    kit:{

        nombre:"Kit de arrastre",

        icono:"⚙",

        intervalo:18000

    },

    llantas:{

        nombre:"Cambio de llantas",

        icono:"🛞",

        intervalo:15000

    },

    bateria:{

        nombre:"Cambio de batería",

        icono:"🔋",

        intervalo:24000

    },

    soat:{

        nombre:"SOAT",

        icono:"📄",

        intervalo:null

    },

    tecnomecanica:{

        nombre:"Tecnomecánica",

        icono:"🔧",

        intervalo:null

    },

    otro:{

        nombre:"Otro mantenimiento",

        icono:"🧰",

        intervalo:0

    }

};

/*======================================================
    ABRIR
======================================================*/

function openMaintenanceModal(){

    loadDefaultMaintenanceData();

    const modal = document.getElementById(
        "maintenance-modal"
    );

    if(!modal) return;

    modal.classList.add("active");

}


/*======================================================
    CERRAR
======================================================*/

function closeMaintenanceModal(){

    const modal = document.getElementById(
        "maintenance-modal"
    );

    if(!modal) return;

    modal.classList.remove("active");

}

/*======================================================
    INIT
======================================================*/

function initMaintenanceModal(){

    document

        .getElementById(

            "close-maintenance-modal"

        )

        ?.addEventListener(

            "click",

            closeMaintenanceModal

        );

    document

        .getElementById(

            "cancel-maintenance"

        )

        ?.addEventListener(

            "click",

            closeMaintenanceModal

        );

        document
    .getElementById("save-maintenance")
    ?.addEventListener(
        "click",
        saveMaintenance
    );

}



/*======================================================
    CARGAR DATOS POR DEFECTO
======================================================*/

function loadDefaultMaintenanceData(){

    currentMaintenanceType = "aceite";

    // Fecha de hoy
    document.getElementById("maintenance-date").value =
        new Date().toISOString().split("T")[0];

    // Kilometraje actual
    document.getElementById("maintenance-km").value =
        finTrack.moto.kilometraje;

    // Limpiar observaciones
    document.getElementById("maintenance-notes").value = "";

    renderMaintenanceTypes();
    
    updateMaintenanceUI();

}



/*======================================================
    ACTUALIZAR INTERFAZ DEL MODAL
======================================================*/

function updateMaintenanceUI(){

    const maintenance =

        maintenanceCatalog[currentMaintenanceType];

    if(!maintenance) return;

    /*-------------------------------
        Título
    -------------------------------*/

    document.getElementById(

        "maintenance-title"

    ).textContent =

        `${maintenance.icono} ${maintenance.nombre}`;

    /*-------------------------------
        Botón
    -------------------------------*/

    document.getElementById(

        "save-maintenance"

    ).textContent =

        `Registrar ${maintenance.nombre.toLowerCase()}`;

    /*-------------------------------
        Próximo mantenimiento
    -------------------------------*/

    const nextInput = document.getElementById(

        "maintenance-next-km"

    );

    if(

        maintenance.intervalo !== null &&

        nextInput

    ){

        nextInput.value =

            Number(finTrack.moto.kilometraje) +

            maintenance.intervalo;

    }

    else if(nextInput){

        nextInput.value = "";

    }

}

/*======================================================
    SELECCIONAR TIPO
======================================================*/

function selectMaintenanceType(type){

    if(!maintenanceCatalog[type]) return;

    currentMaintenanceType = type;

    renderMaintenanceTypes();

    updateMaintenanceUI();

}

/*======================================================
    SELECCIONAR TIPO DE MANTENIMIENTO
======================================================*/

function selectMaintenanceType(type){

    if(!maintenanceCatalog[type]) return;

    currentMaintenanceType = type;

    document

        .querySelectorAll(".maintenance-option")

        .forEach(card=>{

            card.classList.remove("active");

        });

    document

        .querySelector(

            `.maintenance-option[data-type="${type}"]`

        )

        ?.classList.add("active");

    updateMaintenanceUI();

}

/*======================================================
    RENDER TIPOS DE MANTENIMIENTO
======================================================*/

function renderMaintenanceTypes(){

    const container = document.getElementById(

        "maintenance-types"

    );

    if(!container) return;

    container.innerHTML = "";

    Object.entries(maintenanceCatalog).forEach(

        ([id,item])=>{

            container.innerHTML += `

<button

    class="maintenance-option
    ${id===currentMaintenanceType?"active":""}"

    data-type="${id}"

    onclick="selectMaintenanceType('${id}')">



    <span>

        ${item.icono}

    </span>

    <small>

        ${item.nombre}

    </small>

</button>

`;

        }

    );

}


function saveMaintenance(){

     const maintenance = {

        id: crypto.randomUUID(),

        tipo: currentMaintenanceType,

        fecha: document.getElementById(

            "maintenance-date"

        ).value,

        kilometraje: Number(

            document.getElementById(

                "maintenance-km"

            ).value

        ),

        proximoKm: Number(

            document.getElementById(

                "maintenance-next-km"

            ).value

        ),

        observaciones: document.getElementById(

            "maintenance-notes"

        ).value.trim()

    };

    finTrack.moto.historial.push(maintenance);

saveData(finTrack);

updateMotoData();

console.log(finTrack.moto.historial);

    console.log(maintenance);

}

/*======================================================
    EXPORTS
======================================================*/

window.openMaintenanceModal = openMaintenanceModal;

window.closeMaintenanceModal = closeMaintenanceModal;

window.initMaintenanceModal = initMaintenanceModal;

window.selectMaintenanceType = selectMaintenanceType;