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

    function switchTo(id, updateHash) {
      tabs.forEach(function(t) { t.classList.toggle('jp-tab-active', t.getAttribute('data-tab') === id); });
      panes.forEach(function(p) { p.classList.toggle('jp-active', p.id === id); });
      sidebars.forEach(function(s) { s.classList.toggle('jp-sidebar-active', s.getAttribute('data-tab') === id); });
      if (updateHash === false) return;
      if (id === 'about') {
        if (location.hash) {
          var base = (location.pathname || '/') + (location.search || '');
          history.replaceState(null, '', base);
        }
      } else {
        var want = '#' + id;
        if ((location.hash || '') !== want) {
          var base = (location.pathname || '/') + (location.search || '');
          history.replaceState(null, '', base + want);
        }
      }
    }

    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        var id = tab.getAttribute('data-tab');
        if (id === 'about') {
          switchTo('about', false);
          var base = (location.pathname || '/') + (location.search || '');
          history.replaceState(null, '', base + '#about');
        } else {
          switchTo(id);
        }
      });
    });

    sidebars.forEach(function(sb) {
      sb.addEventListener('click', function() { switchTo(sb.getAttribute('data-tab')); });
    });

    var homeBtn = document.getElementById('titlebar-home');
    if (homeBtn) {
      homeBtn.addEventListener('click', function(e) {
        e.preventDefault();
        switchTo('about');
      });
    }

    window.addEventListener('hashchange', function() { switchTo(getTabFromHash()); });
    var initialTab = getTabFromHash();
    var hadHash = !!location.hash;
    switchTo(initialTab, hadHash);

    // Experience card expansion
    document.querySelectorAll('.jp-exp-card').forEach(function(card) {
      var inner = card.querySelector('.jp-exp-card-inner');
      if (inner) inner.addEventListener('click', function() { card.classList.toggle('jp-expanded'); });
    });
  })();
});
