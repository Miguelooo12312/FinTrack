/*======================================================
    ACTUALIZAR DASHBOARD
======================================================*/

function updateDashboard() {

    document.getElementById("saldo").textContent =
        "$" + finTrack.finanzas.saldo.toLocaleString("es-CO");

    document.getElementById("ingresos").textContent =
        "$" + finTrack.finanzas.ingresos.toLocaleString("es-CO");

    document.getElementById("gastos").textContent =
        "$" + finTrack.finanzas.gastos.toLocaleString("es-CO");

    document.getElementById("ahorros").textContent =
        "$" + finTrack.finanzas.ahorros.toLocaleString("es-CO");

        renderDashboardInsights();

        updateDashboardMessages();


}

/*======================================================
    MOVIMIENTOS DEL MES ACTUAL
======================================================*/

function getCurrentMonthMovements(){

    return finTrack.movimientos.filter(

        movement=>isCurrentMonth(

            movement.fecha

        )

    );

}

/*======================================================
    DASHBOARD IA
======================================================*/

function renderDashboardInsights(){

    const container = document.getElementById(

        "dashboard-insights"

    );

    if(!container) return;

    const insights = generateDashboardInsights();

    container.innerHTML = "";

    if(insights.length === 0){

        container.innerHTML = `

            <div class="insight-item">

                👋 Bienvenido a FinTrack.

                A medida que registres movimientos aparecerán recomendaciones aquí.

            </div>

        `;

        return;

    }

    insights.forEach(message=>{

        container.innerHTML += `

            <div class="insight-item">

                ${message}

            </div>

        `;

    });

}

/*======================================================
    MENSAJE SALDO
======================================================*/

function getBalanceMessage(){

    const saldo = finTrack.finanzas.saldo;

    if(saldo <= 0){

        return "🚨 Tu saldo disponible está en cero.";

    }

    if(saldo < 100000){

        return "⚠️ Tu saldo disponible empieza a ser bajo.";

    }

    return "💳 Tienes saldo suficiente para operar con tranquilidad.";

}

/*======================================================
    MENSAJE INGRESOS
======================================================*/

function getIncomeMessage(){

    const ingresos = finTrack.finanzas.ingresos;

    if(ingresos === 0){

        return "👋 Registra tu primer ingreso.";

    }

    return `📈 Has registrado $${ingresos.toLocaleString("es-CO")} en ingresos.`;

}

/*======================================================
    MENSAJE GASTOS
======================================================*/

function getExpenseMessage(){

    const{

        ingresos,

        gastos

    } = finTrack.finanzas;

    if(gastos === 0){

        return "✅ No has registrado gastos.";

    }

    if(gastos > ingresos){

        return "🚨 Este mes gastaste más de lo que ingresaste.";

    }

    return "💸 Tus gastos están bajo control.";

}

/*======================================================
    MENSAJE AHORROS
======================================================*/

function getSavingMessage(){

    const ahorro = finTrack.finanzas.ahorros;

    if(ahorro === 0){

        return "🌱 Empieza a construir tu futuro.";

    }

    return `🎯 Has ahorrado $${ahorro.toLocaleString("es-CO")}.`;

}

/*======================================================
    MENSAJES DINÁMICOS DASHBOARD
======================================================*/

function updateDashboardMessages(){

    document.getElementById(

        "balance-message"

    ).textContent = getBalanceMessage();

    document.getElementById(

        "income-message"

    ).textContent = getIncomeMessage();

    document.getElementById(

        "expense-message"

    ).textContent = getExpenseMessage();

    document.getElementById(

        "saving-message"

    ).textContent = getSavingMessage();

}


/*======================================================
    ATAJOS DASHBOARD
======================================================*/

function initDashboardShortcuts(){

    document.getElementById("income-card")?.addEventListener("click", () => {

        movementType = "ingreso";

        openModal();

        document.querySelector('[data-type="ingreso"]').click();

    });

    document.getElementById("expense-card")?.addEventListener("click", () => {

        movementType = "gasto";

        openModal();

        document.querySelector('[data-type="gasto"]').click();

    });

    document.getElementById("saving-card")?.addEventListener("click", () => {

        movementType = "ahorro";

        openModal();

        document.querySelector('[data-type="ahorro"]').click();

    });

}