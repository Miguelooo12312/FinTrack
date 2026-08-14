/*======================================================
    GOALS.JS
    FinTrack v2.1.1
======================================================*/

"use strict";

let editingGoalId = null;

function setMainGoal(id){

    finTrack.objetivos.forEach(goal=>{

        goal.principal = goal.id === id;

    });

    saveData(finTrack);

    renderGoal();

}

/*======================================================
    EDITAR OBJETIVO
======================================================*/

function editGoal(id){

    const goal = finTrack.objetivos.find(

        goal => goal.id === id

    );

    if(!goal) return;

    editingGoalId = id;

    document.getElementById("goal-name").value = goal.nombre;

    document.getElementById("goal-icon").value = goal.icono;

    document.getElementById("goal-target").value =
        goal.objetivo.toLocaleString("es-CO");

    document.getElementById("goal-date").value =
        goal.fechaObjetivo;

    document.getElementById("goal-main").checked =
        goal.principal;

    document.getElementById("save-goal").innerHTML = `

        <i class="fa-solid fa-floppy-disk"></i>

        Guardar cambios

    `;

    openGoalModal();

}

/*======================================================
    ELIMINAR OBJETIVO
======================================================*/

function deleteGoal(id){

    const goal = finTrack.objetivos.find(

        goal => goal.id === id

    );

    if(!goal) return;

    const confirmar = confirm(

        `¿Eliminar el objetivo "${goal.nombre}"?`

    );

    if(!confirmar) return;

    finTrack.objetivos = finTrack.objetivos.filter(

        goal => goal.id !== id

    );

    /*======================
        SI ERA EL PRINCIPAL
    ======================*/

    if(

        !finTrack.objetivos.some(

            goal=>goal.principal

        )

        &&

        finTrack.objetivos.length>0

    ){

        finTrack.objetivos[0].principal=true;

    }

    saveData(finTrack);

    renderGoal();

}

/*=============================
ABRIR
=============================*/

function openGoalModal(){

    document
        .getElementById("goal-modal")
        .classList.add("active");

}

/*=============================
CERRAR
=============================*/

function closeGoalModal(){

    document
        .getElementById("goal-modal")
        .classList.remove("active");

}

/*=============================
LIMPIAR
=============================*/

function clearGoalForm(){

    document.getElementById("goal-name").value="";

    document.getElementById("goal-icon").value="";

    document.getElementById("goal-target").value="";

    document.getElementById("goal-date").value="";

    document.getElementById("goal-main").checked=false;

}

/*=============================
GUARDAR OBJETIVO
=============================*/

function saveGoal(){

    const nombre = document
        .getElementById("goal-name")
        .value
        .trim();

    const icono = document
        .getElementById("goal-icon")
        .value
        .trim() || "🎯";

    const objetivo = getGoalMoneyValue("goal-target");

    const ahorrado = 0;

    const fecha = document
        .getElementById("goal-date")
        .value;

    const principal = document
        .getElementById("goal-main")
        .checked;

    /*======================
        VALIDACIONES
    ======================*/

    if(nombre===""){

        alert("Escribe un nombre para el objetivo.");

        return;

    }

    if(objetivo<=0){

        alert("El valor objetivo debe ser mayor que cero.");

        return;

    }

    /*======================
        META PRINCIPAL
    ======================*/

    if(principal){

        finTrack.objetivos.forEach(goal=>{

            goal.principal=false;

        });

    }

    /*======================
        EDITAR
    ======================*/

   if(editingGoalId){

    const goal = finTrack.objetivos.find(

        goal => goal.id === editingGoalId

    );

    if(goal){

        goal.nombre = nombre;

        goal.icono = icono;

        goal.objetivo = objetivo;

        // 👇 NO tocamos el ahorro acumulado
        // goal.ahorrado = ahorrado;

        goal.fechaObjetivo = fecha;

        goal.principal = principal;

    }

    saveData(finTrack);

    renderGoal();

    editingGoalId = null;

    clearGoalForm();

    document.getElementById("save-goal").innerHTML = `

        <i class="fa-solid fa-floppy-disk"></i>

        Crear objetivo

    `;

    closeGoalModal();

    return;

}

    /*======================
        CREAR
    ======================*/

    else{

        finTrack.objetivos.push({

            id:Date.now(),

            nombre,

            icono,

            objetivo,

            ahorrado,

            fechaCreacion:new Date().toISOString(),

            fechaObjetivo:fecha,

            principal,

            completado:false

        });

    }

    /*======================
        GUARDAR
    ======================*/

    saveData(finTrack);

    renderGoal();

    editingGoalId = null;

    clearGoalForm();

    document.getElementById("save-goal").innerHTML = `

        <i class="fa-solid fa-floppy-disk"></i>

        Crear objetivo

    `;

    closeGoalModal();

}

/*======================================================
    RENDER OBJETIVOS
======================================================*/

function renderGoal() {

    const main = document.getElementById("main-goal");
    const container = document.getElementById("goals-container");

    if (!main || !container) return;

    const mainGoal = finTrack.objetivos.find(
    goal => goal.principal
);

if(!mainGoal){

    main.innerHTML = "";

    return;

}

const porcentajePrincipal = Math.round(

    (mainGoal.ahorrado / mainGoal.objetivo) * 100

);

const restantePrincipal =

    mainGoal.objetivo - mainGoal.ahorrado;

const remainingDaysPrincipal = getRemainingDaysText(mainGoal);

const advicePrincipal = getGoalAdvice(mainGoal);

    /*==================================================
        META PRINCIPAL (Temporal)
    ==================================================*/
main.innerHTML = `

   <article
    class="goal-main-card"
    onclick="openGoalDetails(${mainGoal.id})">

    <div class="goal-main-top">

        <span class="goal-badge">

            ⭐ META PRINCIPAL

        </span>

        <div class="goal-percent">

            ${porcentajePrincipal}%

        </div>

    </div>

    <div class="goal-main-header">

        <div class="goal-main-icon">

            ${mainGoal.icono}

        </div>

        <div class="goal-main-title">

            <h2>

                ${mainGoal.nombre}

            </h2>

        </div>

    </div>

    <div class="goal-progress">

        <div

            class="goal-progress-fill"

            style="width:${porcentajePrincipal}%">

        </div>

    </div>

    <div class="goal-main-stats">

        <div class="goal-stat">

            <small>

                Ahorrado

            </small>

            <strong>

                $${mainGoal.ahorrado.toLocaleString("es-CO")}

            </strong>

        </div>

        <div class="goal-stat">

            <small>

                Objetivo

            </small>

            <strong>

                $${mainGoal.objetivo.toLocaleString("es-CO")}

            </strong>

        </div>

        <div class="goal-stat">

            <small>

                Te falta

            </small>

            <strong>

                $${restantePrincipal.toLocaleString("es-CO")}

            </strong>

        </div>

    </div>

    <div class="goal-main-date">

        <i class="fa-regular fa-calendar"></i>

        <span>

            ${mainGoal.fechaObjetivo || "Sin fecha límite"}

        </span>

    </div>

   <div class="goal-smart-info">

    <p>${remainingDaysPrincipal}</p>

    <p>${advicePrincipal.text}</p>

    ${
        advicePrincipal.amount
        ? `<strong>$${advicePrincipal.amount.toLocaleString("es-CO")} / ${advicePrincipal.period}</strong>`
        : ""
    }

</div>

    <div class="goal-actions">

        <button
    class="goal-action edit"
    title="Editar objetivo"
    onclick="editGoal(${mainGoal.id})">

    <i class="fa-solid fa-pen"></i>

</button>


       <button
    class="goal-action star"
    title="Meta principal">

    <i class="fa-solid fa-star"></i>

</button>

        <button

    class="goal-action delete"

    title="Eliminar"

    onclick="deleteGoal(${mainGoal.id})">

    <i class="fa-solid fa-trash"></i>

</button>

    </div>

</article>

`;

    /*==================================================
        CONTENEDOR
    ==================================================*/

    container.innerHTML = `

        <h2 class="goal-section-title">

            Los Secundarios

        </h2>

    `;

    /*==================================================
        OBJETIVOS DEMO
    ==================================================*/

    const goals = finTrack.objetivos;

   
      
    /*==================================================
        RENDER TARJETAS
    ==================================================*/

   goals.forEach(goal => {

     if(goal.principal){

        return;

    }

    const restante = goal.objetivo - goal.ahorrado;

    const porcentaje = Math.round(
        (goal.ahorrado / goal.objetivo) * 100
    );

const remainingDays = getRemainingDaysText(goal);

const advice = getGoalAdvice(goal);

container.innerHTML += `

<article
    class="goal-card-small"
    onclick="openGoalDetails(${goal.id})">
    
    <div class="goal-small-header">

        <div class="goal-small-title">

            <div class="goal-small-icon">

                ${goal.icono}

            </div>

            <div>

                <h3>

                    ${goal.nombre}

                </h3>

                <small>

                     

                </small>

            </div>

        </div>

        <div class="goal-small-percent">

            ${porcentaje}%

        </div>

    </div>

    <div class="goal-small-progress">

        <div

            class="goal-small-fill"

            style="width:${porcentaje}%">

        </div>

    </div>

    <div class="goal-small-info">

        <div>

            <small>Ahorrado</small>

            <strong>

                $${goal.ahorrado.toLocaleString("es-CO")}

            </strong>

        </div>

        <div>

            <small>Meta</small>

            <strong>

                $${goal.objetivo.toLocaleString("es-CO")}

            </strong>

        </div>

    </div>

   <div class="goal-small-footer">

    <div>

        <span>

            Te falta

            <strong>

                $${restante.toLocaleString("es-CO")}

            </strong>

        </span>

 <div class="goal-smart-info">

    <div class="goal-smart-item">


        <span>${remainingDays}</span>

    </div>

    <div class="goal-smart-item">

        <span>${advice.text}</span>

    </div>

    ${
        advice.amount
        ? `
        <div class="goal-smart-value">

            $${advice.amount.toLocaleString("es-CO")} / ${advice.period}

        </div>
        `
        : ""
    }

</div>

    </div>

    <div class="goal-actions">

           <button
    class="goal-action edit"
    title="Editar objetivo"
    onclick="editGoal(${goal.id})">

    <i class="fa-solid fa-pen"></i>

</button>

          <button

    class="goal-action star"

    title="Convertir en principal"

    onclick="setMainGoal(${goal.id})">

    <i class="fa-solid fa-star"></i>

</button>

            <button

    class="goal-action delete"

    title="Eliminar"

    onclick="deleteGoal(${goal.id})">

    <i class="fa-solid fa-trash"></i>

</button>

        </div>

    </div>

</article>

`;

    });

}



/*======================================================
    MODAL OBJETIVOS
======================================================*/

function openGoalModal(){

    const modal = document.getElementById("goal-modal");

    if(modal){

        modal.classList.add("active");

    }

}

function closeGoalModal(){

    const modal = document.getElementById("goal-modal");

    if(modal){

        modal.classList.remove("active");

    }

}

/*======================================================
    FORMATO DINERO OBJETIVOS
======================================================*/

function initGoalMoneyFormatter(){

    const inputs=[

        document.getElementById("goal-target"),

        document.getElementById("goal-saved-input")

    ];

    inputs.forEach(input=>{

        if(!input) return;

        input.addEventListener("input",()=>{

            let value=input.value.replace(/\D/g,"");

            if(value===""){

                input.value="";

                return;

            }

            input.value=Number(value).toLocaleString("es-CO");

        });

    });

}

/*======================================================
    OBTENER VALOR NUMÉRICO
======================================================*/

function getGoalMoneyValue(id){

    return Number(

        document
            .getElementById(id)
            .value
            .replace(/\./g,"")

    )||0;


}


    window.setMainGoal = setMainGoal;

    window.editGoal = editGoal;

    window.deleteGoal = deleteGoal;

    