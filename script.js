document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('calendarGrid');
    const totalDisplay = document.getElementById('totalPnl');
    const storageKey = 'pnl_data_mobile';
    
    let pnlData = JSON.parse(localStorage.getItem(storageKey)) || {};
    let chart;

    // Inisialisasi Chart
    const ctx = document.getElementById('pnlChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({length: 30}, (_, i) => i + 1),
            datasets: [{
                data: [],
                borderColor: '#6366f1',
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
            scales: { x: { display: false }, y: { display: true } }
        }
    });

    function updateAll() {
        let total = 0;
        let cumulative = 0;
        const points = [];

        for (let i = 1; i <= 30; i++) {
            const val = parseFloat(pnlData[i] || 0);
            total += val;
            cumulative += val;
            points.push(cumulative);
        }

        totalDisplay.innerText = "Rp " + total.toLocaleString('id-ID');
        totalDisplay.style.color = total >= 0 ? '#10b981' : '#f43f5e';
        chart.data.datasets[0].data = points;
        chart.update();
    }

    // Generate kotak tanggal
    for (let i = 1; i <= 30; i++) {
        const val = pnlData[i] || "";
        const card = document.createElement('div');
        card.className = 'day-card';
        if (val > 0) card.classList.add('p-plus');
        if (val < 0) card.classList.add('p-minus');

        card.innerHTML = `
            <div class="date-num">${i}</div>
            <input type="number" pattern="[0-9]*" placeholder="0" value="${val}">
        `;

        const input = card.querySelector('input');
        input.addEventListener('input', (e) => {
            pnlData[i] = e.target.value;
            localStorage.setItem(storageKey, JSON.stringify(pnlData));
            
            card.classList.remove('p-plus', 'p-minus');
            if (e.target.value > 0) card.classList.add('p-plus');
            if (e.target.value < 0) card.classList.add('p-minus');
            
            updateAll();
        });

        grid.appendChild(card);
    }

    updateAll();
});
