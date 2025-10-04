const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');

let data = [];
let offsetX = 0;
let isDragging = false;
let startX = 0;

// Настройка canvas под адаптивные размеры
function resizeCanvas() {
    // canvas.width = window.innerWidth * 0.5;  // 50vw
    // canvas.height = window.innerHeight * 0.2; // 20vh
    draw();
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Генерация случайных данных каждую секунду
setInterval(() => {
    const now = Date.now();
    const val = 20 + Math.random() * 10;
    data.push({ x: now, y: val });
    draw();
}, 1000);

// Панорамирование мышью
canvas.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.offsetX;
});
canvas.addEventListener('mousemove', e => {
    if (isDragging) {
        offsetX += e.offsetX - startX;
        startX = e.offsetX;
        draw();
    }
});
canvas.addEventListener('mouseup', () => isDragging = false);
canvas.addEventListener('mouseleave', () => isDragging = false);

function draw() {
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Отступы и размеры графика относительно canvas
    const marginLeft = width * 0.12;
    const marginBottom = height * 0.2;
    const chartWidth = width - marginLeft - width * 0.02;
    const chartHeight = height - marginBottom - height * 0.05;

    const yMin = 0;
    const yMax = 50;

    // --- Горизонтальная сетка и подписи Y ---
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;

    const yStep = 10;
    const fontSize = 14; // фиксированный размер текста
    ctx.fillStyle = '#000';
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = yMin; y <= yMax; y += yStep) {
        const py = chartHeight - ((y - yMin) / (yMax - yMin)) * chartHeight + height * 0.05;
        ctx.beginPath();
        ctx.moveTo(marginLeft, py);
        ctx.lineTo(width - width * 0.02, py);
        ctx.stroke();
        ctx.fillText(y, marginLeft - 5, py); // текст фиксированного размера
    }

    // --- Вертикальная сетка и подписи времени X ---
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const stepX = chartWidth / Math.max(1, data.length - 1); // шаг зависит от количества точек и размера canvas
    for (let i = 0; i < data.length; i++) {
        const x = marginLeft + i * stepX + offsetX;
        if (x < marginLeft) continue;
        if (x > width - width * 0.02) break;

        ctx.beginPath();
        ctx.moveTo(x, height * 0.05);
        ctx.lineTo(x, chartHeight + height * 0.05);
        ctx.stroke();

        const time = new Date(data[i].x);
        const timeStr = `${time.getHours()}:${time.getMinutes().toString().padStart(2,'0')}:${time.getSeconds().toString().padStart(2,'0')}`;
        ctx.fillText(timeStr, x, chartHeight + 2); // текст фиксированный
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
    if (data.length < 2) return;
    ctx.strokeStyle = '#1E88E5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data.length - 1; i++) {
        const x0 = marginLeft + i * stepX + offsetX;
        const y0 = chartHeight - ((data[i].y - yMin) / (yMax - yMin)) * chartHeight + height * 0.05;
        const x1 = marginLeft + (i + 1) * stepX + offsetX;
        const y1 = chartHeight - ((data[i + 1].y - yMin) / (yMax - yMin)) * chartHeight + height * 0.05;
        const cx = (x0 + x1) / 2;
        ctx.quadraticCurveTo(x0, y0, cx, (y0 + y1)/2);
    }
    const last = data.length - 1;
    const lastX = marginLeft + last * stepX + offsetX;
    const lastY = chartHeight - ((data[last].y - yMin) / (yMax - yMin)) * chartHeight + height * 0.05;
    ctx.lineTo(lastX, lastY);
    ctx.stroke();
}
