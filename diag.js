const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');

let data = [];          // массив точек {x: timestamp, y: value}
let offsetX = 0;        // смещение для прокрутки
let isDragging = false;
let startX = 0;

// Генерация случайных данных
setInterval(() => {
    const now = Date.now();
    const val = 20 + Math.random() * 10;
    data.push({ x: now, y: val });
    draw();
}, 1000);

// Обработчик мыши для прокрутки
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

// Функция рисования
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // рисуем сетку
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y <= canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    for (let x = 50; x <= canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // рисуем оси
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 0);
    ctx.lineTo(50, canvas.height);
    ctx.moveTo(0, canvas.height - 30);
    ctx.lineTo(canvas.width, canvas.height - 30);
    ctx.stroke();

    if (data.length < 2) return;

    // масштаб по Y
    const yMin = 0;
    const yMax = 50;

    // рисуем область под линией
    ctx.fillStyle = 'rgba(30,136,229,0.2)';
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
        const px = 50 + (i * 50) + offsetX;
        const py = canvas.height - 30 - ((data[i].y - yMin) / (yMax - yMin)) * (canvas.height - 50);
        if (i === 0) ctx.moveTo(px, canvas.height - 30);
        ctx.lineTo(px, py);
    }
    const lastX = 50 + (data.length - 1) * 50 + offsetX;
    ctx.lineTo(lastX, canvas.height - 30);
    ctx.closePath();
    ctx.fill();

    // рисуем сглаженную линию
    ctx.strokeStyle = '#1E88E5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < data.length - 1; i++) {
        const x0 = 50 + i * 50 + offsetX;
        const y0 = canvas.height - 30 - ((data[i].y - yMin) / (yMax - yMin)) * (canvas.height - 50);
        const x1 = 50 + (i + 1) * 50 + offsetX;
        const y1 = canvas.height - 30 - ((data[i + 1].y - yMin) / (yMax - yMin)) * (canvas.height - 50);
        const cx = (x0 + x1) / 2;
        ctx.quadraticCurveTo(x0, y0, cx, (y0 + y1)/2);
    }
    // последняя точка
    const last = data.length - 1;
    const lastXPos = 50 + last * 50 + offsetX;
    const lastYPos = canvas.height - 30 - ((data[last].y - yMin) / (yMax - yMin)) * (canvas.height - 50);
    ctx.lineTo(lastXPos, lastYPos);
    ctx.stroke();
}
