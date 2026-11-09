
const form = document.getElementById("tradeForm");

let trades = JSON.parse(
    localStorage.getItem("trades") || "[]"
);

function displayTrades() {
    const list = document.getElementById("tradeList");

    list.innerHTML = "";

    let total = 0;

    trades.forEach((trade) => {
        total += trade.pnl;

        const item = document.createElement("div");
        item.className = "trade";

        const title = document.createElement("h3");
        title.textContent = trade.pair + " - " + trade.direction;

        const details = document.createElement("p");
        details.textContent =
            "Entry: " + trade.entry +
            " | Exit: " + trade.exit;

        const result = document.createElement("p");
        result.textContent = "P/L: $" + trade.pnl.toFixed(2);
        result.className = trade.pnl >= 0 ? "profit" : "loss";

        const notes = document.createElement("p");
        notes.textContent = trade.notes;

        item.append(title, details, result, notes);
        list.appendChild(item);
    });

    document.getElementById("totalTrades").textContent =
        trades.length;

    const profitElement = document.getElementById("netProfit");

    profitElement.textContent = "$" + total.toFixed(2);

    profitElement.style.color =
        total >= 0 ? "#4ade80" : "#f87171";
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const trade = {
        pair: document.getElementById("pair").value.toUpperCase(),
        direction: document.getElementById("direction").value,
        entry: Number(document.getElementById("entry").value),
        exit: Number(document.getElementById("exit").value),
        pnl: Number(document.getElementById("pnl").value),
        notes: document.getElementById("notes").value
    };

    trades.push(trade);

    localStorage.setItem("trades", JSON.stringify(trades));

    form.reset();

    displayTrades();
});

displayTrades();
