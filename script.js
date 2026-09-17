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
    })();

const apiForm = document.getElementById('api-form');
const apiInput = document.getElementById('api-input');
const apiResult = document.getElementById('api-result');

apiForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const url = apiInput.value.trim();
  apiResult.textContent = 'Loading...';

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    apiResult.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    apiResult.textContent = 'Error: ' + err.message;
  }
});