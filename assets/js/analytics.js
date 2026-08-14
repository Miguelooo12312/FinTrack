/*======================================================
    OBJETIVOS
======================================================*/

function getRemainingDays(goal){

    if(!goal || !goal.fechaObjetivo){

        return null;

    }

    const today = new Date();

    const targetDate = new Date(goal.fechaObjetivo);

    const difference = targetDate - today;

    return Math.ceil(

        difference / (1000 * 60 * 60 * 24)

    );

}

/*======================================================
    DINERO RESTANTE
======================================================*/

function getRemainingAmount(goal){

    if(!goal){

        return 0;

    }

    return Math.max(

        goal.objetivo - goal.ahorrado,

        0

    );

}

/*======================================================
    PLAN DE AHORRO
======================================================*/

function getGoalAdvice(goal){

    const days = getRemainingDays(goal);

    const remaining = getRemainingAmount(goal);

    if(goal.ahorrado >= goal.objetivo){

        return{

            type:"completed",

            text:"🎉 Objetivo completado"

        };

    }

    if(days === null){

        return{

            type:"nofinish",

            text:"Sin fecha límite"

        };

    }

    if(days <= 0){

        return{

            type:"expired",

            text:"🚨 Objetivo vencido"

        };

    }

   if(days <= 7){

    return{

        type:"daily",

        text:`⚠️ Solo quedan ${days} días`,

        amount:Math.ceil(remaining/days),

        period:"día"

    };

}

    if(days <= 30){

    return{

        type:"daily",

        text:"📅 Necesitas ahorrar diariamente",

        amount:Math.ceil(remaining/days),

        period:"día"

    };

}

    return{

        type:"monthly",

        text:"Ahorra aproximadamente",

        amount:Math.ceil(remaining/(days/30.44)),

        period:"mes"

    };

}
/*======================================================
    AHORRO DEL MES ACTUAL
======================================================*/

function getCurrentMonthSavings(){

    const today = new Date();

    const currentMonth = today.toISOString().substring(0,7);

    let total = 0;

    finTrack.movimientos.forEach(movement=>{

        if(

            movement.tipo === "ahorro"

            &&

            movement.fecha.substring(0,7) === currentMonth

        ){

            total += movement.monto;

        }

    });

    return total;

}

/*======================================================
    MENSAJE DE TIEMPO RESTANTE
======================================================*/

function getRemainingDaysText(goal){

    const days = getRemainingDays(goal);

    if(days === null){

        return "Sin fecha límite";

    }

    if(days > 1){

        return `⏳ Quedan ${days} días`;

    }

    if(days === 1){

        return "⏳ Queda 1 día";

    }

    if(days === 0){

        return "⚠️ Vence hoy";

    }

    return `🚨 Venció hace ${Math.abs(days)} días`;

}

/*======================================================
    DASHBOARD IA
======================================================*/

function generateDashboardInsights(){

    const insights = [];

    insights.push(

        ...getGoalInsights()

    );

    return insights;

}

/*======================================================
    INSIGHTS OBJETIVOS
======================================================*/

function getGoalInsights(){

    const insights = [];

    finTrack.objetivos.forEach(goal=>{

        const days = getRemainingDays(goal);

        if(days === null){

            return;

        }

        if(goal.ahorrado >= goal.objetivo){

            insights.push(

                `🎉 Ya cumpliste la meta "${goal.nombre}".`

            );

            return;

        }

        if(days <= 30){

            insights.push(

                `🚨 La meta "${goal.nombre}" vence en ${days} días.`

            );

        }else{

            insights.push(

                `🎯 Te faltan ${days} días para "${goal.nombre}".`

            );

        }

    });

    return insights;

}