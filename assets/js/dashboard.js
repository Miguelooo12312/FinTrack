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

    updateMoneyLocations();

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
    const { ingresos, gastos, ahorros } = finTrack.finanzas;
    if(!ingresos) return "Registra tu primer ingreso para empezar a ver recomendaciones.";
    const freeRate = Math.round(Math.max(0, ingresos - gastos - ahorros) / ingresos * 100);
    return freeRate < 15 ? `Después de gastos y ahorro te queda el ${freeRate}% de tus ingresos mensuales.` : `Conservas el ${freeRate}% de tus ingresos después de gastos y ahorro.`;

}

/*======================================================
    MENSAJE INGRESOS
======================================================*/

function getIncomeMessage(){
    const current = getMonthTotals(monthKey());
    const previous = getMonthTotals(shiftMonth(monthKey(), -1));
    const change = percentChange(current.ingresos, previous.ingresos);
    if(!current.ingresos) return "Aún no tienes ingresos registrados este mes.";
    if(change === null) return "Este será tu punto de partida para comparar el próximo mes.";
    return change === 0 ? "Tus ingresos se mantienen frente al mes pasado." : `Tus ingresos van un ${Math.abs(change)}% ${change > 0 ? "por encima" : "por debajo"} del mes pasado.`;

}

/*======================================================
    MENSAJE GASTOS
======================================================*/

function getExpenseMessage(){
    const totals = getMonthTotals(monthKey());
    const categories = getExpenseCategories(monthKey());
    const top = Object.entries(categories).sort((a,b) => b[1] - a[1])[0];
    if(!totals.gastos) return "Aún no hay gastos; tu análisis se activará al registrar el primero.";
    if(totals.gastos > totals.ingresos) return "Tus gastos superan los ingresos del mes: revisa el detalle en Estadísticas.";
    return top ? `${top[0]} es tu categoría con mayor impacto este mes.` : "Tus gastos están dentro de lo registrado para este mes.";

}

/*======================================================
    MENSAJE AHORROS
======================================================*/

function getSavingMessage(){
    const mainGoal = finTrack.objetivos.find(goal => goal.principal) || finTrack.objetivos[0];
    if(!mainGoal) return "Crea un objetivo para darle dirección a tus ahorros.";
    const progress = Math.min(100, Math.round(mainGoal.ahorrado / mainGoal.objetivo * 100));
    const advice = getGoalAdvice(mainGoal);
    return `${mainGoal.icono || "🎯"} ${mainGoal.nombre} va en ${progress}%. ${advice.amount ? `Próximo ritmo sugerido: ${formatMoney(advice.amount)} por ${advice.period}.` : advice.text}`;

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

/* Saldo acumulado por medio. Un ahorro sale del medio elegido y queda
   representado en la meta, por lo que no se suma como dinero disponible. */
function getMoneyLocations(){
    const totals = finTrack.movimientos.reduce((totals, movement) => {
        if(!["efectivo", "digital"].includes(movement.medio)){
            totals.sinClasificar++;
            return totals;
        }
        const change = ["ingreso", "recuperacion"].includes(movement.tipo) ? movement.monto : -movement.monto;
        totals[movement.medio] += change;
        return totals;
    }, { efectivo:0, digital:0, sinClasificar:0 });
    (finTrack.transferencias || []).forEach(item => { totals.digital -= item.monto; totals.efectivo += item.monto; });
    return totals;
}

function getOutstandingLoans(){ return finTrack.movimientos.filter(item => item.tipo === "prestamo" && !item.pagado); }

function confirmLoanRepayment(id){
    openLoanPayment("lend", id);
}

function updateMoneyLocations(){
    const totals = getMoneyLocations();
    document.getElementById("cash-balance").textContent = formatMoney(totals.efectivo);
    document.getElementById("digital-balance").textContent = formatMoney(totals.digital);
    const lent = getOutstandingLoans().reduce((sum, loan) => sum + Math.max(0,loan.monto-(Number(loan.montoPagado)||0)), 0);
    document.getElementById("lent-balance").textContent = formatMoney(lent);
    const message = document.getElementById("funds-message");
    message.textContent = totals.sinClasificar
        ? `${totals.sinClasificar} movimiento${totals.sinClasificar === 1 ? "" : "s"} sin clasificar. Edítalo${totals.sinClasificar === 1 ? "" : "s"} desde el historial para tener el total exacto.`
        : "Todos tus movimientos están clasificados por medio.";
}

function openWithdrawMoney(){
    const available = getMoneyLocations().digital;
    document.getElementById("withdraw-available-amount").textContent = formatMoney(available);
    document.getElementById("withdraw-amount").value = "";
    document.getElementById("withdraw-modal").classList.add("active");
}

function confirmWithdrawMoney(){
    const available = getMoneyLocations().digital;
    const monto = Number(document.getElementById("withdraw-amount").value.replace(/\D/g, ""));
    if(!monto || monto <= 0 || monto > available) return alert("Escribe un valor válido que no supere tu dinero digital disponible.");
    finTrack.transferencias.push({id:crypto.randomUUID(), monto, fecha:new Date().toISOString().slice(0,10)});
    saveData(finTrack); updateMoneyLocations(); document.getElementById("withdraw-modal").classList.remove("active");
}

function initMoneyActions(){
    document.getElementById("withdraw-money")?.addEventListener("click", openWithdrawMoney);
    document.getElementById("confirm-withdraw")?.addEventListener("click", confirmWithdrawMoney);
    document.getElementById("close-withdraw-modal")?.addEventListener("click", () => document.getElementById("withdraw-modal").classList.remove("active"));
    document.getElementById("cancel-withdraw")?.addEventListener("click", () => document.getElementById("withdraw-modal").classList.remove("active"));
    document.getElementById("withdraw-amount")?.addEventListener("input", event => { const raw=event.target.value.replace(/\D/g,""); event.target.value=raw ? "$"+Number(raw).toLocaleString("es-CO") : ""; });
    document.getElementById("lend-money")?.addEventListener("click", () => { document.getElementById("nav-prestamos")?.click(); document.querySelector('[data-loan-mode="lend"]')?.click(); });
}

function checkDueLoans(){
    const today = new Date().toISOString().slice(0,10);
    getOutstandingLoans().filter(loan => loan.fechaLimite === today).forEach(loan => {
        const key = `fintrack-loan-alert-${loan.id}-${today}`;
        if(sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "shown");
        window.setTimeout(() => confirmLoanRepayment(loan.id), 250);
    });
}
