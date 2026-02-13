const grid = document.getElementById('calendarGrid');
const totalDisplay = document.getElementById('totalPnl');
const storageKey = 'pnl_modern_data';
let pnlData = JSON.parse(localStorage.getItem(storageKey)) || {};
let chart;

// Inisialisasi Grafik (Equity Curve)
function initChart() {
    const ctx = document.getElementById('pnlChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 31}, (_, i) => i + 1),
            datasets: [{
                label: 'Total Profit',
                data: [],
                borderColor: '#6366f1',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
            }
        }
    });
    updateDisplay();
}

// Update Angka Total dan Grafik
function updateDisplay() {
    let cumulative = 0;
    let total = 0;
    const points = [];
    
    for (let i = 1; i <= 31; i++) {
        const val = parseFloat(pnlData[i] || 0);
        total += val;
        cumulative += val;
        points.push(cumulative);
    }

    chart.data.datasets[0].data = points;
    chart.update();

    totalDisplay.innerText = (total >= 0 ? '+' : '') + total.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    totalDisplay.style.color = total >= 0 ? 'var(--profit)' : 'var(--loss)';
}

// Membuat Kalender Otomatis
function createCalendar() {
    for (let i = 1; i <= 31; i++) {
        const val = pnlData[i] || "";
        const card = document.createElement('div');
        card.className = 'day-card';
        if (val > 0) card.classList.add('p-plus');
        if (val < 0) card.classList.add('p-minus');

        card.innerHTML = `
            <div class="date-num">${i}</div>
            <input type="number" placeholder="0" value="${val}" data-day="${i}">
        `;

        card.querySelector('input').addEventListener('input', (e) => {
            const day = e.target.getAttribute('data-day');
            const value = e.target.value;
            pnlData[day] = value;
            localStorage.setItem(storageKey, JSON.stringify(pnlData));
            
            card.classList.remove('p-plus', 'p-minus');
            if (value > 0) card.classList.add('p-plus');
            if (value < 0) card.classList.add('p-minus');
            
            updateDisplay();
        });

        grid.appendChild(card);
    }
}

// Jalankan program
createCalendar();
initChart();
