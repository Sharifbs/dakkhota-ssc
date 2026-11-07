/* Dakkhota SSC web reader — hash router, lessons, practice tools */
(function () {
  var DK = window.DK || {};
  var BN = '০১২৩৪৫৬৭৮৯', LET = ['ক', 'খ', 'গ', 'ঘ'];
  function bn(n) { return String(n).replace(/\d/g, function (d) { return BN[d]; }); }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem('dk-' + k)); localStorage.setItem('dk-' + k, JSON.stringify(v)); } catch (e) { return null; } }

  var app = $('#app'), crumb = $('#crumb');
  var loaded = {};
  DK.ch = {};
  DK.add = function (d) { DK.ch[d.book + '-' + d.num] = d; };

  function load(book, n) {
    var key = book + '-' + n;
    if (DK.ch[key]) return Promise.resolve(DK.ch[key]);
    if (!loaded[key]) loaded[key] = new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = 'data/' + book + '/ch' + pad(n) + '.js';
      s.onload = function () { DK.ch[key] ? ok(DK.ch[key]) : no(); };
      s.onerror = no;
      document.head.appendChild(s);
    });
    return loaded[key];
  }
  function findBook(id) { return DK.books.filter(function (b) { return b.id === id; })[0]; }

  function band(t, sub) { return '<div class="band"><h1>' + t + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>'; }
  function footer() {
    return '<footer><img src="' + DK.icon + '" alt="">© Dakkhota · SSC ব্যবসায় শিক্ষা<br>পাঠ্যবইয়ের পাতা: জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB), বাংলাদেশ</footer>';
  }
  function setView(html, title) {
    app.innerHTML = html + footer();
    document.title = title ? title + ' | Dakkhota' : 'Dakkhota | SSC ব্যবসায় শিক্ষা';
    window.scrollTo(0, 0);
  }

  /* ---------- views ---------- */
  function home() {
    crumb.textContent = '';
    var h = '<div class="hero"><img class="heroicon" src="' + DK.icon + '" alt="Dakkhota"><div class="herotitle">Dakkhota</div><p>SSC ব্যবসায় শিক্ষা বিভাগ · অধ্যায়ভিত্তিক ডিজিটাল বই, সহজ ব্যাখ্যা ও প্রশ্ন অনুশীলন</p></div>';
    h += band('SSC ব্যবসায় শিক্ষা · নবম-দশম শ্রেণি', 'একটি বই বেছে নাও');
    h += '<div class="books">' + DK.books.map(function (b) {
      var bc = b.cover ? '<div class="bc" style="background-image:url(' + b.cover + ')"></div>' : '<div class="bc ph"><span>' + b.t + '</span></div>';
      return '<a class="book' + (b.soon ? ' soon' : '') + '" href="#' + b.id + '">' + bc + '<div class="bb"><h3>' + b.t + '</h3><div class="en">' + b.en + '</div><span class="st">' + (b.soon ? 'শীঘ্রই আসছে' : '📖 পড়া শুরু করো') + '</span></div></a>';
    }).join('') + '</div>';
    setView(h);
  }

  function book(b) {
    crumb.textContent = b.t;
    var h = '<img class="coverimg" src="' + b.cover + '" alt="' + b.t + ' বইয়ের প্রচ্ছদ">';
    h += band('SSC ' + b.t, b.cls);
    h += '<div class="card"><div class="ct">📖 বইয়ের সূচিপত্র</div><img class="pageimg" src="' + b.contents + '" alt="সূচিপত্র"><div class="zoomhint">ছবিতে চাপ দিলে বড় করে দেখা যাবে</div></div>';
    h += '<div class="card"><div class="ct">📚 অধ্যায়সমূহ</div><div class="links">' + b.chapters.map(function (c) {
      return '<a class="lnk' + (c.ready ? '' : ' off') + '" href="#' + b.id + '-' + c.n + '"><span class="no">' + bn(c.n) + '</span>' + c.t + (c.ready ? '' : '<span class="tag">শীঘ্রই</span>') + '</a>';
    }).join('') + '</div></div>';
    if (b.id === 'acc') h += '<div class="card"><div class="ct">📝 পরীক্ষার প্রস্তুতি</div><div class="links"><a class="lnk" href="#acc-mt"><span class="no">✓</span>পূর্ণাঙ্গ মডেল টেস্ট (বোর্ড ২০২৪–২০২৫)</a></div></div>';
    h += '<div class="pager"><a href="#home">🏠 হোম</a><span></span><span></span></div>';
    setView(h, b.t);
  }

  function seq(d) {
    return d.lessons.map(function (l, i) { return { id: 'l' + (i + 1), t: 'পাঠ ' + bn(i + 1) + ': ' + l.t }; })
      .concat(d.qsets.map(function (q) { return { id: q.id, t: q.t }; }));
  }

  function chapter(b, d) {
    crumb.textContent = b.t + ' · অধ্যায় ' + bn(d.num);
    var base = '#' + b.id + '-' + d.num + '-';
    var h = band('অধ্যায় ' + bn(d.num) + ': ' + d.title, d.en);
    h += '<div class="grid2"><div class="card"><div class="ct">📘 পাঠ ও সহজ ব্যাখ্যা</div><div class="links">' +
      d.lessons.map(function (l, i) { return '<a class="lnk" href="' + base + 'l' + (i + 1) + '"><span class="no">' + bn(i + 1) + '</span>' + l.t + '</a>'; }).join('') +
      '</div></div><div class="card"><div class="ct">📝 প্রশ্ন ও অনুশীলন</div><div class="links">' +
      d.qsets.map(function (q, i) {
        return '<a class="lnk q" href="' + base + q.id + '"><span class="no">' + ['✍', '🧩', '✔', '🏛', '➕'][i % 5] + '</span>' + q.t + (q.soon ? '<span class="tag">শীঘ্রই</span>' : '') + '</a>';
      }).join('') + '</div></div></div>';
    h += '<div class="pager"><a href="#' + b.id + '">← সূচিপত্র</a><a href="#home">🏠 হোম</a><a href="' + base + 'l1">শুরু করো →</a></div>';
    setView(h, 'অধ্যায় ' + bn(d.num) + ': ' + d.title);
  }

  function pager(b, d, id) {
    var s = seq(d), i = s.map(function (x) { return x.id; }).indexOf(id), base = '#' + b.id + '-' + d.num + '-';
    var prev = i > 0 ? '<a href="' + base + s[i - 1].id + '">← আগের পাঠ</a>' : '<a href="#' + b.id + '-' + d.num + '">← অধ্যায়</a>';
    var next = i < s.length - 1 ? '<a href="' + base + s[i + 1].id + '">পরের পাঠ →</a>' : '<a href="#' + b.id + '">সূচিপত্র →</a>';
    return '<div class="pager">' + prev + '<a href="#' + b.id + '-' + d.num + '">📚 অধ্যায়</a>' + next + '</div>';
  }

  function lesson(b, d, k) {
    var l = d.lessons[k - 1];
    crumb.textContent = b.t + ' · অধ্যায় ' + bn(d.num);
    var h = band(b.t + ' · অধ্যায় ' + bn(d.num), d.title);
    h += '<div class="card lesson"><div class="ct"><span class="ic">📘</span>পাঠ ' + bn(k) + ': ' + l.t + '</div>';
    h += l.pages.map(function (p) { return '<img class="pageimg" loading="lazy" src="img/' + b.id + '/book/' + p + '.webp" alt="পাঠ্যবইয়ের পাতা">'; }).join('');
    h += '<div class="zoomhint">বইয়ের পাতায় চাপ দিলে বড় করে পড়া যাবে</div>';
    if (l.terms) h += '<div class="sub">📖 পরিভাষা (শব্দার্থ)</div><div class="content">' + l.terms + '</div>';
    if (l.solve) h += '<div class="sub">✅ এই পাতার প্রশ্ন ও কাজের সমাধান</div><div class="content solve">' + l.solve + '</div>';
    if (l.html) h += '<div class="sub">💡 সহজ ব্যাখ্যা ও নোট</div><div class="content">' + l.html + '</div>';
    h += pager(b, d, 'l' + k) + '</div>';
    setView(h, 'পাঠ ' + bn(k) + ': ' + l.t);
    enhance();
  }

  function qset(b, d, q) {
    crumb.textContent = b.t + ' · অধ্যায় ' + bn(d.num);
    var h = band(b.t + ' · অধ্যায় ' + bn(d.num), d.title);
    h += '<div class="card lesson"><div class="ct"><span class="ic">📝</span>' + q.t + '</div>';
    if (q.quiz) h += quizHTML(b, d, q);
    else if (q.images && q.images.length) {
      h += q.images.map(function (im) { return '<div class="qimg">' + (im.cap ? '<div class="cap">' + im.cap + '</div>' : '') + '<img class="pageimg" loading="lazy" src="' + im.src + '" alt="' + esc(im.cap || q.t) + '"></div>'; }).join('');
    } else if (q.soon) {
      h += '<div class="soonbox"><div class="big">🏛</div><h3>' + q.t + ' শীঘ্রই যুক্ত হবে</h3><p>এই অংশে বিভিন্ন বোর্ড ও সালের প্রশ্ন সাজিয়ে দেওয়া হবে। ততক্ষণ সৃজনশীল ও বহুনির্বাচনি অংশ অনুশীলন করো।</p></div>';
    } else {
      var hasQA = /class="qa"/.test(q.html), hasCQ = /class="cq"/.test(q.html);
      h += '<div class="tools">' + (hasQA ? '<button class="btn alt" id="tgQA">🙈 উত্তর লুকাও (নিজে যাচাই)</button>' : '') +
        (hasCQ ? '<button class="btn teal" id="tgCQ">সব উত্তর দেখাও</button>' : '') + '</div>';
      h += '<div class="content" id="qc">' + q.html + '</div>';
    }
    h += pager(b, d, q.id) + '</div>';
    setView(h, q.t);
    enhance();
    if (q.quiz) bindQuiz(b, d, q);
  }

  /* ---------- MCQ quiz ---------- */
  function quizHTML(b, d, q) {
    var h = '<div class="score" id="score"></div>', last = null;
    q.quiz.forEach(function (it, i) {
      if (it.stem && it.stem !== last) h += '<div class="stem">' + it.stem + '</div>';
      last = it.stem;
      var long = it.o.some(function (o) { return o.replace(/<[^>]+>/g, '').length > 22; });
      h += '<div class="qz" data-i="' + i + '"><div class="qq"><span class="n">' + bn(i + 1) + '.</span>' + it.q + '</div><div class="ops' + (long ? ' one' : '') + '">' +
        it.o.map(function (o, j) { return '<button class="op" data-j="' + j + '"><span class="l">' + LET[j] + '</span><span>' + o + '</span></button>'; }).join('') +
        '</div><div class="fb"></div></div>';
    });
    return h;
  }
  function bindQuiz(b, d, q) {
    var key = 'quiz-' + b.id + '-' + d.num, st = store(key) || {};
    function mark(box, j, save) {
      var i = +box.dataset.i, a = q.quiz[i].a, ops = $$('.op', box), fb = $('.fb', box);
      box.classList.add('done');
      ops[a].classList.add('ok');
      if (j !== a) { ops[j].classList.add('bad'); fb.className = 'fb n'; fb.textContent = '✗ ভুল হয়েছে। সঠিক উত্তর: (' + LET[a] + ')'; }
      else { fb.className = 'fb y'; fb.textContent = '✓ সঠিক!'; }
      if (save) { st[i] = j; store(key, st); }
      score();
    }
    function score() {
      var done = Object.keys(st).length, ok = Object.keys(st).filter(function (i) { return st[i] === q.quiz[i].a; }).length;
      $('#score').innerHTML = 'সঠিক: <b>' + bn(ok) + '</b> · ভুল: <b>' + bn(done - ok) + '</b> · বাকি: <b>' + bn(q.quiz.length - done) + '</b> / ' + bn(q.quiz.length) + '<button class="btn" id="reset">↺ আবার শুরু</button>';
      $('#reset').onclick = function () { st = {}; store(key, st); qset(b, d, q); };
    }
    $$('.qz').forEach(function (box) {
      $$('.op', box).forEach(function (op) { op.onclick = function () { mark(box, +op.dataset.j, true); }; });
      var i = box.dataset.i; if (st[i] !== undefined) mark(box, st[i], false);
    });
    score();
  }

  /* ---------- enhancements: tables scroll, CQ answer toggles, blur answers, lightbox ---------- */
  function enhance() {
    $$('.content table').forEach(function (t) {
      if (t.parentNode.classList.contains('tw')) return;
      var w = document.createElement('div'); w.className = 'tw'; t.parentNode.insertBefore(w, t); w.appendChild(t);
    });
    $$('.content .cq').forEach(function (cq) {
      var ans = $$(':scope > .ans', cq); if (!ans.length) return;
      var box = document.createElement('div'); box.className = 'anss';
      ans[0].parentNode.insertBefore(box, ans[0]); ans.forEach(function (a) { box.appendChild(a); });
      var bt = document.createElement('button'); bt.className = 'btn showans'; bt.textContent = '👁 উত্তর দেখুন';
      box.parentNode.insertBefore(bt, box);
      bt.onclick = function () { var o = cq.classList.toggle('open'); bt.textContent = o ? '🙈 উত্তর লুকাও' : '👁 উত্তর দেখুন'; };
    });
    var tq = $('#tgQA');
    if (tq) tq.onclick = function () {
      var on = $('#qc').classList.toggle('hideans');
      $$('#qc .qa .a').forEach(function (a) { a.classList.remove('show'); });
      tq.textContent = on ? '👁 উত্তর দেখাও' : '🙈 উত্তর লুকাও (নিজে যাচাই)';
    };
    var tc = $('#tgCQ');
    if (tc) tc.onclick = function () {
      var all = $$('#qc .cq'), open = !all.every(function (c) { return c.classList.contains('open'); });
      all.forEach(function (c) { c.classList.toggle('open', open); var b = $('.showans', c); if (b) b.textContent = open ? '🙈 উত্তর লুকাও' : '👁 উত্তর দেখুন'; });
      tc.textContent = open ? 'সব উত্তর লুকাও' : 'সব উত্তর দেখাও';
    };
    $$('.pageimg').forEach(function (im) { im.onclick = function () { $('#lbimg').src = im.src; $('#lb').classList.add('on'); }; });
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.hideans .qa .a'); if (a) a.classList.add('show');
  });
  $('#lb').onclick = function (e) { if (e.target.id !== 'lbimg') $('#lb').classList.remove('on'); };

  /* ---------- router: #home, #acc, #acc-1, #acc-1-l3, #acc-1-mcq ---------- */
  function route() {
    $('#lb').classList.remove('on');
    var p = (location.hash || '').replace(/^#/, '').split('-').filter(Boolean);
    var b = p[0] && findBook(p[0]);
    if (!b || b.soon) return home();
    if (!p[1]) return book(b);
    if (p[1] === 'mt') return modelTests(b);
    var n = +p[1], c = b.chapters.filter(function (x) { return x.n === n; })[0];
    if (!c || !c.ready) return book(b);
    app.innerHTML = '<div class="card" style="margin-top:14px;text-align:center">লোড হচ্ছে…</div>';
    load(b.id, n).then(function (d) {
      if (!p[2]) return chapter(b, d);
      var m = /^l(\d+)$/.exec(p[2]);
      if (m && d.lessons[m[1] - 1]) return lesson(b, d, +m[1]);
      var q = d.qsets.filter(function (x) { return x.id === p[2]; })[0];
      return q ? qset(b, d, q) : chapter(b, d);
    }, function () { app.innerHTML = '<div class="card">এই অধ্যায়টি লোড করা যায়নি। পেজটি আবার খুলে দেখো।</div>'; });
  }
  function modelTests(b) {
    var show = function () {
      crumb.textContent = b.t + ' · মডেল টেস্ট';
      setView(band(b.t, DK.mt.title) + '<div class="card lesson content">' + DK.mt.html + '</div><div class="pager"><a href="#' + b.id + '">← সূচিপত্র</a><span></span><span></span></div>', 'মডেল টেস্ট');
      enhance();
    };
    if (DK.mt) return show();
    var s = document.createElement('script'); s.src = 'data/acc/mt.js'; s.onload = show;
    s.onerror = function () { app.innerHTML = '<div class="card">পাতাটি লোড করা যায়নি।</div>'; };
    document.head.appendChild(s);
  }
  window.addEventListener('hashchange', route);
  route();
})();
