/*======================================================
    FinTrack v1.2
    Archivo: ui.js

    Funciones visuales reutilizables

======================================================*/

"use strict";

/*======================================================
    FORMATEAR DINERO
======================================================*/

function formatMoney(value) {

    return new Intl.NumberFormat("es-CO", {

        style: "currency",

        currency: "COP",

        minimumFractionDigits: 0

    }).format(value);

}

/*======================================================
    CAMBIAR TEXTO
======================================================*/

function setText(id, value) {

    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = value;

}

/*======================================================
MODAL
======================================================*/

const modal = document.getElementById("movement-modal");

function openModal(){

    modal.classList.add("active");

}

function closeModal(){

    modal.classList.remove("active");

}