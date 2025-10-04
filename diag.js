const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');

let data = [];
let offsetX = 0;
let targetOffsetX = 0;
let isDragging = false;
let manualScroll = false;
let startX = 0;
let resumeTimer = null;

// --- Настройка canvas ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.5;
    draw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// --- Ограничение смещения по X ---
function limitOffset() {
    const marginLeft = canvas.width * 0.12;
    const stepX = window.innerWidth * 0.07;
    const minOffset = Math.min(0, canvas.width - marginLeft - (data.length - 1) * stepX);
    offsetX = Math.max(minOffset, Math.min(offsetX, 0));
}

// --- Остановка ручного скролла ---
function stopManualScroll() {
    isDragging = false;
    resumeTimer = setTimeout(() => manualScroll = false, 2000);
}

// --- Панорамирование мышью ---
canvas.addEventListener('mousedown', e => {
    isDragging = true;
    manualScroll = true;
    startX = e.offsetX;
    if (resumeTimer) clearTimeout(resumeTimer);
});
canvas.addEventListener('mousemove', e => {
    if (isDragging) {
        offsetX += e.offsetX - startX;
        startX = e.offsetX;
        limitOffset();
        draw();
    }
});
canvas.addEventListener('mouseup', stopManualScroll);
canvas.addEventListener('mouseleave', () => { if (isDragging) stopManualScroll(); });

// --- Панорамирование сенсорное (для мобильных) ---
canvas.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
        isDragging = true;
        manualScroll = true;
        startX = e.touches[0].clientX;
        if (resumeTimer) clearTimeout(resumeTimer);
    }
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchmove', e => {
    if (isDragging && e.touches.length === 1) {
        const x = e.touches[0].clientX;
        offsetX += x - startX;
        startX = x;
        limitOffset();
        draw();
    }
    e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', stopManualScroll, { passive: false });
canvas.addEventListener('touchcancel', stopManualScroll, { passive: false });

// --- Генерация данных ---
setInterval(() => {
    const now = Date.now();
    const val = 20 + Math.random() * 10;
    data.push({ x: now, y: val });

    const stepX = window.innerWidth * 0.07;
    const chartWidth = canvas.width - canvas.width * 0.12 - canvas.width * 0.02;
    targetOffsetX = Math.min(0, chartWidth - (data.length - 1) * stepX);

    draw();
}, 1000);

// --- Отрисовка графика ---
function draw() {
    const width = canvas.width;
    const height = canvas.height;

    // --- Автоскролл ---
    if (!manualScroll) {
        offsetX += (targetOffsetX - offsetX) * 0.1;
        limitOffset();
    }

    ctx.clearRect(0, 0, width, height);

    const marginLeft = width * 0.12;
    const marginBottom = height * 0.2;
    const chartWidth = width - marginLeft - width * 0.02;
    const chartHeight = height - marginBottom - height * 0.05;
    const yMin = 0;
    const yMax = 50;
    const stepX = window.innerWidth * 0.07;

    // --- Горизонтальная сетка и подписи Y ---
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = yMin; y <= yMax; y += 10) {
        const py = chartHeight - ((y - yMin) / (yMax - yMin)) * chartHeight + height * 0.05;
        ctx.beginPath();
        ctx.moveTo(marginLeft, py);
        ctx.lineTo(width - width * 0.02, py);
        ctx.stroke();
        ctx.fillText(y, marginLeft - 5, py);
    }

    // --- Вертикальная сетка и подписи времени ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < data.length; i++) {
        let x = marginLeft + i * stepX + offsetX;
        if (x < marginLeft) continue;
        if (x > width - width * 0.02) break;

        ctx.beginPath();
        ctx.moveTo(x, height * 0.05);
        ctx.lineTo(x, chartHeight + height * 0.05);
        ctx.stroke();

        const time = new Date(data[i].x);
        const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2,'0')}:${time.getSeconds().toString().padStart(2,'0')}`;
        ctx.fillText(timeStr, x, chartHeight + 2);
    }

    // --- Оси ---
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(marginLeft, height * 0.05);
    ctx.lineTo(marginLeft, chartHeight + height * 0.05);
    ctx.moveTo(marginLeft, chartHeight + height * 0.05);
    ctx.lineTo(width - width * 0.02, chartHeight + height * 0.05);
    ctx.stroke();

    // --- Линия графика ---
    if (data.length >= 2) {
        ctx.strokeStyle = '#1E88E5';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < data.length - 1; i++) {
            let x0 = marginLeft + i * stepX + offsetX;
            let y0 = chartHeight - ((data[i].y - yMin) / (yMax - yMin)) * chartHeight + height * 0.05;
            let x1 = marginLeft + (i + 1) * stepX + offsetX;
            let y1 = chartHeight - ((data[i + 1].y - yMin) / (yMax - yMin)) * chartHeight + height * 0.05;

            if (x0 < marginLeft) x0 = marginLeft;
            if (x1 < marginLeft) x1 = marginLeft;

            const cx = (x0 + x1) / 2;
            const cy = (y0 + y1) / 2;

            if (i === 0) ctx.moveTo(x0, y0);
            ctx.quadraticCurveTo(x0, y0, cx, cy);
        }

        const last = data.length - 1;
        let lastX = marginLeft + last * stepX + offsetX;
        let lastY = chartHeight - ((data[last].y - yMin) / (yMax - yMin)) * chartHeight + height * 0.05;
        if (lastX < marginLeft) lastX = marginLeft;
        ctx.lineTo(lastX, lastY);

        ctx.stroke();
    }

    requestAnimationFrame(draw);
}

draw();
