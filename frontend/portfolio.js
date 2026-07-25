const API = "http://127.0.0.1:8000";
let allocationChart = null;

const tickerSelect = document.getElementById("tickerSelect");
const quantity = document.getElementById("quantity");
const buyPrice = document.getElementById("buyPrice");
const addHoldingBtn = document.getElementById("addHoldingBtn");
const portfolioTable = document.getElementById("portfolioTable");

loadStocks();
loadPortfolio();

async function loadStocks() {

    const response = await fetch(`${API}/stocks`);

    const stocks = await response.json();

    tickerSelect.innerHTML = "";

    stocks.forEach(stock => {

        tickerSelect.innerHTML += `
            <option value="${stock.ticker}">
                ${stock.company}
            </option>
        `;

    });

}

async function loadPortfolio() {

    const response = await fetch(`${API}/portfolio`);

    const holdings = await response.json();
    const labels = [];
    const values = [];

    portfolioTable.innerHTML = "";

    let totalValue = 0;
    let totalProfit = 0;
    let invested = 0;

    holdings.forEach(h => {

        totalValue += h.value;
        totalProfit += h.profit;
        invested += h.buy_price * h.quantity;
        labels.push(h.ticker);
        values.push(h.value);

        const color = h.profit >= 0 ? "profit" : "loss";

        portfolioTable.innerHTML += `

        <tr>

            <td>${h.ticker}</td>

            <td>${h.quantity}</td>

            <td>₹${h.buy_price.toFixed(2)}</td>

            <td>₹${h.current_price.toFixed(2)}</td>

            <td>₹${h.value.toFixed(2)}</td>

            <td class="${color}">
                ₹${h.profit.toFixed(2)}
            </td>

            <td>

                <button class="delete-btn"
                    onclick="deleteHolding(${h.id})">

                    🗑

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("totalValue").innerText =
        "₹" + totalValue.toFixed(2);

    document.getElementById("totalPL").innerText =
        "₹" + totalProfit.toFixed(2);

    document.getElementById("investedAmount").innerText =
        "₹" + invested.toFixed(2);

    document.getElementById("holdingCount").innerText =
        holdings.length;

    const ctx = document
        .getElementById("allocationChart")
        .getContext("2d");

    if (allocationChart) {
        allocationChart.destroy();
    }

    allocationChart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: labels,

            datasets: [{

                data: values,

                backgroundColor: [

                    "#6C63FF",
                    "#22C55E",
                    "#F59E0B",
                    "#3B82F6",
                    "#EF4444",
                    "#A855F7",
                    "#14B8A6"

                ]

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    position: "bottom",

                    labels: {

                        color: "white"

                    }

                }

            }

        }

    });

    const returnPercent =
        invested > 0
            ? ((totalProfit / invested) * 100).toFixed(2)
            : 0;

    const returnElement =
        document.getElementById("returnPercent");

    returnElement.innerText = returnPercent + "%";

    returnElement.className =
        totalProfit >= 0 ? "profit" : "loss";

}

addHoldingBtn.onclick = async () => {

    if (
        quantity.value === "" ||
        buyPrice.value === ""
    ) {

        alert("Enter Quantity and Buy Price");

        return;

    }

    await fetch(`${API}/portfolio`, {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify({

            ticker: tickerSelect.value,

            quantity: Number(quantity.value),

            buy_price: Number(buyPrice.value)

        })

    });

    quantity.value = "";
    buyPrice.value = "";

    loadPortfolio();

}

async function deleteHolding(id) {

    await fetch(`${API}/portfolio/${id}`, {

        method: "DELETE"

    });

    loadPortfolio();

}