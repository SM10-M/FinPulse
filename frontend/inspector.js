const API = "https://finpulse-api-s42i.onrender.com";
let chart = null;
let currentChart = "line";

const params = new URLSearchParams(window.location.search);
const ticker = params.get("ticker");

loadCompany();

async function loadCompany() {

    // ---------------- Stock Details ----------------

    const response = await fetch(`${API}/stock/${ticker}`);
    const stock = await response.json();

    document.getElementById("companyName").innerText = stock.company;

    document.getElementById("tickerBadge").innerText =
        ticker.replace(".NS", "");

    document.getElementById("price").innerHTML =
        `₹${stock.price}
<span style="font-size:18px;color:#28d17c;margin-left:12px;">
+0.43%
</span>`;

    document.getElementById("eps").innerText =
        stock.eps ?? "-";

    document.getElementById("beta").innerText =
        stock.beta ?? "-";

    document.getElementById("bookValue").innerText =
        stock.bookValue ?? "-";

    document.getElementById("dividendYield").innerText =
        stock.dividendYield
            ? (stock.dividendYield * 100).toFixed(2) + "%"
            : "-";

    document.getElementById("high52").innerText =
        stock.fiftyTwoHigh
            ? "₹" + stock.fiftyTwoHigh
            : "-";

    document.getElementById("low52").innerText =
        stock.fiftyTwoLow
            ? "₹" + stock.fiftyTwoLow
            : "-";
    document.getElementById("marketCap").innerText =
        formatMarketCap(stock.marketCap);

    document.getElementById("pe").innerText =
        stock.pe ?? "-";


    document.getElementById("companyDescription").innerText =
        `${stock.company} is one of the tracked companies on FinPulse. This dashboard displays live pricing, valuation metrics and historical market performance using Yahoo Finance.`;

    document.getElementById("aiText").innerHTML = `

<b>Investment Summary</b><br><br>

${stock.company} operates in the ${stock.sector} sector.

The company currently trades at a PE ratio of <b>${stock.pe}</b> and has a market capitalisation of <b>${formatMarketCap(stock.marketCap)}</b>.

Investors should evaluate future earnings growth, industry trends and overall market conditions before making investment decisions.

`;
    const historyResponse =
        await fetch(`${API}/history/${ticker}`);

    const history =
        await historyResponse.json();

    const candleResponse =
        await fetch(`${API}/candles/${ticker}`);

    const candles =
        await candleResponse.json();

    drawLineChart(history);

    window.historyData = history;
    window.candleData = candles;
}

function drawLineChart(history) {

    if (chart) {
        chart.destroy();
    }

    chart = new ApexCharts(
        document.querySelector("#stockChart"),

        {

            chart: {
                type: "area",
                height: 520,
                background: "transparent",
                toolbar: { show: false }
            },

            series: [{

                name: "Price",

                data: history.prices

            }],

            xaxis: {
                categories: history.dates,
                labels: {
                    style: {
                        colors: "#94a3b8"
                    }
                }
            },

            yaxis: {
                labels: {
                    style: {
                        colors: "#94a3b8"
                    }
                }
            },

            theme: {
                mode: "dark"
            },

            stroke: {
                width: 3,
                curve: "smooth"
            },

            colors: ["#7c5cff"],

            fill: {
                opacity: .15
            },

            grid: {
                borderColor: "#263247"
            }

        }

    );

    chart.render();

}

function drawCandlestickChart(candles) {

    if (chart) {
        chart.destroy();
    }

    chart = new ApexCharts(

        document.querySelector("#stockChart"),

        {

            chart: {
                type: "candlestick",
                height: 520,
                background: "transparent",
                toolbar: { show: false }
            },

            series: [{

                data: candles

            }],

            theme: {
                mode: "dark"
            },

            xaxis: {
                type: "category"
            },

            grid: {
                borderColor: "#263247"
            }

        }

    );

    chart.render();

}

function switchChart(type) {

    currentChart = type;

    if (type === "line") {

        drawLineChart(window.historyData);

    }

    else {

        drawCandlestickChart(window.candleData);

    }

}
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

function showTab(tab) {

    document.getElementById("chartTab").style.display = "none";
    document.getElementById("fundamentalsTab").style.display = "none";
    document.getElementById("aiTab").style.display = "none";

    document.querySelectorAll(".tab-btn")
        .forEach(btn => btn.classList.remove("active"));

    if (tab === "chart") {
        document.getElementById("chartTab").style.display = "block";
        document.querySelectorAll(".tab-btn")[0].classList.add("active");
    }

    if (tab === "fundamentals") {
        document.getElementById("fundamentalsTab").style.display = "block";
        document.querySelectorAll(".tab-btn")[1].classList.add("active");
    }

    if (tab === "ai") {
        document.getElementById("aiTab").style.display = "block";
        document.querySelectorAll(".tab-btn")[2].classList.add("active");
    }

}