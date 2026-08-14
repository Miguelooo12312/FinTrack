/*======================================================
    FinTrack
    history.js
======================================================*/

"use strict";

/*======================================================
    RENDER HISTORIAL
======================================================*/

function renderHistory() {

    const container = document.getElementById("history-list");

    container.innerHTML = "";

    if (finTrack.movimientos.length === 0) {

        container.innerHTML = `

            <div class="history-empty">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <h3>Aún no tienes movimientos</h3>

                <p>Registra tu primer ingreso para comenzar.</p>

            </div>

        `;

        return;

    }

    const months = getMonthlySummary();

    const orderedMonths = Object.keys(months).sort().reverse();

    orderedMonths.forEach(month => {

        const data = months[month];

        const collapsed = collapsedMonths[month] || false;

        const balance = data.ingresos - data.gastos - data.ahorros;

        const section = document.createElement("section");

        section.className = "month-section";

        section.innerHTML = `

           <div
    class="month-header"
    data-month="${month}">

    <div>

        <h2>

            ${collapsed ? "▶" : "▼"}

            ${formatMonth(month)}

        </h2>

        <span>

            ${data.movimientos.length} movimientos

        </span>

    </div>

    <div class="month-summary">

    <span class="income">

        +$${data.ingresos.toLocaleString("es-CO")}

    </span>

    <span class="expense">

        -$${data.gastos.toLocaleString("es-CO")}

    </span>

    <span class="saving">

        +$${data.ahorros.toLocaleString("es-CO")}

    </span>

    <strong>

        Balance

        $${balance.toLocaleString("es-CO")}

    </strong>

</div>

        `;

      container.appendChild(section);

if (collapsed) {

    return;

}

       const movements = [...data.movimientos]

.reverse()

.filter(movement=>{

    /*==========================
        FILTRO
    ==========================*/

    if(

        historyFilter!=="todos" &&

        movement.tipo!==historyFilter

    ){

        return false;

    }

    /*==========================
        BUSCADOR
    ==========================*/

    if(historySearch===""){

        return true;

    }

    const text=(

        (movement.descripcion || "")+

        " "+

        movement.categoria+

        " "+

        movement.tipo+

        " "+

        movement.monto

    ).toLowerCase();

    return text.includes(

        historySearch.toLowerCase()

    );

});

        movements.forEach(movement => {

            const card = document.createElement("article");

            card.className = "history-card";

            let icon = "";

            let color = "";

            let sign = "";

            switch (movement.tipo) {

                case "ingreso":

                    icon = "fa-money-bill-trend-up";

                    color = "income";

                    sign = "+";

                break;

                case "gasto":

                    icon = "fa-credit-card";

                    color = "expense";

                    sign = "-";

                break;

                case "ahorro":

                    icon = "fa-piggy-bank";

                    color = "saving";

                    sign = "+";

                break;

            }

            card.innerHTML = `

                <div class="history-icon ${color}">

                    <i class="fa-solid ${icon}"></i>

                </div>

                <div class="history-info">

                    <h3>${movement.descripcion || movement.categoria}</h3>

                    <p>${movement.categoria}</p>

                </div>

                <div class="history-value">

                    ${sign}$${movement.monto.toLocaleString("es-CO")}

                </div>

                <div class="history-actions">

                    <button class="edit-btn" data-id="${movement.id}">

                        <i class="fa-solid fa-pen"></i>

                    </button>

                    <button class="delete-btn" data-id="${movement.id}">

                        <i class="fa-solid fa-trash"></i>

                    </button>

                </div>

            `;

            container.appendChild(card);

        });

    });

    document

        .querySelectorAll(".delete-btn")

        .forEach(button => {

            button.onclick = () => {

                deleteMovement(

                    Number(button.dataset.id)

                );

            };

        });

    document

        .querySelectorAll(".edit-btn")

        .forEach(button => {

            button.onclick = () => {

                editMovement(

                    Number(button.dataset.id)

                );

            };

        });

        /*======================================================
    EVENTO ABRIR / CERRAR MES
======================================================*/

document
    .querySelectorAll(".month-header")
    .forEach(header => {

        header.onclick = () => {

            toggleMonth(

                header.dataset.month

            );

        };

    });

}

/*======================================================
    BUSCADOR
======================================================*/

const search=document.getElementById("history-search");

if(search){

    search.oninput=(e)=>{

        historySearch=e.target.value;

        renderHistory();

    };

}

/*======================================================
    FILTRO
======================================================*/

const filter = document.getElementById("history-filter");

if(filter){

    filter.onchange=(e)=>{

        historyFilter=e.target.value;

        renderHistory();

    };

}


/*======================================================
    OBTENER RESUMEN POR MES
======================================================*/

function getMonthlySummary() {

    const summary = {};

    finTrack.movimientos.forEach(movement => {

        const month = movement.fecha.substring(0, 7);

        if (!summary[month]) {

            summary[month] = {

                ingresos: 0,

                gastos: 0,

                ahorros: 0,

                movimientos: []

            };

        }

        summary[month].movimientos.push(movement);

        switch (movement.tipo) {

            case "ingreso":

                summary[month].ingresos += movement.monto;

                break;

            case "gasto":

                summary[month].gastos += movement.monto;

                break;

            case "ahorro":

                summary[month].ahorros += movement.monto;

                break;

        }

    });

    return summary;

}

/*======================================================
    DEBUG RESUMEN MENSUAL
======================================================*/

function showMonthlySummary() {

    console.table(getMonthlySummary());

}

/*======================================================
    ESTADO DE LOS MESES
======================================================*/

const collapsedMonths = {};

/*======================================================
    FILTRO DE BÚSQUEDA
======================================================*/

let historySearch = "";

/*======================================================
    FILTRO DE HISTORIAL
======================================================*/

let historyFilter = "todos";

/*======================================================
    ABRIR / CERRAR MES
======================================================*/

function toggleMonth(month){

    collapsedMonths[month] = !collapsedMonths[month];

    renderHistory();

}

/*======================================================
    FORMATEAR MES
======================================================*/

function formatMonth(month){

    const months=[

        "Enero",

        "Febrero",

        "Marzo",

        "Abril",

        "Mayo",

        "Junio",

        "Julio",

        "Agosto",

        "Septiembre",

        "Octubre",

        "Noviembre",

        "Diciembre"

    ];

    const parts=month.split("-");

    return months[Number(parts[1])-1]+" "+parts[0];

}