let chart = null;
const API = "https://finpulse-api-s42i.onrender.com";

async function loadStocks() {

    const response = await fetch(`${API}/stocks`);
    const stocks = await response.json();

    const container = document.getElementById("stocks");

    container.innerHTML = "";

    // Dashboard stats
    document.getElementById("stockCount").innerText = stocks.length;
    document.getElementById("companyCount").innerText = stocks.length;

    const avg =
        stocks.reduce((a, b) => a + b.price, 0) / stocks.length;

    document.getElementById("avgPrice").innerText =
        "₹" + avg.toFixed(2);

    stocks.forEach(stock => {

        container.innerHTML += `

<tr class="stock-row"
    data-company="${stock.company}"
    data-ticker="${stock.ticker}"
    data-sector="${stock.sector}">

    <td>
        <strong>${stock.company}</strong><br>
        <small>${stock.ticker}</small>
    </td>

    <td>
        <span class="sector-pill">
            ${stock.sector}
        </span>
    </td>

    <td>
        ₹${stock.price?.toFixed(2) ?? "N/A"}
    </td>

   <td>
    <span class="${stock.changePercent >= 0 ? "gain-pill" : "loss-pill"}">
        ${(stock.changePercent ?? 0) >= 0 ? "▲" : "▼"}
       ${Math.abs(stock.changePercent).toFixed(2)}%
    </span>
    </td>

    <td>
        ${formatMarketCap(stock.marketCap)}
    </td>

    <td>
        ${stock.pe ? stock.pe.toFixed(2) : "-"}
    </td>

    <td>
        ${stock.roe
                ? (stock.roe * 100).toFixed(2) + "%"
                : "-"
            }
    </td>

    <td>
        <button class="inspect-btn"
            onclick="window.location.href='inspector.html?ticker=${stock.ticker}'">
            Inspect →
        </button>
    </td>

</tr>

`;

    });

}

async function loadSummary() {

    const response = await fetch(`${API}/market-summary`);
    const data = await response.json();

    document.getElementById("nifty").innerHTML = `
    <h2>₹${(data.NIFTY.price ?? 0).toLocaleString()}</h2>
    <span class="${(data.NIFTY.percent ?? 0) >= 0 ? "gain-pill" : "loss-pill"}">
        ${(data.NIFTY.percent ?? 0) >= 0 ? "▲" : "▼"}
        ${Math.abs(data.NIFTY.percent ?? 0).toFixed(2)}%
    </span>
`;

    document.getElementById("sensex").innerHTML = `
    <h2>₹${(data.SENSEX.price ?? 0).toLocaleString()}</h2>
    <span class="${(data.SENSEX.percent ?? 0) >= 0 ? "gain-pill" : "loss-pill"}">
        ${(data.SENSEX.percent ?? 0) >= 0 ? "▲" : "▼"}
        ${Math.abs(data.SENSEX.percent ?? 0).toFixed(2)}%
    </span>
`;

}

loadStocks();
loadSummary();

async function openStock(ticker) {

    const response = await fetch(`${API}/stock/${ticker}`);
    const stock = await response.json();

    document.getElementById("companyName").innerText = stock.company;
    document.getElementById("price").innerText = `₹${stock.price}`;
    document.getElementById("marketCap").innerText =
        formatMarketCap(stock.marketCap);
    document.getElementById("pe").innerText = stock.pe;
    document.getElementById("sector").innerText = stock.sector;
    document.getElementById("sectorText").innerText = stock.sector;

    const historyResponse = await fetch(`${API}/history/${ticker}`);
    const history = await historyResponse.json();

    const ctx = document.getElementById("stockChart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: history.dates,
            datasets: [{
                label: "Price",
                data: history.prices,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    document.getElementById("modal").style.display = "block";
}

document.getElementById("close").onclick = function () {
    document.getElementById("modal").style.display = "none";
};

window.onclick = function (event) {
    const modal = document.getElementById("modal");

    if (event.target === modal) {
        modal.style.display = "none";
    }
};

function formatMarketCap(value) {

    if (!value) return "-";

    if (value >= 1e12)
        return "₹" + (value / 1e12).toFixed(2) + " T";

    if (value >= 1e9)
        return "₹" + (value / 1e9).toFixed(2) + " B";

    if (value >= 1e6)
        return "₹" + (value / 1e6).toFixed(2) + " M";

    return value;
}