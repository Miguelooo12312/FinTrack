/*======================================================
    FinTrack v1.3
    Archivo: app.js
======================================================*/

"use strict";

document.addEventListener("DOMContentLoaded", () => {

updateHeader();

updateDashboard();

renderHistory();

initMovementModal();

initNavigation();

initDashboardShortcuts();

updateQuickAction("dashboard");
    
showMonthlySummary();

renderGoal();

initGoalMoneyFormatter();

initMaintenanceModal();



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

