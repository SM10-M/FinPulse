let sortColumn = "";
let sortAscending = true;
const API = "http://127.0.0.1:8000";

let stocks = [];
let filteredStocks = [];

let currentSector = "All";

const tableBody = document.getElementById("tableBody");
const resultCount = document.getElementById("resultCount");

const searchBox = document.getElementById("searchBox");

const peSlider = document.getElementById("peSlider");
const roeSlider = document.getElementById("roeSlider");

const peValue = document.getElementById("peValue");
const roeValue = document.getElementById("roeValue");

loadStocks();

async function loadStocks() {

    const response = await fetch(`${API}/screener`);

    stocks = await response.json();

    filteredStocks = [...stocks];

    applyFilters();

}
function getSectorClass(sector) {

    if (!sector) return "sector-default";

    sector = sector.toLowerCase();

    if (sector.includes("it"))
        return "sector-it";

    if (sector.includes("finance"))
        return "sector-finance";

    if (sector.includes("energy"))
        return "sector-energy";

    if (sector.includes("auto"))
        return "sector-auto";

    return "sector-default";
}

function getPEClass(pe) {

    if (pe == null)
        return "";

    if (pe < 20)
        return "pe-good";

    if (pe < 40)
        return "pe-medium";

    return "pe-high";
}
function renderTable(data) {
    if (sortColumn) {

        filteredStocks.sort((a, b) => {

            let valueA = a[sortColumn];
            let valueB = b[sortColumn];

            if (valueA == null) valueA = 0;
            if (valueB == null) valueB = 0;

            if (typeof valueA === "string") {

                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();

            }

            if (valueA < valueB)
                return sortAscending ? -1 : 1;

            if (valueA > valueB)
                return sortAscending ? 1 : -1;

            return 0;

        });

    }

    tableBody.innerHTML = "";

    resultCount.innerText =
        `Screener Results (${data.length})`;

    data.forEach(stock => {

        const row = document.createElement("tr");

        row.innerHTML = `

<td>
    ${stock.ticker}
</td>

<td>
    ${stock.company}
</td>

<td>
    <span class="sector-pill ${getSectorClass(stock.sector)}">
        ${stock.sector}
    </span>
</td>

<td>
    ₹${formatNumber(stock.price)}
</td>

<td class="${getPEClass(stock.pe)}">
    ${stock.pe ?? "-"}
</td>

<td>
    <span class="marketcap-badge">
        ${formatMarketCap(stock.marketCap)}
    </span>
</td>

<td>
    <button class="inspect-btn"
        onclick="location.href='inspector.html?ticker=${stock.ticker}'">
        Inspect
    </button>
</td>

`;

        tableBody.appendChild(row);

    });

}

function formatNumber(value) {

    if (value == null)
        return "-";

    return Number(value).toFixed(2);

}


function formatMarketCap(value) {

    if (value == null)
        return "-";

    if (value >= 1e12)
        return "₹" + (value / 1e12).toFixed(2) + " T";

    if (value >= 1e9)
        return "₹" + (value / 1e9).toFixed(2) + " B";

    if (value >= 1e6)
        return "₹" + (value / 1e6).toFixed(2) + " M";

    return value;

}

function applyFilters() {

    const maxPE = Number(peSlider.value);

    const minROE = Number(roeSlider.value);

    const search = searchBox.value.toLowerCase();

    filteredStocks = stocks.filter(stock => {

        const pe =
            stock.pe ?? 999999;

        const roe =
            (stock.roe ?? 0) * 100;

        const sector =
            stock.sector ?? "";

        const company =
            (stock.company ?? "").toLowerCase();

        const ticker =
            stock.ticker.toLowerCase();

        const matchesPE =
            pe <= maxPE;

        const matchesROE =
            roe >= minROE;

        const matchesSector =
            currentSector === "All" ||
            sector === currentSector;

        const matchesSearch =
            company.includes(search) ||
            ticker.includes(search);

        return (
            matchesPE &&
            matchesROE &&
            matchesSector &&
            matchesSearch
        );

    });

    renderTable(filteredStocks);

}

peSlider.oninput = () => {

    peValue.innerText = peSlider.value;

    applyFilters();

};


roeSlider.oninput = () => {

    roeValue.innerText = roeSlider.value;

    applyFilters();

};


searchBox.oninput = () => {

    applyFilters();

};

document.querySelectorAll(".sector-chip").forEach(button => {

    button.onclick = () => {

        document.querySelectorAll(".sector-chip")
            .forEach(b => b.classList.remove("active"));

        button.classList.add("active");

        currentSector = button.dataset.sector;

        applyFilters();

    };

});

function enableSort(id, column) {

    document.getElementById(id).onclick = () => {

        if (sortColumn === column) {

            sortAscending = !sortAscending;

        } else {

            sortColumn = column;

            sortAscending = true;

        }

        renderTable(filteredStocks);

    };

}

enableSort("sortTicker", "ticker");
enableSort("sortCompany", "company");
enableSort("sortSector", "sector");
enableSort("sortPrice", "price");
enableSort("sortPE", "pe");
enableSort("sortMarketCap", "marketCap");