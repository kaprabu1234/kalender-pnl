document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('calendarGrid');
    const monthYearLabel = document.getElementById('monthYear');
    const totalDisplay = document.getElementById('totalPnl');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    // State Kalender
    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    // Inisialisasi Chart
    const ctx = document.getElementById('pnlChart').getContext('2d');
    let chart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: '#6366f1', fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false } } }
    });

    function renderCalendar() {
        grid.innerHTML = '';
        // Tambahkan label hari ulang
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        days.forEach(d => {
            const el = document.createElement('div');
            el.className = 'day-label';
            el.innerText = d;
            grid.appendChild(el);
        });

        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        monthYearLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;
        
        // Storage key unik per bulan agar data tidak campur
        const storageKey = `pnl_${currentYear}_${currentMonth}`;
        let pnlData = JSON.parse(localStorage.getItem(storageKey)) || {};

        // Spacer
        for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));

        // Buat Hari
        for (let i = 1; i <= daysInMonth; i++) {
            const val = pnlData[i] || "";
            const card = document.createElement('div');
            card.className = 'day-card';
            
            // Cek jika ini hari ini (real-time)
            const today = new Date();
            if(i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                card.classList.add('today');
            }

            if (val > 0) card.classList.add('p-plus');
            else if (val < 0) card.classList.add('p-minus');

            card.innerHTML = `<div class="date-num">${i}</div><input type="number" step="any" placeholder="0" value="${val}">`;
            
            const input = card.querySelector('input');
            input.addEventListener('input', (e) => {
                pnlData[i] = e.target.value;
                localStorage.setItem(storageKey, JSON.stringify(pnlData));
                
                card.classList.remove('p-plus', 'p-minus');
                if (e.target.value > 0) card.classList.add('p-plus');
                else if (e.target.value < 0) card.classList.add('p-minus');
                
                updateStats(pnlData, daysInMonth);
            });
            grid.appendChild(card);
        }
        updateStats(pnlData, daysInMonth);
    }

    function updateStats(pnlData, daysInMonth) {
        let total = 0;
        let cumulative = 0;
        const points = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const v = parseFloat(pnlData[i] || 0);
            total += v;
            cumulative += v;
            points.push(cumulative);
        }
        totalDisplay.innerText = (total >= 0 ? '$' : '-$') + Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2 });
        totalDisplay.style.color = total >= 0 ? '#10b981' : '#f43f5e';
        
        chart.data.labels = Array.from({length: daysInMonth}, (_, i) => i + 1);
        chart.data.datasets[0].data = points;
        chart.update();
    }

    // Tombol Navigasi
    prevBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });

    renderCalendar();
});
