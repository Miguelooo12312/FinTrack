/*======================================================
    FinTrack v1.1
    Archivo: storage.js

    Descripción:
    Maneja el almacenamiento local de la aplicación.

======================================================*/

"use strict";

/*======================================================
    CLAVE PRINCIPAL DEL LOCALSTORAGE
======================================================*/

const STORAGE_KEY = "fintrack_data";

/*======================================================
    DATOS INICIALES
======================================================*/
const defaultData = {

    usuario: {

        nombre: "Miguel"

    },

finanzas: {

    saldo: 0,

    ingresos: 0,

    gastos: 0,

    ahorros: 0

},

    movimientos: [],

    categorias: {

        ingresos: [

            "Salario",

            "Bonificación",

            "Venta",

            "Otro"

        ],

        gastos: [

            "Comida",

            "Transporte",

            "Servicios",

            "Entretenimiento",

            "Otro"

        ]

    },

     objetivos: [ 
    

    {

        id:1,

        nombre:"Bajaj NS200",

        objetivo:8500000,

        ahorrado:0,

        fechaCreacion:new Date().toISOString(),

        fechaObjetivo:"",

        completado:false,

        principal:true,

        icono:"🏍️"

    }

],



moto:{

    /*==================================
        INFORMACIÓN GENERAL
    ==================================*/

    marca:"Suzuki",

    modelo:"GSX125R",

    año:2021,

    kilometraje:68600,

    estadoIA:"Excelente",

    foto:"assets/images/moto.png",

    tipo:"moto",

  recordatorios:{

    aceite:{

        ultimoCambioKm:68500,
        proximoCambioKm:70500,
        fecha:"2026-07-20",
        observaciones:""

    },

    pastillas:{

        ultimoCambioKm:64000,
        proximoCambioKm:72000,
        fecha:"2026-03-15",
        observaciones:""

    },

    kit:{

        ultimoCambioKm:60000,
        proximoCambioKm:78000,
        fecha:"2025-12-01",
        observaciones:""

    },

    bateria:{

        ultimoCambioKm:0,
        proximoCambioKm:0,
        fecha:null,
        observaciones:""

    },

    llantas:{

        ultimoCambioKm:0,
        proximoCambioKm:0,
        fecha:null,
        observaciones:""

    },

    otro:{

        ultimoCambioKm:0,
        proximoCambioKm:0,
        fecha:null,
        observaciones:""

    },

    soat:{

        vence:"2027-06-27"

    },

    tecnomecanica:{

        vence:"2027-06-14"

    }

},

    /*==================================
        HISTORIAL
    ==================================*/

    historial:[

    ]


    },

    configuracion: {

        tema: "dark",

        moneda: "COP"

    }


};

/*======================================================
    OBTENER DATOS
======================================================*/

function getData() {

    const data = localStorage.getItem(STORAGE_KEY);

    if(data){

        const parsed = JSON.parse(data);

        const migrated = migrateData(parsed);

        saveData(migrated);

        return migrated;

    }

    saveData(defaultData);

    return structuredClone(defaultData);

}
/*======================================================
    MIGRAR DATOS
======================================================*/

function migrateData(data){

    if(!data){

        return structuredClone(defaultData);

    }

    Object.keys(defaultData).forEach(key=>{

        if(data[key]===undefined){

            data[key]=structuredClone(defaultData[key]);

        }

    });

    Object.keys(defaultData.moto).forEach(key=>{

        if(data.moto[key]===undefined){

            data.moto[key]=structuredClone(

                defaultData.moto[key]

            );

        }

    });

    Object.keys(defaultData.moto.recordatorios).forEach(key=>{

        if(data.moto.recordatorios[key]===undefined){

            data.moto.recordatorios[key]=structuredClone(

                defaultData.moto.recordatorios[key]

            );

        }

    });

    // Los movimientos anteriores a esta versión no tenían medio de pago.
    // Se conservan intactos y se marcan para que el usuario los complete al editarlos.
    data.movimientos = Array.isArray(data.movimientos) ? data.movimientos : [];
    data.movimientos.forEach(movement => {
        if(!["efectivo", "digital"].includes(movement.medio)){
            movement.medio = "";
        }
    });

    data.categorias ||= {};
    data.categorias.ingresos ||= structuredClone(defaultData.categorias.ingresos);
    data.categorias.gastos ||= structuredClone(defaultData.categorias.gastos);

    return data;

}

/*======================================================
    GUARDAR DATOS
======================================================*/

function saveData(data) {

    localStorage.setItem(

        STORAGE_KEY,

        JSON.stringify(data)

    );

    // La copia local permite usar FinTrack aun sin conexión. Si hay sesión,
    // syncService replica el cambio en segundo plano.
    if(window.syncService){
        window.syncService.scheduleSave(data);
    }

}

/*======================================================
    RESETEAR INFORMACIÓN
======================================================*/

function resetData() {

    localStorage.removeItem(STORAGE_KEY);

}

/*======================================================
    VARIABLE GLOBAL

    Todo FinTrack trabajará desde aquí.

======================================================*/

let finTrack = getData();

const vehicleMaintenanceIntervals = {

    aceite: 2000,
    pastillas: 8000,
    kit: 18000,
    bateria: 0,
    llantas: 0,
    otro: 0

};

function normalizeVehicleReminders(vehicle){

    vehicle.recordatorios ||= {};

    Object.entries(vehicleMaintenanceIntervals).forEach(
        ([type, interval]) => {

            const reminder = vehicle.recordatorios[type] ||= {};

            reminder.ultimoCambioKm ??= 0;
            reminder.proximoCambioKm ??= 0;
            reminder.fecha ??= null;
            reminder.observaciones ??= "";

            /*
                Un 0/0 representa un recordatorio que aún no ha sido
                configurado. Al crear un vehículo partimos del kilometraje
                actual, para no mostrar un mantenimiento ficticiamente vencido.
            */
            if(
                interval > 0 &&
                reminder.ultimoCambioKm === 0 &&
                reminder.proximoCambioKm === 0
            ){

                reminder.ultimoCambioKm = vehicle.kilometraje;
                reminder.proximoCambioKm =
                    vehicle.kilometraje + interval;

            }

        }
    );

    vehicle.recordatorios.soat ||= { vence:"" };
    vehicle.recordatorios.tecnomecanica ||= { vence:"" };

}

/*======================================================
    INICIALIZAR VEHÍCULOS
======================================================*/

function initializeVehicles(){

    /*----------------------------------------
        CREAR LISTA DE VEHÍCULOS
    ----------------------------------------*/

    if(!finTrack.vehiculos){

        finTrack.vehiculos = [];

    }


    /*----------------------------------------
        MIGRAR LA MOTO ACTUAL
    ----------------------------------------*/

    if(
        finTrack.vehiculos.length === 0 &&
        finTrack.moto
    ){

        finTrack.vehiculos.push({

            ...finTrack.moto,

            id:
                finTrack.moto.id ||
                crypto.randomUUID()

        });

    }


    /*----------------------------------------
        ESTABLECER VEHÍCULO ACTIVO
    ----------------------------------------*/

    if(
        !finTrack.activeVehicleId &&
        finTrack.vehiculos.length > 0
    ){

        finTrack.activeVehicleId =
            finTrack.vehiculos[0].id;

    }


    finTrack.vehiculos.forEach(normalizeVehicleReminders);


    /*----------------------------------------
        SINCRONIZAR VEHÍCULO ACTIVO
    ----------------------------------------*/

    const activeVehicle =
        finTrack.vehiculos.find(
            vehicle => vehicle.id === finTrack.activeVehicleId
        );

    if(activeVehicle){

        finTrack.moto = activeVehicle;

    }


    saveData(finTrack);

}


/*----------------------------------------
    EJECUTAR
----------------------------------------*/

initializeVehicles();

/*======================================================
    RECALCULAR FINANZAS
======================================================*/

function recalculateFinances() {

    finTrack.finanzas = {

        saldo: 0,

        ingresos: 0,

        gastos: 0,

        ahorros: 0

    };

    /* Las tarjetas de actividad describen únicamente el mes en curso. */
    const currentMonthMovements = getCurrentMonthMovements();

    currentMonthMovements.forEach(movement=>{

        switch (movement.tipo) {

            case "ingreso":

                finTrack.finanzas.ingresos += movement.monto;

                break;

            case "gasto":

                finTrack.finanzas.gastos += movement.monto;

                break;

          case "ahorro":

    finTrack.finanzas.ahorros += movement.monto;

    break;
        }

    });

    /* El saldo no es mensual: representa todo el dinero disponible. */
    finTrack.movimientos.forEach(movement => {
        if(movement.tipo === "ingreso"){
            finTrack.finanzas.saldo += movement.monto;
        }

        if(movement.tipo === "gasto" || movement.tipo === "ahorro"){
            finTrack.finanzas.saldo -= movement.monto;
        }
    });

    saveData(finTrack);

}
