/*======================================================
    FinTrack v1.3
    Archivo: app.js
======================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

const moneyActions=document.getElementById("money-actions");
if(moneyActions) document.body.appendChild(moneyActions);

recalculateFinances();

updateHeader();

updateDashboard();

renderHistory();

initMovementModal();

initNavigation();

initDashboardShortcuts();
initMoneyActions();
initLoans();
renderLoans();

updateQuickAction("dashboard");
    
showMonthlySummary();

renderGoal();

initGoalMoneyFormatter();

initMaintenanceModal();

initAssistant();

initSettings();

initAuthModal();



document
    .getElementById("close-goal-modal")
    .addEventListener(
        "click",
        closeGoalModal
    );

  
    document
        .getElementById("close-modal")
        .addEventListener("click", closeModal);

        document
.getElementById("cancel-goal")
.addEventListener(
    "click",
    closeGoalModal
);

document
.getElementById("close-goal-modal")
.addEventListener(
    "click",
    closeGoalModal
);

document
.getElementById("save-goal")
.addEventListener(
    "click",
    saveGoal
);

});

