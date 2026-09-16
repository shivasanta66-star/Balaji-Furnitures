/* admin.html — the password is only ever compared server-side. */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };
  var gate = $('[data-gate]');
  var panel = $('[data-panel]');
  var rowsHost = $('[data-rows]');
  var loginForm = $('[data-login-form]');
  var loginStatus = $('[data-login-status]');
  var panelStatus = $('[data-panel-status]');
  var statusFilter = $('[data-filter-status]');
  var searchBox = $('[data-search]');
  var newCount = $('[data-new-count]');
  var logoutBtn = $('[data-logout]');

  var all = [];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function say(el, msg, isError) {
    el.textContent = msg;
    el.classList.toggle('is-error', !!isError);
    el.hidden = !msg;
  }

  function fmtDate(ts) {
    var d = new Date(ts);
    if (isNaN(d)) return esc(ts);
    return String(ts).slice(0, 16).replace('T', ' ');
  }

  function show(signedIn) {
    gate.hidden = signedIn;
    panel.hidden = !signedIn;
    logoutBtn.hidden = !signedIn;
    if (signedIn) load();
  }

  function render() {
    var status = statusFilter.value;
    var q = searchBox.value.trim().toLowerCase();

    var rows = all.filter(function (e) {
      if (status !== 'all' && e.status !== status) return false;
      if (!q) return true;
      return String(e.name).toLowerCase().indexOf(q) !== -1 ||
             String(e.phone).indexOf(q) !== -1;
    });

    newCount.textContent = all.filter(function (e) { return e.status === 'new'; }).length + ' new';

    if (!rows.length) {
      rowsHost.innerHTML = '<tr><td colspan="7" style="color:var(--muted);">No enquiries match.</td></tr>';
      return;
    }

    rowsHost.innerHTML = rows.map(function (e) {
      return '<tr>' +
        '<td>' + fmtDate(e.timestamp) + '</td>' +
        '<td>' + esc(e.name) + '</td>' +
        '<td><a href="tel:+91' + esc(e.phone) + '">' + esc(e.phone) + '</a></td>' +
        '<td>' + esc(e.category) + '</td>' +
        '<td class="msg">' + esc(e.message) + '</td>' +
        '<td><span class="status-pill status-' + esc(e.status) + '">' + esc(e.status) + '</span></td>' +
        '<td>' + nextAction(e) + '</td>' +
        '</tr>';
    }).join('');
  }

  function nextAction(e) {
    if (e.status === 'new') {
      return '<button type="button" class="btn-row" data-set="contacted" data-id="' + esc(e.id) + '">Mark contacted</button>';
    }
    if (e.status === 'contacted') {
      return '<button type="button" class="btn-row" data-set="closed" data-id="' + esc(e.id) + '">Mark closed</button>';
    }
    return '<button type="button" class="btn-row" disabled>Closed</button>';
  }

  rowsHost.addEventListener('click', function (ev) {
    var btn = ev.target.closest('[data-set]');
    if (!btn) return;
    btn.disabled = true;
    fetch('/api/enquiries/' + encodeURIComponent(btn.getAttribute('data-id')), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: btn.getAttribute('data-set') })
    }).then(function (r) { return r.json(); }).then(function (body) {
      if (!body.success) { say(panelStatus, body.error || 'Could not update.', true); btn.disabled = false; return; }
      say(panelStatus, '', false);
      load();
    }).catch(function () {
      say(panelStatus, 'Network error.', true);
      btn.disabled = false;
    });
  });

  function load() {
    fetch('/api/enquiries', { headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (r.status === 401) { show(false); return null; }
        return r.json();
      })
      .then(function (body) {
        if (!body) return;
        if (!body.success) { say(panelStatus, body.error || 'Could not load.', true); return; }
        all = body.enquiries;
        say(panelStatus, '', false);
        render();
      })
      .catch(function () { say(panelStatus, 'Network error loading enquiries.', true); });
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var pass = loginForm.querySelector('[name="password"]').value;
    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pass })
    }).then(function (r) { return r.json(); }).then(function (body) {
      if (!body.success) { say(loginStatus, body.error || 'Sign in failed.', true); return; }
      loginForm.reset();
      say(loginStatus, '', false);
      show(true);
    }).catch(function () { say(loginStatus, 'Network error.', true); });
  });

  logoutBtn.addEventListener('click', function () {
    fetch('/api/admin/logout', { method: 'POST' }).then(function () { show(false); });
  });

  statusFilter.addEventListener('change', render);
  searchBox.addEventListener('input', render);
  $('[data-refresh]').addEventListener('click', load);

  fetch('/api/admin/session')
    .then(function (r) { return r.json(); })
    .then(function (body) {
      if (!body.configured) {
        say(loginStatus, 'ADMIN_PASSWORD is not set on the server, so the panel is disabled.', true);
        return;
      }
      show(Boolean(body.signedIn));
    })
    .catch(function () { show(false); });
})();
