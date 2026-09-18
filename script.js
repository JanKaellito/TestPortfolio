    // Single load-in reveal for the whole panel
    window.addEventListener('DOMContentLoaded', function () {
      requestAnimationFrame(function () {
        document.querySelector('.wrap').classList.add('is-visible');
      });
    });

    // Click email to copy the address, still lets the mailto: link work on its own
    var emailLink = document.getElementById('email-link');
    var copyHint = document.getElementById('copy-hint');
    if (emailLink) {
      emailLink.addEventListener('click', function (e) {
        var address = emailLink.firstChild.textContent.trim();
        if (navigator.clipboard) {
          e.preventDefault();
          navigator.clipboard.writeText(address).then(function () {
            copyHint.classList.add('show');
            setTimeout(function () { copyHint.classList.remove('show'); }, 1500);
          }).catch(function () {
            // clipboard failed silently — mailto: already fired since we didn't preventDefault in time
          });
        }
      });
    }

    // Community links — shared, org-internal storage via the db capability
    (async function () {
      var form = document.getElementById('link-form');
      var input = document.getElementById('link-input');
      var list = document.getElementById('link-list');
      var note = document.getElementById('link-note');

      var db = null;
      try {
        db = await claude.use('db');
      } catch (e) {
        db = null;
      }

      if (!db) {
        form.style.display = 'none';
        note.textContent = "Link sharing isn't available in this view.";
        return;
      }

      var linksQuery = db.collection('links').orderBy('createdAt', 'desc').limit(50);

      linksQuery.onSnapshot(function (snap) {
        list.innerHTML = '';
        if (snap.empty) {
          var empty = document.createElement('li');
          empty.className = 'link-empty';
          empty.textContent = 'No links yet — be the first to add one.';
          list.appendChild(empty);
          return;
        }
        snap.docs.forEach(function (doc) {
          var data = doc.data();
          if (!data || !data.url) return;
          var li = document.createElement('li');
          var a = document.createElement('a');
          a.href = data.url;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = data.url;
          li.appendChild(a);
          list.appendChild(li);
        });
      }, function () {
        note.textContent = 'Could not load links right now.';
      });

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var val = input.value.trim();
        if (!val) return;
        if (!/^https?:\/\//i.test(val)) val = 'https://' + val;
        db.collection('links').add({ url: val, createdAt: Date.now() })
          .then(function () { input.value = ''; })
          .catch(function () { note.textContent = 'Could not add that link.'; });
      });
        
   // API Tester — sends a GET request to whatever URL the visitor enters,
// and renders the response as readable rows instead of raw JSON text
(function () {
  var apiForm = document.getElementById('api-form');
  var apiInput = document.getElementById('api-input');
  var apiResult = document.getElementById('api-result');
  if (!apiForm) return;

  var IMAGE_KEY_HINT = /(image|avatar|photo|thumbnail|icon)$/i;
  var URL_LIKE = /^https?:\/\//i;

  function labelize(key) {
    return String(key)
      .replace(/[_-]+/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/^./, function (c) { return c.toUpperCase(); });
  }

  function renderValue(value, key) {
    if (value === null || value === undefined) {
      var span = document.createElement('span');
      span.className = 'v';
      span.textContent = '—';
      return span;
    }

    if (typeof value === 'string' && URL_LIKE.test(value) && IMAGE_KEY_HINT.test(key || '')) {
      var wrap = document.createElement('div');
      wrap.className = 'v';
      var img = document.createElement('img');
      img.src = value;
      img.alt = key || '';
      wrap.appendChild(img);
      return wrap;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        var empty = document.createElement('span');
        empty.className = 'v';
        empty.textContent = 'None';
        return empty;
      }
      var listWrap = document.createElement('div');
      listWrap.className = 'v api-nested';
      value.slice(0, 25).forEach(function (item, i) {
        if (item !== null && typeof item === 'object') {
          listWrap.appendChild(renderObject(item));
        } else {
          var row = document.createElement('div');
          row.className = 'api-plain';
          row.textContent = '• ' + String(item);
          listWrap.appendChild(row);
        }
      });
      if (value.length > 25) {
        var more = document.createElement('div');
        more.className = 'api-plain';
        more.textContent = '… ' + (value.length - 25) + ' more';
        listWrap.appendChild(more);
      }
      return listWrap;
    }

    if (typeof value === 'object') {
      var objWrap = document.createElement('div');
      objWrap.className = 'v api-nested';
      objWrap.appendChild(renderObject(value));
      return objWrap;
    }

    var plain = document.createElement('span');
    plain.className = 'v';
    plain.textContent = String(value);
    return plain;
  }

  function renderObject(obj) {
    var card = document.createElement('div');
    card.className = 'api-card';
    Object.keys(obj).forEach(function (key) {
      var row = document.createElement('div');
      row.className = 'api-row';
      var k = document.createElement('div');
      k.className = 'k';
      k.textContent = labelize(key);
      row.appendChild(k);
      row.appendChild(renderValue(obj[key], key));
      card.appendChild(row);
    });
    return card;
  }

  function renderResult(data) {
    apiResult.innerHTML = '';
    if (Array.isArray(data)) {
      if (data.length === 0) {
        var empty = document.createElement('div');
        empty.className = 'api-error';
        empty.textContent = 'The response was an empty list.';
        apiResult.appendChild(empty);
        return;
      }
      data.slice(0, 25).forEach(function (item) {
        if (item !== null && typeof item === 'object') {
          apiResult.appendChild(renderObject(item));
        } else {
          var row = document.createElement('div');
          row.className = 'api-plain';
          row.textContent = String(item);
          apiResult.appendChild(row);
        }
      });
      if (data.length > 25) {
        var more = document.createElement('div');
        more.className = 'api-plain';
        more.textContent = '… ' + (data.length - 25) + ' more items';
        apiResult.appendChild(more);
      }
    } else if (data !== null && typeof data === 'object') {
      apiResult.appendChild(renderObject(data));
    } else {
      var plain = document.createElement('div');
      plain.className = 'api-plain';
      plain.textContent = String(data);
      apiResult.appendChild(plain);
    }
  }

  function setStatus(status, ok) {
    var badge = document.createElement('span');
    badge.className = 'api-status ' + (ok ? 'ok' : 'bad');
    badge.textContent = 'Status: ' + status;
    apiResult.appendChild(badge);
  }

  apiForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var url = apiInput.value.trim();
    if (!url) return;
    apiResult.innerHTML = '';
    var loading = document.createElement('div');
    loading.className = 'api-plain';
    loading.textContent = 'Loading…';
    apiResult.appendChild(loading);

    fetch(url)
      .then(function (res) {
        return res.text().then(function (text) {
          apiResult.innerHTML = '';
          setStatus(res.status, res.ok);
          var parsed;
          try {
            parsed = JSON.parse(text);
          } catch (err) {
            var plain = document.createElement('div');
            plain.className = 'api-plain';
            plain.textContent = text || '(empty response)';
            apiResult.appendChild(plain);
            return;
          }
          renderResult(parsed);
        });
      })
      .catch(function (err) {
        apiResult.innerHTML = '';
        var errEl = document.createElement('div');
        errEl.className = 'api-error';
        errEl.textContent = 'Request failed: ' + err.message + '. This can happen if the API blocks cross-origin requests (CORS), or if this page is running somewhere that blocks outgoing requests.';
        apiResult.appendChild(errEl);
      });
  });
})();
