// Import perlin noise library
import * as ChriscoursesPerlinNoise from "https://esm.sh/@chriscourses/perlin-noise";

// Editable values
const thresholdIncrement = 5;
const thickLineThresholdMultiple = 3;
const res = 10;
const baseZOffset = 0.00035;
const hoverZOffset = 0.0015;
const lineColor = '#6495ed';
const cursorRadius = 20;
const cursorPull = 8;
const cursorRampSpeed = 0.25;

let canvas;
let ctx;
let inputValues = [];

let currentThreshold = 0;
let cols = 0;
let rows = 0;
let zOffset = 0;
let noiseMin = 100;
let noiseMax = 0;

let lastFrameTime = 0;
const targetFPS = 30;

let mouseGX = -1, mouseGY = -1;
let mouseOver = false;
let cursorStrength = 0;

function initTopography() {
    const about = document.getElementById('topography-canvas-about');
    const header = document.getElementById('topography-canvas');
    canvas = about || header;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }
    const followCursor = !!about;
    setupCanvas(followCursor);

    const observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) canvasSize();
        }
    });
    observer.observe(canvas);

    animate();
}

function setupCanvas(followCursor) {
    canvasSize();
    window.addEventListener('resize', canvasSize);

    if (followCursor) {
        const wrap = canvas.parentElement;
        wrap.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseGX = (e.clientX - rect.left) / res;
            mouseGY = (e.clientY - rect.top) / res;
            mouseOver = true;
        });
        wrap.addEventListener('mouseleave', () => {
            mouseOver = false;
        });
    }
}

function canvasSize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    cols = Math.floor(canvas.width / res) + 1;
    rows = Math.floor(canvas.height / res) + 1;
    
    if (!Array.isArray(inputValues) || inputValues.length !== rows) {
        inputValues = Array.from({ length: rows }, () => Array(cols + 1).fill(0));
    } else {
        for (let y = 0; y < rows; y++) {
            if (!Array.isArray(inputValues[y]) || inputValues[y].length !== cols + 1) {
                inputValues[y] = Array(cols + 1).fill(0);
            }
        }
    }
}

function animate(now) {
    if (now - lastFrameTime < 1000 / targetFPS) {
        requestAnimationFrame(animate);
        return;
    }
    lastFrameTime = now;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    zOffset += baseZOffset + (hoverZOffset - baseZOffset) * cursorStrength;
    generateNoise();
    
    const roundedNoiseMin = Math.floor(noiseMin / thresholdIncrement) * thresholdIncrement;
    const roundedNoiseMax = Math.ceil(noiseMax / thresholdIncrement) * thresholdIncrement;
    
    for (let threshold = roundedNoiseMin; threshold < roundedNoiseMax; threshold += thresholdIncrement) {
        currentThreshold = threshold;
        renderAtThreshold();
    }
    
    noiseMin = 100;
    noiseMax = 0;
    
    requestAnimationFrame(animate);
}

function generateNoise() {
    const target = mouseOver ? 1 : 0;
    cursorStrength += (target - cursorStrength) * cursorRampSpeed;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x <= cols; x++) {
            let sx = x * 0.02;
            let sy = y * 0.02;

            if (cursorStrength > 0.005) {
                const dx = x - mouseGX;
                const dy = y - mouseGY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < cursorRadius && dist > 0.5) {
                    const t = 1 - dist / cursorRadius;
                    const pull = cursorStrength * cursorPull * t * t;
                    sx -= (dx / dist) * pull * 0.02;
                    sy -= (dy / dist) * pull * 0.02;
                }
            }

            const val = ChriscoursesPerlinNoise.noise(sx, sy, zOffset) * 100;
            inputValues[y][x] = val;
            if (val < noiseMin) noiseMin = val;
            if (val > noiseMax) noiseMax = val;
        }
    }
}

function renderAtThreshold() {
    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = currentThreshold % (thresholdIncrement * thickLineThresholdMultiple) === 0 ? 3 : 1.5;

    for (let y = 0; y < inputValues.length - 1; y++) {
        for (let x = 0; x < inputValues[y].length - 1; x++) {
            if (inputValues[y][x] > currentThreshold && inputValues[y][x + 1] > currentThreshold && 
                inputValues[y + 1][x + 1] > currentThreshold && inputValues[y + 1][x] > currentThreshold) continue;
            if (inputValues[y][x] < currentThreshold && inputValues[y][x + 1] < currentThreshold && 
                inputValues[y + 1][x + 1] < currentThreshold && inputValues[y + 1][x] < currentThreshold) continue;
            
            let gridValue = binaryToType(
                inputValues[y][x] > currentThreshold ? 1 : 0,
                inputValues[y][x + 1] > currentThreshold ? 1 : 0,
                inputValues[y + 1][x + 1] > currentThreshold ? 1 : 0,
                inputValues[y + 1][x] > currentThreshold ? 1 : 0
            );

            placeLines(gridValue, x, y);
        }
    }
    ctx.stroke();
}

function placeLines(gridValue, x, y) {
    let nw = inputValues[y][x];
    let ne = inputValues[y][x + 1];
    let se = inputValues[y + 1][x + 1];
    let sw = inputValues[y + 1][x];
    let a, b, c, d;

    switch (gridValue) {
        case 1:
        case 14:
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(d, c);
            break;
        case 2:
        case 13:
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            line(b, c);
            break;
        case 3:
        case 12:
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(d, b);
            break;
        case 11:
        case 4:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            line(a, b);
            break;
        case 5:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(d, a);
            line(c, b);
            break;
        case 6:
        case 9:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            line(c, a);
            break;
        case 7:
        case 8:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(d, a);
            break;
        case 10:
            a = [x * res + res * linInterpolate(nw, ne), y * res];
            b = [x * res + res, y * res + res * linInterpolate(ne, se)];
            c = [x * res + res * linInterpolate(sw, se), y * res + res];
            d = [x * res, y * res + res * linInterpolate(nw, sw)];
            line(a, b);
            line(c, d);
            break;
    }
}

function line(from, to) {
    ctx.moveTo(from[0], from[1]);
    ctx.lineTo(to[0], to[1]);
}

function linInterpolate(x0, x1, y0 = 0, y1 = 1) {
    if (x0 === x1) return 0;
    return y0 + ((y1 - y0) * (currentThreshold - x0)) / (x1 - x0);
}

function binaryToType(nw, ne, se, sw) {
    let a = [nw, ne, se, sw];
    return a.reduce((res, x) => (res << 1) | x);
}

document.addEventListener('DOMContentLoaded', initTopography);
