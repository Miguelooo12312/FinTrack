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

    const currentMonthMovements = getCurrentMonthMovements();

    console.log("Movimientos del mes:", currentMonthMovements);

console.log(
    "Cantidad:",
    currentMonthMovements.length
);

    currentMonthMovements.forEach(movement=>{

        switch (movement.tipo) {

            case "ingreso":

                finTrack.finanzas.ingresos += movement.monto;

                finTrack.finanzas.saldo += movement.monto;

                break;

            case "gasto":

                finTrack.finanzas.gastos += movement.monto;

                finTrack.finanzas.saldo -= movement.monto;

                break;

          case "ahorro":

    finTrack.finanzas.ahorros += movement.monto;

    finTrack.finanzas.saldo -= movement.monto;

    break;
        }

    });

    saveData(finTrack);

    console.log(finTrack.finanzas);

}