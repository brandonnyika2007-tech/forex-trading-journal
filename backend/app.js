
// ======================================
// FOREX TRADING JOURNAL
// MAIN JAVASCRIPT ENGINE
// ======================================


// 1. GET HTML ELEMENTS

const form = document.getElementById("tradeForm");

const tradeList = document.getElementById("tradeList");

const STORAGE_KEY = "trades";


// 2. LOAD SAVED TRADES

let trades = [];

try {
    const savedTrades = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    trades = Array.isArray(savedTrades)
        ? savedTrades
        : [];

} catch (error) {
    console.error("Could not load trades:", error);
}


// 3. HELPER FUNCTIONS

function money(value) {
    return "$" + Math.abs(value).toFixed(2);
}

function dateKey(date) {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function saveTrades() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(trades)
        );
    } catch (error) {
        alert("Could not save trades. Check browser storage.");
        console.error(error);
    }
}


// ======================================
// 4. DISPLAY TRADE HISTORY
// ======================================

function displayTrades() {

    tradeList.innerHTML = "";

    trades.forEach((trade) => {

        const item = document.createElement("div");

        item.className = "trade-item";

        const heading = document.createElement("h3");

        heading.textContent =
            trade.pair + " - " + trade.direction;

        const details = document.createElement("p");

        details.textContent =
            "Entry: " + trade.entry +
            " | Exit: " + trade.exit;

        const date = document.createElement("p");

        date.textContent =
            "Date: " + (trade.tradeDate || "Not recorded");

        const pnl = document.createElement("p");

        const amount = Number(trade.pnl) || 0;

        pnl.textContent =
            "Profit/Loss: " +
            (amount < 0 ? "-" : "") +
            money(amount);

        pnl.className =
            amount > 0 ? "profit" :
            amount < 0 ? "loss" : "";

        const notes = document.createElement("p");

        notes.textContent =
            "Analysis: " + (trade.notes || "No notes");

        item.append(
            heading,
            details,
            date,
            pnl,
            notes
        );

        tradeList.appendChild(item);

    });
}


// ======================================
// 5. DASHBOARD CALCULATIONS
// ======================================

function updateDashboard() {

    const total = trades.length;

    const winning = trades.filter(
        trade => Number(trade.pnl) > 0
    );

    const losing = trades.filter(
        trade => Number(trade.pnl) < 0
    );

    const grossProfit = winning.reduce(
        (sum, trade) => sum + Number(trade.pnl),
        0
    );

    const grossLoss = losing.reduce(
        (sum, trade) => sum + Math.abs(Number(trade.pnl)),
        0
    );

    const netProfit = grossProfit - grossLoss;

    // TOTAL TRADES

    document.getElementById("totalTrades").textContent =
        total;

    // NET PROFIT/LOSS

    const netElement =
        document.getElementById("netProfit");

    netElement.textContent =
        (netProfit < 0 ? "-" : "") + money(netProfit);

    netElement.style.color =
        netProfit >= 0 ? "#22c55e" : "#ef4444";


    // WIN RATE

    const winRate = total > 0
        ? (winning.length / total) * 100
        : 0;

    document.getElementById("winRate").textContent =
        winRate.toFixed(2) + "%";


    // PROFIT FACTOR

    let profitFactor = "0.00";

    if (grossLoss > 0) {

        profitFactor =
            (grossProfit / grossLoss).toFixed(2);

    } else if (grossProfit > 0) {

        profitFactor = "∞";

    }

    document.getElementById("profitFactor").textContent =
        profitFactor;


    // WINNING AND LOSING TRADES

    document.getElementById("winningTrades").textContent =
        winning.length;

    document.getElementById("losingTrades").textContent =
        losing.length;


    // AVERAGE WIN

    const averageWin = winning.length > 0
        ? grossProfit / winning.length
        : 0;

    document.getElementById("averageWin").textContent =
        money(averageWin);


    // AVERAGE LOSS

    const averageLoss = losing.length > 0
        ? grossLoss / losing.length
        : 0;

    document.getElementById("averageLoss").textContent =
        "-" + money(averageLoss);

}


// ======================================
// 6. EQUITY CURVE
// ======================================

let equityChart = null;

function updateEquityCurve() {

    const canvas =
        document.getElementById("equityChart");

    if (typeof Chart === "undefined") {
        console.warn("Chart.js is not loaded.");
        return;
    }

    // Only trades with valid dates

    const datedTrades = trades
        .filter(trade =>
            /^\d{4}-\d{2}-\d{2}$/.test(trade.tradeDate || "")
        )
        .sort((a, b) =>
            a.tradeDate.localeCompare(b.tradeDate)
        );

    let runningProfit = 0;

    const labels = ["Starting point"];

    const values = [0];

    datedTrades.forEach((trade) => {

        runningProfit += Number(trade.pnl);

        labels.push(trade.tradeDate);

        values.push(
            Number(runningProfit.toFixed(2))
        );

    });

    if (equityChart) {
        equityChart.destroy();
    }

    equityChart = new Chart(canvas, {

        type: "line",

        data: {

            labels: labels,

            datasets: [{

                label: "Cumulative Profit/Loss ($)",

                data: values,

                borderColor: "#38bdf8",

                backgroundColor:
                    "rgba(56, 189, 248, 0.12)",

                borderWidth: 2,

                fill: true,

                tension: 0.3

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    labels: {
                        color: "#ffffff"
                    }

                }

            },

            scales: {

                x: {

                    ticks: {
                        color: "#94a3b8"
                    },

                    grid: {
                        color: "#334155"
                    }

                },

                y: {

                    ticks: {
                        color: "#94a3b8"
                    },

                    grid: {
                        color: "#334155"
                    }

                }

            }

        }

    });

}


// ======================================
// 7. TRADING CALENDAR
// ======================================

function updateCalendar() {

    const calendar =
        document.getElementById("tradingCalendar");

    calendar.innerHTML = "";

    const now = new Date();

    const year = now.getFullYear();

    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);

    const daysInMonth =
        new Date(year, month + 1, 0).getDate();


    // MONTH TITLE

    const title = document.createElement("h3");

    title.textContent =
        now.toLocaleString("en", {
            month: "long",
            year: "numeric"
        });

    title.style.marginBottom = "15px";

    calendar.appendChild(title);


    // DAILY PROFIT/LOSS

    const dailyResults = {};

    trades.forEach((trade) => {

        if (!trade.tradeDate) return;

        dailyResults[trade.tradeDate] =
            (dailyResults[trade.tradeDate] || 0) +
            Number(trade.pnl);

    });


    // CALENDAR GRID

    const grid = document.createElement("div");

    grid.style.display = "grid";

    grid.style.gridTemplateColumns =
        "repeat(7, minmax(0, 1fr))";

    grid.style.gap = "5px";


    // WEEKDAY LABELS

    const weekdays = [
        "Sun", "Mon", "Tue", "Wed",
        "Thu", "Fri", "Sat"
    ];

    weekdays.forEach(day => {

        const label = document.createElement("div");

        label.textContent = day;

        label.style.textAlign = "center";

        label.style.fontSize = "11px";

        label.style.color = "#94a3b8";

        grid.appendChild(label);

    });


    // EMPTY DAYS BEFORE THE FIRST DAY

    for (let i = 0; i < firstDay.getDay(); i++) {

        grid.appendChild(document.createElement("div"));

    }


    // CALENDAR DATES

    for (let day = 1; day <= daysInMonth; day++) {

        const date = new Date(year, month, day);

        const key = dateKey(date);

        const result = dailyResults[key];

        const cell = document.createElement("div");

        cell.style.background = "#25364e";

        cell.style.borderRadius = "6px";

        cell.style.padding = "7px 2px";

        cell.style.textAlign = "center";

        cell.style.minHeight = "48px";

        cell.style.fontSize = "12px";

        const number = document.createElement("div");

        number.textContent = day;

        cell.appendChild(number);

        if (result !== undefined) {

            const pnl = document.createElement("div");

            pnl.textContent =
                (result >= 0 ? "+" : "") +
                result.toFixed(0);

            pnl.style.fontSize = "10px";

            pnl.style.color =
                result >= 0 ? "#22c55e" : "#ef4444";

            cell.appendChild(pnl);

            cell.title =
                "Daily P/L: " + money(result);

        }

        grid.appendChild(cell);

    }

    calendar.appendChild(grid);

}


// ======================================
// 8. RECORD A NEW TRADE
// ======================================

form.addEventListener("submit", function(event) {

    event.preventDefault();

    const pair = document
        .getElementById("pair").value
        .trim().toUpperCase();

    const direction =
        document.getElementById("direction").value;

    const entry = Number(
        document.getElementById("entry").value
    );

    const exit = Number(
        document.getElementById("exit").value
    );

    const pnl = Number(
        document.getElementById("pnl").value
    );

    const tradeDate =
        document.getElementById("tradeDate").value;

    const notes =
        document.getElementById("notes").value;


    // VALIDATION

    if (
        !pair ||
        !tradeDate ||
        !Number.isFinite(entry) ||
        !Number.isFinite(exit) ||
        !Number.isFinite(pnl) ||
        entry <= 0 ||
        exit <= 0
    ) {

        alert("Please enter valid trade information.");

        return;

    }


    // CREATE TRADE

    const trade = {

        pair: pair,

        direction: direction,

        entry: entry,

        exit: exit,

        pnl: pnl,

        tradeDate: tradeDate,

        notes: notes

    };


    // SAVE TRADE

    trades.push(trade);

    saveTrades();

    form.reset();


    // UPDATE EVERYTHING

    displayTrades();

    updateDashboard();

    updateEquityCurve();

    updateCalendar();

});


// ======================================
// 9. LOAD APPLICATION
// ======================================

function initializeJournal() {

    displayTrades();

    updateDashboard();

    updateEquityCurve();

    updateCalendar();

}

initializeJournal();
        
