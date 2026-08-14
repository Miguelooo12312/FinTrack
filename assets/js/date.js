/*======================================================
    FinTrack v1.1
    Archivo: date.js

    Descripción:
    Fecha actual y saludo dinámico.

======================================================*/

"use strict";

/*======================================================
    OBTENER SALUDO
======================================================*/

function getGreeting() {

    const hora = new Date().getHours();

    if (hora >= 5 && hora < 12) {

        return "☀️ Buenos días";

    }

    if (hora >= 12 && hora < 19) {

        return "🌤️ Buenas tardes";

    }

    return "🌙 Buenas noches";

}

/*======================================================
    FORMATEAR FECHA
======================================================*/

function getCurrentDate() {

    const fecha = new Date();

    return fecha.toLocaleDateString("es-CO", {

        weekday: "long",

        year: "numeric",

        month: "long",

        day: "numeric"

    });

}

/*======================================================
    ACTUALIZAR ENCABEZADO
======================================================*/

function updateHeader() {

    const greetingElement = document.getElementById("greeting");

    const dateElement = document.getElementById("current-date");

    greetingElement.innerHTML = `
        ${getGreeting()}, ${finTrack.usuario.nombre} 👋
    `;

    dateElement.textContent = getCurrentDate();

}