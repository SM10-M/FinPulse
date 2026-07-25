let comparisonChart = null;
const API = "http://127.0.0.1:8000";

const stock1 = document.getElementById("stock1");
const stock2 = document.getElementById("stock2");
const compareBtn = document.getElementById("compareBtn");

const table = document.getElementById("comparisonTable");

let stocks = [];

loadCompanies();

async function loadCompanies() {

    const response = await fetch(`${API}/stocks`);

    stocks = await response.json();

    stock1.innerHTML = `<option value="">Select Company</option>`;
    stock2.innerHTML = `<option value="">Select Company</option>`;

    stocks.forEach(stock => {

        stock1.innerHTML += `
        <option value="${stock.ticker}">
            ${stock.company}
        </option>`;

        stock2.innerHTML += `
        <option value="${stock.ticker}">
            ${stock.company}
        </option>`;

    });

}
compareBtn.onclick = async () => {

    if (stock1.value === "" || stock2.value === "") {

        alert("Select two companies.");

        return;

    }

    const response = await fetch(

        `${API}/compare?tickers=${stock1.value},${stock2.value}`

    );

    const data = await response.json();

    renderComparison(data);
    renderChart(stock1.value, stock2.value);

};
function renderComparison(data) {

    const a = data[0];
    const b = data[1];

    document.getElementById("company1").innerText = a.company;
    document.getElementById("company2").innerText = b.company;

    table.innerHTML = `

<tr>

<td>Price</td>

<td>₹${a.price}</td>

<td>₹${b.price}</td>

</tr>

<tr>

<td>P/E</td>

<td>${a.pe ?? "-"}</td>

<td>${b.pe ?? "-"}</td>

</tr>

<tr>

<td>ROE</td>

<td>${a.roe ? (a.roe * 100).toFixed(2) + "%" : "-"}</td>

<td>${b.roe ? (b.roe * 100).toFixed(2) + "%" : "-"}</td>

</tr>

<tr>

<td>P/B</td>

<td>${a.pb ?? "-"}</td>

<td>${b.pb ?? "-"}</td>

</tr>

<tr>

<td>Dividend Yield</td>

<td>${a.dividendYield ?? "-"}%</td>

<td>${b.dividendYield ?? "-"}%</td>

</tr>

<tr>

<td>Market Cap</td>

<td>${formatMarketCap(a.marketCap)}</td>

<td>${formatMarketCap(b.marketCap)}</td>

</tr>

<tr>

<td>Sector</td>

<td>${a.sector}</td>

<td>${b.sector}</td>

</tr>

`;

}
async function renderChart(ticker1, ticker2) {

    const history1 = await fetch(`${API}/history/${ticker1}`);
    const history2 = await fetch(`${API}/history/${ticker2}`);

    const data1 = await history1.json();
    const data2 = await history2.json();

    const ctx = document
        .getElementById("comparisonChart")
        .getContext("2d");

    if (comparisonChart) {
        comparisonChart.destroy();
    }

    comparisonChart = new Chart(ctx, {

        type: "line",

        data: {

            labels: data1.dates,

            datasets: [

                {

                    label: ticker1,

                    data: data1.prices,

                    borderWidth: 3,

                    tension: .35

                },

                {

                    label: ticker2,

                    data: data2.prices,

                    borderWidth: 3,

                    tension: .35

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false

        }

    });

}
function formatMarketCap(value) {

    if (value == null)
        return "-";

    if (value >= 1e12)
        return "₹" + (value / 1e12).toFixed(2) + " T";

    if (value >= 1e9)
        return "₹" + (value / 1e9).toFixed(2) + " B";

    return value;

}

