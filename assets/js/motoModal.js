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

        id: editingMaintenanceId || crypto.randomUUID(),

        tipo: currentMaintenanceType,

        nombre:
            maintenanceCatalog[currentMaintenanceType].nombre,

        icono:
            maintenanceCatalog[currentMaintenanceType].icono,

        fecha:
            document.getElementById(
                "maintenance-date"
            ).value,

        kilometraje:
            Number(
                document.getElementById(
                    "maintenance-km"
                ).value
            ),

        proximoKm:
            Number(
                document.getElementById(
                    "maintenance-next-km"
                ).value
            ),

        observaciones:
            document.getElementById(
                "maintenance-notes"
            ).value.trim()

    };


    /*========================================
        GUARDAR O EDITAR
    ========================================*/

    if(editingMaintenanceId){

        const index =
            finTrack.moto.historial.findIndex(

                item =>
                    item.id === editingMaintenanceId

            );

        if(index !== -1){

            finTrack.moto.historial[index] =
                maintenance;

        }

    }

    else{

        finTrack.moto.historial.push(
            maintenance
        );

    }


    /*========================================
        FINALIZAR
    ========================================*/

    saveData(finTrack);

    editingMaintenanceId = null;

    closeMaintenanceModal();

    updateMotoData();

}

/*======================================================
    EXPORTS
======================================================*/

window.openMaintenanceModal = openMaintenanceModal;

window.closeMaintenanceModal = closeMaintenanceModal;

window.initMaintenanceModal = initMaintenanceModal;

window.selectMaintenanceType = selectMaintenanceType;

window.saveMaintenance = saveMaintenance;


/*======================================================
    MODAL KILOMETRAJE
======================================================*/

function openMileageModal(){

    const modal =
        document.getElementById(
            "mileage-modal"
        );

    if(!modal) return;

    const input =
        document.getElementById(
            "mileage-input"
        );

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
        document.getElementById(
            "mileage-modal"
        );

    if(!modal) return;

    modal.classList.remove("active");

}


function saveMileage(){

    const input =
        document.getElementById(
            "mileage-input"
        );

    if(!input) return;


    const km =
        Number(input.value);


    if(!Number.isFinite(km)){

        alert(
            "Ingresa un kilometraje válido."
        );

        return;

    }


    if(
        !updateMileage(km)
    ){

        alert(
            "El kilometraje no puede ser menor al actual."
        );

        return;

    }


    closeMileageModal();

}

window.openMileageModal =
    openMileageModal;

window.closeMileageModal =
    closeMileageModal;

window.saveMileage =
    saveMileage;


    document
    .getElementById("close-mileage-modal")
    ?.addEventListener(
        "click",
        closeMileageModal
    );

document
    .getElementById("cancel-mileage")
    ?.addEventListener(
        "click",
        closeMileageModal
    );

document
    .getElementById("save-mileage")
    ?.addEventListener(
        "click",
        saveMileage
    );


    /*======================================================
    MODAL FECHA DOCUMENTO
======================================================*/

let currentDocumentType = null;


function openDocumentDateModal(type){

    if(
        type !== "soat" &&
        type !== "tecnomecanica"
    ){

        return;

    }


    currentDocumentType = type;


    const reminder =
        finTrack.moto.recordatorios[type];

    if(!reminder) return;


    const modal =
        document.getElementById(
            "document-date-modal"
        );

    const input =
        document.getElementById(
            "document-date-input"
        );

    const title =
        document.getElementById(
            "document-date-title"
        );


    if(!modal || !input || !title){

        return;

    }


    title.textContent =
        type === "soat"
            ? "Actualizar SOAT"
            : "Actualizar tecnomecánica";


    input.value =
        reminder.vence || "";


    modal.classList.add("active");

}


function closeDocumentDateModal(){

    const modal =
        document.getElementById(
            "document-date-modal"
        );

    if(!modal) return;

    modal.classList.remove("active");

    currentDocumentType = null;

}


function saveDocumentDate(){

    if(!currentDocumentType){

        return;

    }


    const input =
        document.getElementById(
            "document-date-input"
        );

    if(!input || !input.value){

        alert(
            "Selecciona una fecha válida."
        );

        return;

    }


    finTrack.moto.recordatorios[
        currentDocumentType
    ].vence = input.value;


    saveData(finTrack);

    renderMoto();

    closeDocumentDateModal();

}

window.openDocumentDateModal =
    openDocumentDateModal;

window.closeDocumentDateModal =
    closeDocumentDateModal;

window.saveDocumentDate =
    saveDocumentDate;

    document
    .getElementById(
        "close-document-date-modal"
    )
    ?.addEventListener(
        "click",
        closeDocumentDateModal
    );


document
    .getElementById(
        "cancel-document-date"
    )
    ?.addEventListener(
        "click",
        closeDocumentDateModal
    );


document
    .getElementById(
        "save-document-date"
    )
    ?.addEventListener(
        "click",
        saveDocumentDate
    );