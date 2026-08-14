/*======================================================
    FinTrack
    movements.js
======================================================*/

"use strict";

/*==========================================
    CATEGORÍAS
==========================================*/

const movementCategories = {

    ingreso: [

        "Salario",
        "Bonificación",
        "comision",
        "Negocio",
        "Otro"

    ],

    gasto: [

        "Comida",
        "Mi novia preciosa",
        "Moto",
        "Servicios",
        "Entretenimiento",
        "Salud",
        "Peluqueada",
        

    ],

    ahorro: [

      
    ]

};

/*==========================================
    VARIABLES
==========================================*/

let movementType = "ingreso";

/*==========================================
    EDICIÓN
==========================================*/

let editingId = null;
/*==========================================
    INICIALIZAR MODAL
==========================================*/

function initMovementModal() {

    const buttons = document.querySelectorAll(".movement-option");

    buttons.forEach(button => {

        button.addEventListener("click", () => {

            buttons.forEach(btn => btn.classList.remove("active"));

            button.classList.add("active");

            movementType = button.dataset.type;

            updateMovementTheme();

            loadCategories();

        });

    });

    // ← ESTA PARTE VA FUERA DEL forEach
    document
        .getElementById("save-movement")
        .addEventListener("click", saveMovement);

    document.getElementById("movement-date").valueAsDate = new Date();

    loadCategories();

    updateMovementTheme();

    initAmountFormatter();

}

/*==========================================
    CATEGORÍAS
==========================================*/

function loadCategories() {

    const select = document.getElementById("movement-category");

    select.innerHTML = "";

    movementCategories[movementType].forEach(category => {

        const option = document.createElement("option");

        option.value = category;

        option.textContent = category;

        select.appendChild(option);

    });

}
function updateMovementTheme() {

    const modal = document.getElementById("movement-modal");
    const title = document.getElementById("modal-title");
    const saveButton = document.getElementById("save-movement");
    const goalGroup = document.getElementById("goal-select-group");

    switch (movementType) {

        case "ingreso":
            title.innerHTML = `<i class="fa-solid fa-money-bill-trend-up"></i> Nuevo ingreso`;
            saveButton.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar ingreso`;
            saveButton.classList.remove("expense-btn", "saving-btn");
            saveButton.classList.add("income-btn");
            break;

        case "gasto":
            title.innerHTML = `<i class="fa-solid fa-credit-card"></i> Nuevo gasto`;
            saveButton.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar gasto`;
            saveButton.classList.remove("income-btn", "saving-btn");
            saveButton.classList.add("expense-btn");
            break;

        case "ahorro":
            title.innerHTML = `<i class="fa-solid fa-piggy-bank"></i> Nuevo ahorro`;
            saveButton.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar ahorro`;
            saveButton.classList.remove("income-btn", "expense-btn");
            saveButton.classList.add("saving-btn");
            break;
    }

    const categoryGroup = document
        .getElementById("movement-category")
        .closest(".form-group");

    if (movementType === "ahorro") {
        goalGroup.classList.remove("hidden");
        categoryGroup.classList.add("hidden");
        loadGoalsSelect();
    } else {
        goalGroup.classList.add("hidden");
        categoryGroup.classList.remove("hidden");
    }

}



/*======================================================
    FORMATEADOR DE MONTO
======================================================*/

function initAmountFormatter(){

    const input = document.getElementById("movement-amount");

    if(!input) return;

    input.addEventListener("input", formatAmount);

}

/*======================================================
    FORMATEAR
======================================================*/

function formatAmount(e){

    let value = e.target.value;

    // Solo números
    value = value.replace(/\D/g, "");

    if(value === ""){

        e.target.value = "";

        return;

    }

    // Convertimos a número
    value = parseInt(value);

    // Formato colombiano
    e.target.value = "$" + value.toLocaleString("es-CO");

}


/*======================================================
    OBTENER MONTO NUMÉRICO
======================================================*/

function getAmountValue(){

    const input = document.getElementById("movement-amount");

    return Number(

        input.value.replace(/\D/g,"")

    );

}

/*======================================================
    LIMPIAR FORMULARIO
======================================================*/

function clearMovementForm(){

    document.getElementById("movement-amount").value="";

    document.getElementById("movement-description").value="";

    document.getElementById("movement-date").valueAsDate=new Date();

    movementType="ingreso";

    document
        .querySelector('[data-type="ingreso"]')
        .click();

        document.getElementById("movement-goal").value="";

}

/*======================================================
    GUARDAR MOVIMIENTO
======================================================*/

function saveMovement() {

    const selectedGoal=Number(

    document
        .getElementById("movement-goal")
        .value

);

    console.log("Entró a saveMovement");

    const amount = getAmountValue();

    if (amount <= 0) {

        alert("Debes ingresar un monto.");

        return;

    }

    if(

    movementType === "ahorro"

    &&

    !selectedGoal

){

    alert("Selecciona un objetivo para este ahorro.");

    return;

}
/*============================
    CATEGORÍA FINAL
============================*/

let categoriaFinal;

if(movementType === "ahorro"){

    const goal = finTrack.objetivos.find(

        g => g.id === selectedGoal

    );

    categoriaFinal = goal.nombre;

}else{

    categoriaFinal = document
        .getElementById("movement-category")
        .value;

}

    const movement = {

    id: editingId ?? Date.now(),

    tipo: movementType,

    monto: amount,

    categoria: categoriaFinal,

    objetivoId: movementType === "ahorro"
        ? selectedGoal
        : null,

    descripcion: document.getElementById("movement-description").value,

    fecha: document.getElementById("movement-date").value

};

 /*============================
    AGREGAR / EDITAR MOVIMIENTO
============================*/

if (editingId !== null) {

    const index = finTrack.movimientos.findIndex(

        item => item.id === editingId

    );

    const previousMovement = finTrack.movimientos[index];

    /*============================
        REVERTIR AHORRO ANTERIOR
    ============================*/

    if(previousMovement.tipo === "ahorro"){

        const previousGoal = finTrack.objetivos.find(

            goal => goal.id === previousMovement.objetivoId

        );

        if(previousGoal){

            previousGoal.ahorrado -= previousMovement.monto;

        }

    }

    finTrack.movimientos[index] = movement;

} else {

    finTrack.movimientos.push(movement);

}

/*============================
    APLICAR NUEVO AHORRO
============================*/

if(movementType === "ahorro"){

    const goal = finTrack.objetivos.find(

        goal => goal.id === selectedGoal

    );

    if(goal){

        goal.ahorrado += amount;

    }

}

    /*============================
        RECALCULAR TODO
    ============================*/

    recalculateFinances();

    saveData(finTrack);

    updateDashboard();

    renderGoal();

    renderHistory();

    editingId = null;

    clearMovementForm();

    document.getElementById("save-movement").innerHTML = `

<i class="fa-solid fa-floppy-disk"></i>

Guardar ingreso

`;

updateMovementTheme();

    closeModal();

}

/*======================================================
    ELIMINAR MOVIMIENTO
======================================================*/


function deleteMovement(id){

    const confirmDelete = confirm(

        "¿Deseas eliminar este movimiento?"

    );

    if(!confirmDelete){

        return;

    }

    const movement = finTrack.movimientos.find(

        item => item.id === id

    );

    if(movement && movement.tipo === "ahorro"){

        const goal = finTrack.objetivos.find(

            goal => goal.id === movement.objetivoId

        );

        if(goal){

            goal.ahorrado -= movement.monto;

        }

    }

    finTrack.movimientos = finTrack.movimientos.filter(

        movement => movement.id !== id

    );

    recalculateFinances();

    saveData(finTrack);

    updateDashboard();

    renderGoal();

    renderHistory();

}

/*======================================================
    EDITAR MOVIMIENTO
======================================================*/

function editMovement(id){

    const movement = finTrack.movimientos.find(

        item => item.id === id

    );

    if(!movement){

        return;

    }

    editingId = id;

    movementType = movement.tipo;

    openModal();

    document
    .querySelector(

        `[data-type="${movement.tipo}"]`

    ).click();

    document.getElementById(

        "movement-amount"

    ).value="$"+movement.monto.toLocaleString("es-CO");

    document.getElementById(

        "movement-description"

    ).value=movement.descripcion;

    document.getElementById(

        "movement-date"

    ).value=movement.fecha;

    loadCategories();

    document.getElementById(

        "movement-category"

    ).value=movement.categoria;

    document.getElementById(

        "save-movement"

    ).innerHTML=`

        <i class="fa-solid fa-pen"></i>

        Actualizar ${movement.tipo}

    `;

    }

    /*======================================================
    CARGAR OBJETIVOS
======================================================*/

function loadGoalsSelect(){

    const select = document.getElementById("movement-goal");

    if(!select) return;

    select.innerHTML = `

        <option value="">

            Seleccionar objetivo...

        </option>

    `;

    finTrack.objetivos.forEach(goal=>{

        select.innerHTML += `

            <option value="${goal.id}">

                ${goal.icono} ${goal.nombre}

            </option>

        `;

    });

}


