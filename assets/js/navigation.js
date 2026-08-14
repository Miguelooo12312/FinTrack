/*======================================================
    FinTrack
    navigation.js
======================================================*/

"use strict";

/*======================================================
    BOTÓN PRINCIPAL
======================================================*/

function updateQuickAction(page){

    const button = document.getElementById("quick-action");

    switch(page){

        case "dashboard":

        case "historial":

            button.style.display="flex";

            button.innerHTML=`
                <i class="fa-solid fa-plus"></i>
                Nuevo movimiento
            `;

            button.onclick=openModal;

        break;

       case "objetivos":

    button.style.display = "flex";

    button.innerHTML = `
        <i class="fa-solid fa-bullseye"></i>
        Nuevo objetivo
    `;

    button.onclick = openGoalModal;

break;

case "moto":

    button.style.display = "flex";

    button.innerHTML = `
        <i class="fa-solid fa-screwdriver-wrench"></i>
        Nuevo mantenimiento
    `;

    button.onclick = () => {

    console.log("CLICK MOTO");

    openMaintenanceModal();

};

break;

        default:

            button.style.display="none";

    }

}

/*======================================================
    MOSTRAR PÁGINA
======================================================*/

function showPage(pageId){

    document
        .querySelectorAll(".page")
        .forEach(page=>{

            page.classList.add("hidden");

        });

    const selectedPage=document.getElementById(pageId);

    if(selectedPage){

        selectedPage.classList.remove("hidden");

    }

}

/*======================================================
    NAVEGACIÓN
======================================================*/

function initNavigation(){

    const menuItems=document.querySelectorAll(".menu li");

    const pages={

        dashboard:"dashboard-page",

        objetivos:"goals-page",

        historial:"history-page",

        moto:"moto-page",

        estadisticas:"stats-page",

        asistente:"assistant-page",

        configuracion:"settings-page"

    };

    menuItems.forEach(item=>{

        item.addEventListener("click",()=>{

            menuItems.forEach(li=>{

                li.classList.remove("active");

            });

            item.classList.add("active");

            const page = item.dataset.page;

showPage(

    pages[page]

);

if(page === "moto"){

    renderMoto();

}

updateQuickAction(page);

document.getElementById("page-title").textContent =

    item.querySelector("span").textContent;

        });

    });

  showPage("dashboard-page");

updateQuickAction("dashboard");

}

