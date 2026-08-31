"use strict";

/* Análisis local: interpreta los datos guardados por el usuario sin enviarlos a terceros. */
function getRemainingDays(goal){
    if(!goal || !goal.fechaObjetivo) return null;
    return Math.ceil((new Date(goal.fechaObjetivo) - new Date()) / (1000 * 60 * 60 * 24));
}
function getRemainingAmount(goal){ return goal ? Math.max(goal.objetivo - goal.ahorrado, 0) : 0; }
function getGoalAdvice(goal){
    const days = getRemainingDays(goal), remaining = getRemainingAmount(goal);
    if(goal.ahorrado >= goal.objetivo) return {type:"completed", text:"🎉 Objetivo completado"};
    if(days === null) return {type:"nofinish", text:"Sin fecha límite"};
    if(days <= 0) return {type:"expired", text:"🚨 Objetivo vencido"};
    if(days <= 7) return {type:"daily", text:`⚠️ Solo quedan ${days} días`, amount:Math.ceil(remaining / days), period:"día"};
    if(days <= 30) return {type:"daily", text:"📅 Necesitas ahorrar diariamente", amount:Math.ceil(remaining / days), period:"día"};
    return {type:"monthly", text:"Ahorra aproximadamente", amount:Math.ceil(remaining / (days / 30.44)), period:"mes"};
}
function getCurrentMonthSavings(){ return getMonthTotals(monthKey()).ahorros; }
function getRemainingDaysText(goal){
    const days = getRemainingDays(goal);
    if(days === null) return "Sin fecha límite";
    if(days > 1) return `⏳ Quedan ${days} días`;
    if(days === 1) return "⏳ Queda 1 día";
    if(days === 0) return "⚠️ Vence hoy";
    return `🚨 Venció hace ${Math.abs(days)} días`;
}
function generateDashboardInsights(){
    const insights = getGoalInsights();
    const totals = getMonthTotals(monthKey());
    const categories = getExpenseCategories(monthKey());
    const top = Object.entries(categories).sort((a,b) => b[1] - a[1])[0];
    if(top) insights.unshift(`💡 ${top[0]} concentra ${Math.round(top[1] / totals.gastos * 100)}% de tus gastos este mes.`);
    if(totals.ingresos && totals.ahorros) insights.push(`🌱 Convertiste el ${Math.round(totals.ahorros / totals.ingresos * 100)}% de tus ingresos en ahorro.`);
    const locations = getMoneyLocations();
    if(locations.sinClasificar) insights.push(`🧾 Te faltan ${locations.sinClasificar} movimiento${locations.sinClasificar === 1 ? "" : "s"} por clasificar entre efectivo y digital.`);
    return insights.slice(0, 4);
}
function getGoalInsights(){
    const insights = [];
    finTrack.objetivos.forEach(goal => {
        const days = getRemainingDays(goal);
        if(days === null) return;
        if(goal.ahorrado >= goal.objetivo){ insights.push(`🎉 Ya cumpliste la meta "${goal.nombre}".`); return; }
        insights.push(days <= 30 ? `🚨 La meta "${goal.nombre}" vence en ${days} días.` : `🎯 Te faltan ${days} días para "${goal.nombre}".`);
    });
    return insights;
}
function formatCompactMoney(value){ return formatMoney(value).replace(",00", ""); }
function monthKey(date = new Date()){ return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function shiftMonth(key, amount){ const [year, month] = key.split("-").map(Number); return monthKey(new Date(year, month - 1 + amount, 1)); }

function getMonthTotals(key){
    return finTrack.movimientos.reduce((total, movement) => {
        if((movement.fecha || "").slice(0, 7) !== key) return total;
        if(movement.tipo === "ingreso") total.ingresos += movement.monto;
        if(movement.tipo === "gasto") total.gastos += movement.monto;
        if(movement.tipo === "ahorro") total.ahorros += movement.monto;
        return total;
    }, { ingresos:0, gastos:0, ahorros:0 });
}

function getExpenseCategories(key){
    return finTrack.movimientos.reduce((categories, movement) => {
        if(movement.tipo !== "gasto" || (movement.fecha || "").slice(0, 7) !== key) return categories;
        const category = movement.categoria || "Sin categoría";
        categories[category] = (categories[category] || 0) + movement.monto;
        return categories;
    }, {});
}

function percentChange(current, previous){ return previous ? Math.round(((current - previous) / previous) * 100) : null; }

function buildFinancialInsights(current, previous, categories){
    const insights = [];
    const change = percentChange(current.gastos, previous.gastos);
    if(change !== null){
        insights.push(change === 0 ? "Tus gastos se mantuvieron iguales a los del mes pasado." : `Este mes gastaste un ${Math.abs(change)}% ${change > 0 ? "más" : "menos"} que el mes pasado.`);
    }
    if(current.ingresos > 0) insights.push(`Destinaste el ${Math.round(current.ahorros / current.ingresos * 100)}% de tus ingresos al ahorro este mes.`);
    const top = Object.entries(categories).sort((a,b) => b[1] - a[1])[0];
    if(top) insights.push(`${top[0]} es tu mayor gasto: ${formatCompactMoney(top[1])}, equivalente al ${current.gastos ? Math.round(top[1] / current.gastos * 100) : 0}% del total.`);
    return insights.length ? insights : ["Registra ingresos, gastos o ahorros para recibir un análisis personalizado."];
}

function getVehicleAnalytics(){
    const vehicle = finTrack.moto || {};
    const reminders = vehicle.recordatorios || {};
    const pending = Object.entries(reminders).filter(([type, reminder]) => ["aceite", "pastillas", "kit"].includes(type) && reminder.proximoCambioKm > 0).map(([type, reminder]) => ({ type, remaining:reminder.proximoCambioKm - (vehicle.kilometraje || 0), nextKm:reminder.proximoCambioKm })).sort((a,b) => a.remaining - b.remaining);
    return { vehicle, records:vehicle.historial || [], pending };
}

function createBars(values, colorClass = "red"){
    const max = Math.max(...values.map(item => item.value), 1);
    return values.map(item => `<div class="chart-row"><span>${item.label}</span><div class="chart-track"><i class="${colorClass}" style="width:${Math.max(item.value / max * 100, 2)}%"></i></div><strong>${item.display || formatCompactMoney(item.value)}</strong></div>`).join("");
}

function renderAnalytics(){
    const container = document.getElementById("stats-page");
    if(!container) return;
    const currentKey = monthKey(), previousKey = shiftMonth(currentKey, -1);
    const current = getMonthTotals(currentKey), previous = getMonthTotals(previousKey), categories = getExpenseCategories(currentKey);
    const categoryValues = Object.entries(categories).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([label, value]) => ({label, value}));
    const lastSixMonths = Array.from({length:6}, (_, index) => shiftMonth(currentKey, index - 5)).map(key => ({ label:formatMonth(key).slice(0,3), value:getMonthTotals(key).gastos, display:formatCompactMoney(getMonthTotals(key).gastos) }));
    const vehicleData = getVehicleAnalytics(), next = vehicleData.pending[0];
    const vehicleName = [vehicleData.vehicle.marca, vehicleData.vehicle.modelo].filter(Boolean).join(" ") || "tu vehículo";
    const maintenanceByType = vehicleData.records.reduce((data, record) => { data[record.tipo || "otro"] = (data[record.tipo || "otro"] || 0) + 1; return data; }, {});
    const maintenanceValues = Object.entries(maintenanceByType).map(([type,value]) => ({ label:type[0].toUpperCase() + type.slice(1), value, display:`${value} registro${value === 1 ? "" : "s"}` }));
    const change = percentChange(current.gastos, previous.gastos);

    container.innerHTML = `
        <div class="page-header stats-heading"><h2>Estadísticas</h2><p>Análisis inteligente de tus finanzas y de ${vehicleName}.</p></div>
        <section class="stats-section">
            <div class="stats-section-title"><span class="section-icon finance"><i class="fa-solid fa-chart-line"></i></span><div><h2>Información económica</h2><p>Tu comportamiento financiero durante ${formatMonth(currentKey)}.</p></div></div>
            <div class="analytics-kpis"><article><span>Ingresos</span><strong>${formatCompactMoney(current.ingresos)}</strong><small>Este mes</small></article><article><span>Gastos</span><strong>${formatCompactMoney(current.gastos)}</strong><small>${change === null ? "Sin comparación previa" : `${Math.abs(change)}% vs. mes pasado`}</small></article><article><span>Ahorro</span><strong>${formatCompactMoney(current.ahorros)}</strong><small>${current.ingresos ? `${Math.round(current.ahorros / current.ingresos * 100)}% de tus ingresos` : "Registra ingresos"}</small></article></div>
            <div class="analytics-grid"><article class="analytics-panel"><h3>Gastos de los últimos 6 meses</h3><div class="bar-chart">${createBars(lastSixMonths, "orange")}</div></article><article class="analytics-panel"><h3>Gastos por categoría</h3><div class="bar-chart">${categoryValues.length ? createBars(categoryValues) : '<p class="analytics-empty">Todavía no hay gastos este mes.</p>'}</div></article></div>
            <div class="insights-panel"><div><i class="fa-solid fa-wand-magic-sparkles"></i><h3>Lectura de FinTrack IA</h3></div><ul>${buildFinancialInsights(current, previous, categories).map(text => `<li>${text}</li>`).join("")}</ul></div>
        </section>
        <section class="stats-section vehicle-stats-section">
            <div class="stats-section-title"><span class="section-icon vehicle"><i class="fa-solid fa-motorcycle"></i></span><div><h2>Información del vehículo</h2><p>Estado y próximos cuidados de ${vehicleName}.</p></div></div>
            <div class="analytics-kpis vehicle-kpis"><article><span>Kilometraje actual</span><strong>${(vehicleData.vehicle.kilometraje || 0).toLocaleString("es-CO")} km</strong><small>${vehicleData.records.length} mantenimientos registrados</small></article><article><span>Próximo mantenimiento</span><strong>${next ? next.type[0].toUpperCase() + next.type.slice(1) : "Sin programar"}</strong><small>${next ? (next.remaining <= 0 ? "Ya requiere atención" : `Faltan ${next.remaining.toLocaleString("es-CO")} km`) : "Agrega un mantenimiento"}</small></article><article><span>Estado preventivo</span><strong>${next && next.remaining <= 0 ? "Pendiente" : "Al día"}</strong><small>${next ? `Próximo a los ${next.nextKm.toLocaleString("es-CO")} km` : "Sin alertas"}</small></article></div>
            <div class="analytics-grid"><article class="analytics-panel"><h3>Historial de mantenimiento</h3><div class="bar-chart">${maintenanceValues.length ? createBars(maintenanceValues, "blue") : '<p class="analytics-empty">Aún no has registrado mantenimientos.</p>'}</div></article><article class="analytics-panel vehicle-advice"><h3>Recomendación inteligente</h3><i class="fa-solid fa-screwdriver-wrench"></i><p>${next ? (next.remaining <= 0 ? `Revisa ${next.type}: su mantenimiento está vencido por ${Math.abs(next.remaining).toLocaleString("es-CO")} km.` : `Planea el mantenimiento de ${next.type} en los próximos ${next.remaining.toLocaleString("es-CO")} km.`) : "Registra los mantenimientos para recibir alertas y recomendaciones precisas."}</p></article></div>
        </section>`;
}

window.renderAnalytics = renderAnalytics;
