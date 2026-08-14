"use strict";

/*======================================================
    FINTRACK DATE ENGINE
======================================================*/

/*======================================================
    OBTENER PARTES DE UNA FECHA YYYY-MM-DD
======================================================*/

function getDateParts(dateString){

    const [year,month,day] =

        dateString.split("-").map(Number);

    return{

        year,

        month,

        day

    };

}

/*======================================================
    FECHA ACTUAL
======================================================*/

function getTodayParts(){

    const today = new Date();

    return{

        year:today.getFullYear(),

        month:today.getMonth()+1,

        day:today.getDate()

    };

}

/*======================================================
    ES DEL MES ACTUAL
======================================================*/

function isCurrentMonth(dateString){

    const date = getDateParts(dateString);

    const today = getTodayParts();

    return(

        date.year===today.year &&

        date.month===today.month

    );

}

/*======================================================
    ES EL MISMO MES
======================================================*/

function isSameMonth(dateA,dateB){

    const a = getDateParts(dateA);

    const b = getDateParts(dateB);

    return(

        a.year===b.year &&

        a.month===b.month

    );

}