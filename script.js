document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('calendarGrid');
    const totalDisplay = document.getElementById('totalPnl');
    const storageKey = 'pnl_usd_realtime';
    
    let pnlData = JSON.parse(localStorage.getItem(storageKey)) || {};
    let chart;

    // Ambil data waktu sekarang
    const now = new Date();
    const currentMonth = now.getMonth(); // 0 = Jan, 1 = Feb, dst.
    const currentYear = now.getFullYear();
    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    // Update Header Bulan
    document.querySelector('h1').innerText = `PNL - ${monthNames[currentMonth]} ${currentYear}`;

    function initChart() {
        const ctx = document.getElementById('pnlChart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 31}, (_, i) => i + 1),
                datasets: [{
                    data: [],
                    borderColor: '#6366f1',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    x: { display: false }, 
                    y: { ticks: { color: '#64748b', callback: (v) => '$' + v } }
                }
            }
        });
        updateDisplay();
    }

    function updateDisplay() {
        let total = 0;
        let cumulative = 0;
        const points = [];
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        for (let i = 1; i <= daysInMonth; i++) {
            const val = parseFloat(pnlData[i] || 0);
            total += val;
            cumulative += val;
            points.push(cumulative);
        }

        totalDisplay.innerText = (total >= 0 ? '+$' : '-$') + Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2 });
        totalDisplay.style.color = total >= 0 ? '#10b981' : '#f43f5e';
        chart.data.labels = Array.from({length: daysInMonth}, (_, i) => i + 1);
        chart.data.datasets[0].data = points;
        chart.update();
    }

    function createCalendar() {
        // Hapus isi grid sebelumnya (kecuali label hari)
        const labels = document.querySelectorAll('.day-label');
        grid.innerHTML = '';
        labels.forEach(l => grid.appendChild(l));

        const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // Cari hari pertama jatuh di mana
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // 1. Tambahkan kotak kosong untuk hari sebelum tanggal 1
        for (let i = 0; i < firstDay; i++) {
            const spacer = document.createElement('div');
            grid.appendChild(spacer);
        }

        // 2. Buat kotak tanggal asli
        for (let i = 1; i <= daysInMonth; i++) {
            const val = pnlData[i] || "";
            const card = document.createElement('div');
            card.className = 'day-card';
            
            // Tandai hari ini agar berbeda
            if (i === now.getDate()) card.style.borderColor = '#6366f1';

            if (val > 0) card.classList.add('p-plus');
            if (val < 0) card.classList.add('p-minus');

            card.innerHTML = `
                <div class="date-num">${i}</div>
                <input type="number" step="any" placeholder="$0" value="${val}">
            `;

            const input = card.querySelector('input');
            input.addEventListener('input', (e) => {
                pnlData[i] = e.target.value;
                localStorage.setItem(storageKey, JSON.stringify(pnlData));
                card.classList.remove('p-plus', 'p-minus');
                if (parseFloat(e.target.value) > 0) card.classList.add('p-plus');
                if (parseFloat(e.target.value) < 0) card.classList.add('p-minus');
                updateDisplay();
            });

            grid.appendChild(card);
        }
    }

    createCalendar();
    initChart();
});
