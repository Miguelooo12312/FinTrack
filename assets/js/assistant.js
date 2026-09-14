"use strict";

function assistantMoney(value){ return formatMoney(value); }

function addAssistantMessage(text, role = "assistant"){
    const container = document.getElementById("assistant-messages");
    if(!container) return;
    const message = document.createElement("div");
    message.className = `assistant-message ${role}`;
    message.textContent = text;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
}

function getAssistantWelcome(){
    const name = finTrack.usuario.nombre || "";
    const movements = finTrack.movimientos.length;
    return `Hola${name ? `, ${name}` : ""}. Soy tu asistente de FinTrack. Tengo acceso a tus ${movements} movimiento${movements === 1 ? "" : "s"} locales para ayudarte a entenderlos y actuar más rápido.`;
}

function getTopExpenseAnswer(){
    const totals = getMonthTotals(monthKey());
    const categories = getExpenseCategories(monthKey());
    const top = Object.entries(categories).sort((a,b) => b[1] - a[1])[0];
    if(!totals.gastos) return "Aún no registras gastos este mes. Cuando agregues alguno, podré detectar tus categorías principales.";
    return top ? `Llevas ${assistantMoney(totals.gastos)} en gastos este mes. Tu categoría principal es ${top[0]} con ${assistantMoney(top[1])}.` : `Llevas ${assistantMoney(totals.gastos)} en gastos este mes.`;
}

function getHistoricalExpenseAnswer(){
    const largest = getLargestExpense();
    if(!largest) return "Aún no hay gastos registrados. Cuando tengas datos, podré encontrar el gasto más alto de toda tu historia.";
    return `Tu gasto más alto de todo el historial fue ${assistantMoney(largest.monto)} en ${largest.categoria || "Sin categoría"}, el ${largest.fecha || "día sin fecha"}.${largest.descripcion ? ` Fue: “${largest.descripcion}”.` : ""}`;
}

function getComparisonAnswer(){
    const current=getMonthTotals(monthKey()), previous=getMonthTotals(shiftMonth(monthKey(),-1));
    const income=percentChange(current.ingresos,previous.ingresos), expense=percentChange(current.gastos,previous.gastos);
    const phrase=(value,label)=>value===null ? `No hay ${label} del mes anterior para comparar` : `${label} ${Math.abs(value)}% ${value>0?"por encima":"por debajo"}`;
    return `Comparando con el mes pasado: ${phrase(income,"ingresos")} y ${phrase(expense,"gastos")}. Este mes te quedan ${assistantMoney(current.ingresos-current.gastos-current.ahorros)} después de gastos y ahorros.`;
}

function getGoalsAnswer(){
    if(!finTrack.objetivos.length) return "Todavía no tienes objetivos. Puedes escribirme “agrega un objetivo” para crear el primero.";
    const main = finTrack.objetivos.find(goal => goal.principal) || finTrack.objetivos[0];
    const percent = Math.min(100, Math.round(main.ahorrado / main.objetivo * 100));
    const advice = getGoalAdvice(main);
    return `Tu meta principal es ${main.icono || "🎯"} ${main.nombre}: llevas ${percent}% y te faltan ${assistantMoney(getRemainingAmount(main))}. ${advice.text}${advice.amount ? ` Te conviene separar ${assistantMoney(advice.amount)} por ${advice.period}.` : ""}`;
}

function getVehicleAnswer(){
    const { vehicle, pending } = getVehicleAnalytics();
    const next = pending[0];
    const name = [vehicle.marca, vehicle.modelo].filter(Boolean).join(" ") || "tu vehículo";
    if(!next) return `${name} registra ${(vehicle.kilometraje || 0).toLocaleString("es-CO")} km. Aún no hay un mantenimiento próximo programado.`;
    return next.remaining <= 0
        ? `${name} tiene pendiente el mantenimiento de ${next.type}: está vencido por ${Math.abs(next.remaining).toLocaleString("es-CO")} km.`
        : `${name} lleva ${(vehicle.kilometraje || 0).toLocaleString("es-CO")} km. El próximo mantenimiento es ${next.type} en ${next.remaining.toLocaleString("es-CO")} km.`;
}

function openAssistantMovement(type){
    showPage("dashboard-page");
    openModal();
    document.querySelector(`[data-type="${type}"]`)?.click();
}

function handleAssistantCommand(rawQuery){
    const query = rawQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if(!query) return "Escríbeme una pregunta o una acción que quieras realizar.";

    const categoryMatch = query.match(/agrega(?:r)?\s+(?:una\s+)?categoria\s+de\s+(ingreso|gasto)\s+(.+)/);
    if(categoryMatch){
        const type = categoryMatch[1] === "ingreso" ? "ingresos" : "gastos";
        const category = categoryMatch[2].trim().replace(/[.!?]+$/, "");
        if(!category) return "Dime el nombre de la categoría. Por ejemplo: “agrega categoría de gasto mascotas”.";
        const list = finTrack.categorias[type] ||= [];
        if(list.some(item => item.toLowerCase() === category.toLowerCase())) return `La categoría “${category}” ya existe en ${type}.`;
        list.push(category);
        saveData(finTrack);
        renderCategorySettings?.();
        return `Listo: agregué “${category}” a tus categorías de ${type}.`;
    }

    if(/actualiza|refresca/.test(query) && /resumen|dashboard|tarjeta/.test(query)){
        updateDashboard();
        return "Listo, actualicé el resumen y las tarjetas del dashboard con tus datos actuales.";
    }
    if(/agrega|nuevo|registrar/.test(query) && /objetivo|meta/.test(query)){
        openGoalModal();
        return "Abrí el formulario para crear tu nuevo objetivo.";
    }
    if(/agrega|nuevo|registrar/.test(query) && /ingreso/.test(query)){
        openAssistantMovement("ingreso");
        return "Abrí un nuevo ingreso. Completa el monto, categoría, medio y fecha para guardarlo.";
    }
    if(/agrega|nuevo|registrar/.test(query) && /gasto/.test(query)){
        openAssistantMovement("gasto");
        return "Abrí un nuevo gasto. Recuerda seleccionar cómo lo pagaste.";
    }
    if(/agrega|nuevo|registrar/.test(query) && /ahorro/.test(query)){
        openAssistantMovement("ahorro");
        return "Abrí un nuevo ahorro. Debes elegir el objetivo al que irá ese dinero.";
    }
    if(/mayor.*gasto|gasto.*mayor|historico|historia/.test(query)) return getHistoricalExpenseAnswer();
    if(/compar|ultimo.*mes|mes.*pasado|tendencia/.test(query)) return getComparisonAnswer();
    if(/vehiculo|moto|mantenimiento|aceite|kilometraje/.test(query)) return getVehicleAnswer();
    if(/objetivo|meta|ahorro/.test(query)) return getGoalsAnswer();
    if(/efectivo|digital|plataforma/.test(query)){
        const locations = getMoneyLocations();
        return `Tienes ${assistantMoney(locations.efectivo)} en efectivo y ${assistantMoney(locations.digital)} en plataformas digitales.${locations.sinClasificar ? ` Hay ${locations.sinClasificar} movimiento${locations.sinClasificar === 1 ? "" : "s"} pendiente${locations.sinClasificar === 1 ? "" : "s"} de clasificar.` : ""}`;
    }
    if(/gasto|gaste|gastar|categoria/.test(query)) return getTopExpenseAnswer();
    if(/ingreso|saldo|dinero|balance/.test(query)){
        const totals = getMonthTotals(monthKey());
        return `Este mes registras ${assistantMoney(totals.ingresos)} en ingresos, ${assistantMoney(totals.gastos)} en gastos y ${assistantMoney(totals.ahorros)} en ahorros. Tu saldo mensual es ${assistantMoney(totals.ingresos - totals.gastos - totals.ahorros)}.`;
    }
    if(/hola|ayuda|puedes hacer/.test(query)) return "Claro. Puedo comparar ingresos y gastos, encontrar tu gasto histórico más alto, explicarte objetivos y vehículo, crear movimientos u objetivos, y gestionar categorías. Dime lo que necesitas con tus propias palabras.";
    return "No estoy seguro de haber entendido eso, pero puedo ayudarte. Prueba con “compara mis meses”, “¿cuál fue mi mayor gasto?”, “¿cómo va mi meta?” o “agrega un gasto”.";
}

function initAssistant(){
    const form = document.getElementById("assistant-form");
    const input = document.getElementById("assistant-input");
    if(!form || !input) return;
    document.getElementById("assistant-messages").innerHTML = "";
    addAssistantMessage(getAssistantWelcome());
    form.addEventListener("submit", event => {
        event.preventDefault();
        const query = input.value.trim();
        if(!query) return;
        addAssistantMessage(query, "user");
        input.value = "";
        addAssistantMessage(handleAssistantCommand(query));
    });
    document.querySelectorAll("#assistant-suggestions [data-query]").forEach(button => button.addEventListener("click", () => {
        const query = button.dataset.query;
        addAssistantMessage(query, "user");
        addAssistantMessage(handleAssistantCommand(query));
    }));
}
