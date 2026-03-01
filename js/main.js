// Main JavaScript file - consolidates all inline scripts

// Initialize Bootstrap scrollspy and smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
  // Relative time for "Last Checkpoint"
  (function() {
    var el = document.getElementById('checkpoint-time');
    if (!el) return;
    var buildTime = new Date(el.getAttribute('data-time'));
    var now = new Date();
    var diff = Math.floor((now - buildTime) / 1000);
    var text;
    if (diff < 60) text = 'a few seconds ago';
    else if (diff < 3600) { var m = Math.floor(diff / 60); text = m === 1 ? 'a minute ago' : m + ' minutes ago'; }
    else if (diff < 86400) { var h = Math.floor(diff / 3600); text = h === 1 ? 'an hour ago' : h + ' hours ago'; }
    else { var d = Math.floor(diff / 86400); text = d === 1 ? 'yesterday' : d + ' days ago'; }
    el.textContent = text;
  })();

  // Initialize Bootstrap scrollspy (if jQuery and Bootstrap are available)
  if (typeof $ !== 'undefined' && typeof $.fn.scrollspy !== 'undefined') {
    $('body').scrollspy({
      target: '.navbar-fixed-top',
      offset: $('.navbar-fixed-top').outerHeight()
    });

    // Custom scroll handling for smooth scrolling
    $('.page-scroll a').bind('click', function(event) {
      var $anchor = $(this);
      var headerHeight = $('.navbar-fixed-top').outerHeight();
      $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top - headerHeight
      }, 1500, 'easeInOutExpo');
      event.preventDefault();
    });
  }

  // Tab switching functionality for Jupyter layout
  (function() {
    var tabs = document.querySelectorAll('.jp-tab');
    var panes = document.querySelectorAll('.jp-tab-pane');
    var sidebars = document.querySelectorAll('.jp-sidebar-item');
    var validTabs = ['about', 'experience', 'organizations', 'courses', 'contact', 'resume'];

    if (tabs.length === 0) return; // Only run if tabs exist

    function getTabFromHash() {
      var h = (location.hash || '#').replace(/^#/, '').toLowerCase();
      if (h === 'experiences') return 'experience';
      return validTabs.indexOf(h) >= 0 ? h : 'about';
    }

    function switchTo(id) {
      tabs.forEach(function(t) { t.classList.toggle('jp-tab-active', t.getAttribute('data-tab') === id); });
      panes.forEach(function(p) { p.classList.toggle('jp-active', p.id === id); });
      sidebars.forEach(function(s) { s.classList.toggle('jp-sidebar-active', s.getAttribute('data-tab') === id); });
      var want = '#' + id;
      if ((location.hash || '') !== want) {
        var base = (location.pathname || '/') + (location.search || '');
        history.replaceState(null, '', base + want);
      }
    }

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() { switchTo(tab.getAttribute('data-tab')); });
    });

    sidebars.forEach(function(sb) {
      sb.addEventListener('click', function() { switchTo(sb.getAttribute('data-tab')); });
    });

    window.addEventListener('hashchange', function() { switchTo(getTabFromHash()); });
    switchTo(getTabFromHash());

    // Experience card expansion
    document.querySelectorAll('.jp-exp-card').forEach(function(card) {
      var inner = card.querySelector('.jp-exp-card-inner');
      if (inner) inner.addEventListener('click', function() { card.classList.toggle('jp-expanded'); });
    });
  })();

  // Snake game
  (function() {
    var canvas = document.getElementById('snake-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var overlay = document.getElementById('snake-overlay');
    var overlayMsg = document.getElementById('snake-overlay-msg');
    var scoreEl = document.getElementById('snake-score');
    var startBtn = document.getElementById('snake-start');
    var restartBtn = document.getElementById('snake-restart');

    var cell = 20;
    var cols = Math.floor(360 / cell);
    var rows = Math.floor(280 / cell);
    var snake = [], food = {}, dir = { x: 1, y: 0 };
    var score = 0, running = false, loop = null;

    function rnd(lim) { return Math.floor(Math.random() * lim); }
    function spawnFood() {
      var ok;
      do {
        food = { x: rnd(cols), y: rnd(rows) };
        ok = snake.every(function(s) { return s.x !== food.x || s.y !== food.y; });
      } while (!ok);
    }
    function draw() {
      ctx.fillStyle = '#fafafa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#e8e8e8';
      ctx.lineWidth = 1;
      for (var i = 0; i <= cols; i++) ctx.beginPath(), ctx.moveTo(i * cell, 0), ctx.lineTo(i * cell, canvas.height), ctx.stroke();
      for (var j = 0; j <= rows; j++) ctx.beginPath(), ctx.moveTo(0, j * cell), ctx.lineTo(canvas.width, j * cell), ctx.stroke();
      ctx.fillStyle = '#1976d2';
      snake.forEach(function(s, i) {
        ctx.fillStyle = i === 0 ? '#1565c0' : '#1976d2';
        ctx.fillRect(s.x * cell + 1, s.y * cell + 1, cell - 2, cell - 2);
      });
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      var cx = food.x * cell + cell / 2, cy = food.y * cell + cell / 2;
      ctx.arc(cx, cy, cell / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
    }
    function tick() {
      var h = snake[0];
      var nx = h.x + dir.x, ny = h.y + dir.y;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) { gameOver(); return; }
      for (var i = 0; i < snake.length; i++)
        if (snake[i].x === nx && snake[i].y === ny) { gameOver(); return; }
      snake.unshift({ x: nx, y: ny });
      if (nx === food.x && ny === food.y) { score++; scoreEl.textContent = score; spawnFood(); } else snake.pop();
      draw();
    }
    function start() {
      if (running) return;
      snake = [{ x: Math.floor(cols / 2), y: Math.floor(rows / 2) }];
      dir = { x: 1, y: 0 };
      score = 0; scoreEl.textContent = '0';
      spawnFood();
      overlay.classList.add('jp-game-hidden');
      running = true;
      draw();
      loop = setInterval(tick, 120);
    }
    function gameOver() {
      if (!running) return;
      running = false;
      clearInterval(loop);
      overlayMsg.textContent = 'Game over! Score: ' + score;
      overlay.classList.remove('jp-game-hidden');
    }
    function restart() {
      if (loop) clearInterval(loop);
      running = false;
      snake = [];
      overlayMsg.textContent = 'Click or press Space to start';
      overlay.classList.remove('jp-game-hidden');
      spawnFood();
      draw();
    }
    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); if (running) return; if (overlay.classList.contains('jp-game-hidden')) return; start(); return; }
      if (!running) return;
      if (e.code === 'ArrowUp'    || e.code === 'KeyW') { e.preventDefault(); if (dir.y === 0) dir = { x: 0, y: -1 }; }
      else if (e.code === 'ArrowDown' || e.code === 'KeyS') { e.preventDefault(); if (dir.y === 0) dir = { x: 0, y:  1 }; }
      else if (e.code === 'ArrowLeft' || e.code === 'KeyA') { e.preventDefault(); if (dir.x === 0) dir = { x: -1, y: 0 }; }
      else if (e.code === 'ArrowRight'|| e.code === 'KeyD') { e.preventDefault(); if (dir.x === 0) dir = { x:  1, y: 0 }; }
    });
    canvas.addEventListener('click', function() { if (!running && !overlay.classList.contains('jp-game-hidden')) start(); });
    if (startBtn) startBtn.addEventListener('click', function(e) { e.stopPropagation(); start(); });
    if (restartBtn) restartBtn.addEventListener('click', function(e) { e.stopPropagation(); restart(); });
    spawnFood();
    draw();
  })();
});
