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
    if (b.id === 'acc') h += '<div class="card"><div class="ct">📝 পরীক্ষার প্রস্তুতি</div><div class="links"><a class="lnk" href="#acc-mcqt"><span class="no">⏱</span>এমসিকিউ মডেল টেস্ট (অধ্যায়ভিত্তিক, পূর্ণাঙ্গ ও বোর্ড প্রশ্ন)</a><a class="lnk" href="#acc-mt"><span class="no">✓</span>পূর্ণাঙ্গ মডেল টেস্ট — সৃজনশীল (বোর্ড ২০২৪–২০২৫)</a></div></div>';
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
      }).join('') + (b.id === 'acc' ? '<a class="lnk q" href="#acc-mcqt-' + d.num + '"><span class="no">⏱</span>এমসিকিউ মডেল টেস্ট (সময় ধরে)</a>' : '') + '</div></div></div>';
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
    if (DK.timer) { clearInterval(DK.timer); DK.timer = null; }
    var p = (location.hash || '').replace(/^#/, '').split('-').filter(Boolean);
    var b = p[0] && findBook(p[0]);
    if (!b || b.soon) return home();
    if (!p[1]) return book(b);
    if (p[1] === 'mt') return modelTests(b);
    if (p[1] === 'mcqt') return mcqTest(b, p[2]);
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

  /* ---------- MCQ model tests: #acc-mcqt (menu), #acc-mcqt-all, #acc-mcqt-5 ---------- */
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pickUnits(units, k) {
    var out = [], n = 0;
    shuffle(units).forEach(function (u) { if (n + u.i.length <= k) { out.push(u); n += u.i.length; } });
    return out;
  }
  function mcqTest(b, sel) {
    if (!DK.mcq) {
      app.innerHTML = '<div class="card" style="margin-top:14px;text-align:center">লোড হচ্ছে…</div>';
      var s = document.createElement('script'); s.src = 'data/acc/mcq.js';
      s.onload = function () { mcqTest(b, sel); };
      s.onerror = function () { app.innerHTML = '<div class="card">প্রশ্নব্যাংক লোড করা যায়নি।</div>'; };
      return document.head.appendChild(s);
    }
    if (!DK.mcqb) {
      var s2 = document.createElement('script'); s2.src = 'data/acc/mcqb.js';
      s2.onload = function () { mcqTest(b, sel); };
      s2.onerror = function () { DK.mcqb = {}; mcqTest(b, sel); };
      return document.head.appendChild(s2);
    }
    var M = DK.mcq, MB = DK.mcqb, chs = Object.keys(M).map(Number).sort(function (x, y) { return x - y; });
    var BK = Object.keys(MB);
    crumb.textContent = b.t + ' · এমসিকিউ মডেল টেস্ট';
    var best = store('mcqbest') || {};
    function bestTag(k) { return best[k] !== undefined ? '<span class="tag">সেরা ' + bn(best[k]) + '%</span>' : ''; }
    if (!sel) {
      var h = band('এমসিকিউ মডেল টেস্ট', 'সময় ধরে পরীক্ষা · প্রতিবার নতুন প্রশ্ন');
      h += '<div class="card"><div class="box def"><div class="bt">⏱ নিয়ম</div><p>প্রতি প্রশ্নে ১ মিনিট সময়। উত্তর দাগিয়ে শেষে “জমা দাও” চাপো; সময় শেষ হলে নিজে থেকেই জমা হবে। জমা দেওয়ার পর সঠিক-ভুল ও নম্বর দেখাবে। প্রতিবার প্রশ্নব্যাংক থেকে নতুন করে প্রশ্ন বাছাই হয়।</p></div>' +
        '<div class="ct">🎓 পূর্ণাঙ্গ (বোর্ড পরীক্ষার মতো)</div><div class="links"><a class="lnk" href="#acc-mcqt-all"><span class="no">৩০</span>সব অধ্যায় মিলিয়ে · ৩০টি প্রশ্ন · ৩০ মিনিট' + bestTag('all') + '</a></div>' +
        '<div class="ct" style="margin-top:14px">📚 অধ্যায়ভিত্তিক</div><div class="links">' + chs.map(function (n) {
          return '<a class="lnk" href="#acc-mcqt-' + n + '"><span class="no">' + bn(n) + '</span>' + M[n].t + ' · ২০টি প্রশ্ন' + bestTag(n) + '</a>';
        }).join('') + '</div>' + (BK.length ? '<div class="ct" style="margin-top:14px">🏛 বোর্ড পরীক্ষার প্রশ্ন (হুবহু, সময় ধরে)</div><div class="links">' + BK.map(function (k) {
          return '<a class="lnk" href="#acc-mcqt-b' + k + '"><span class="no">✎</span>' + MB[k].t + ' · ' + bn(MB[k].u.reduce(function (s, u) { return s + u.i.length; }, 0)) + 'টি প্রশ্ন' + bestTag('b' + k) + '</a>';
        }).join('') + '</div>' : '') + '</div><div class="pager"><a href="#' + b.id + '">← সূচিপত্র</a><a href="#home">🏠 হোম</a><span></span></div>';
      return setView(h, 'এমসিকিউ মডেল টেস্ট');
    }
    var bkey = sel.charAt(0) === 'b' ? sel.slice(1) : null;
    var full = sel === 'all', n = full || bkey ? 0 : +sel;
    if (bkey && !MB[bkey]) return mcqTest(b);
    if (!bkey && !full && !M[n]) return mcqTest(b);
    var units = [];
    if (bkey) MB[bkey].u.forEach(function (u) { units.push({ c: 0, u: u }); });
    else if (full) {
      var per = {}; shuffle(chs).forEach(function (c, i) { per[c] = i < 6 ? 3 : 2; });
      chs.forEach(function (c) { pickUnits(M[c].u, per[c]).forEach(function (u) { units.push({ c: c, u: u }); }); });
    } else pickUnits(M[n].u, 20).forEach(function (u) { units.push({ c: n, u: u }); });
    var items = [], hq = '', k = 0;
    units.forEach(function (x) {
      if (x.u.s) hq += '<div class="stem">' + x.u.s + '</div>';
      x.u.i.forEach(function (it) {
        items.push(it);
        var long = it.o.some(function (o) { return o.replace(/<[^>]+>/g, '').length > 22; });
        hq += '<div class="qz" data-i="' + k + '"><div class="qq"><span class="n">' + bn(k + 1) + '.</span>' + it.q + (full ? ' <span class="chtag">অ. ' + bn(x.c) + '</span>' : '') + '</div><div class="ops' + (long ? ' one' : '') + '">' +
          it.o.map(function (o, j) { return '<button class="op" data-j="' + j + '"><span class="l">' + LET[j] + '</span><span>' + o + '</span></button>'; }).join('') + '</div><div class="fb"></div></div>';
        k++;
      });
    });
    var total = items.length, secs = total * 60, left = secs, ans = {}, done = false;
    var title = bkey ? MB[bkey].t + ' · এমসিকিউ' : full ? 'পূর্ণাঙ্গ এমসিকিউ মডেল টেস্ট' : 'অধ্যায় ' + bn(n) + ': ' + M[n].t;
    var h2 = band(title, bn(total) + 'টি প্রশ্ন · ' + bn(total) + ' মিনিট · পূর্ণমান ' + bn(total));
    h2 += '<div class="card lesson"><div class="score" id="tbar"><span id="tleft"></span><span id="tans"></span><button class="btn" id="tsub">জমা দাও</button></div><div id="tres"></div>' + hq + '</div>';
    h2 += '<div class="pager"><a href="#acc-mcqt">← সব মডেল টেস্ট</a><a href="#' + b.id + '">সূচিপত্র</a><span></span></div>';
    setView(h2, title);
    function fmtT(t) { var m = Math.floor(t / 60), s = t % 60; return bn(m) + ':' + bn(s < 10 ? '0' + s : s); }
    function bar() {
      $('#tleft').innerHTML = done ? 'পরীক্ষা শেষ' : '⏱ বাকি সময়: <b>' + fmtT(left) + '</b>';
      $('#tans').innerHTML = 'উত্তর দিয়েছ: <b>' + bn(Object.keys(ans).length) + '</b> / ' + bn(total);
    }
    $$('.qz').forEach(function (box) {
      $$('.op', box).forEach(function (op) {
        op.onclick = function () {
          if (done) return;
          $$('.op', box).forEach(function (o) { o.classList.remove('sel'); });
          op.classList.add('sel'); ans[box.dataset.i] = +op.dataset.j; bar();
        };
      });
    });
    function submit() {
      if (done) return; done = true; clearInterval(DK.timer); DK.timer = null;
      var ok = 0, skip = 0;
      $$('.qz').forEach(function (box) {
        var i = box.dataset.i, a = items[i].a, ops = $$('.op', box), fb = $('.fb', box), j = ans[i];
        box.classList.add('done'); ops[a].classList.add('ok');
        if (j === undefined) { skip++; fb.className = 'fb n'; fb.textContent = '— উত্তর দেওয়া হয়নি। সঠিক উত্তর: (' + LET[a] + ')'; }
        else if (j === a) { ok++; fb.className = 'fb y'; fb.textContent = '✓ সঠিক!'; }
        else { ops[j].classList.add('bad'); fb.className = 'fb n'; fb.textContent = '✗ ভুল। সঠিক উত্তর: (' + LET[a] + ')'; }
      });
      var pct = Math.round(ok * 100 / total), g = pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'A−' : pct >= 50 ? 'B' : pct >= 40 ? 'C' : pct >= 33 ? 'D' : 'F';
      var key = bkey ? 'b' + bkey : full ? 'all' : n; if (best[key] === undefined || pct > best[key]) { best[key] = pct; store('mcqbest', best); }
      $('#tres').innerHTML = '<div class="box ex"><div class="bt">📊 ফলাফল</div><p style="font-size:17px">প্রাপ্ত নম্বর: <b>' + bn(ok) + ' / ' + bn(total) + '</b> (' + bn(pct) + '%) · গ্রেড (আনুমানিক): <b>' + g + '</b></p>' +
        '<p>সঠিক ' + bn(ok) + ' · ভুল ' + bn(total - ok - skip) + ' · উত্তর দেওয়া হয়নি ' + bn(skip) + ' · সময় লেগেছে ' + fmtT(secs - left) + '</p>' +
        '<p>নিচে প্রতিটি প্রশ্নের সঠিক উত্তর সবুজ ও তোমার ভুল উত্তর লাল রঙে দেখানো হয়েছে।</p><button class="btn teal" id="tagain">↻ ' + (bkey ? 'আবার দাও' : 'নতুন প্রশ্নে আবার দাও') + '</button></div>';
      $('#tagain').onclick = function () { mcqTest(b, sel); };
      $('#tsub').style.display = 'none'; bar(); window.scrollTo(0, 0);
    }
    $('#tsub').onclick = submit;
    bar();
    DK.timer = setInterval(function () { left--; bar(); if (left <= 0) submit(); }, 1000);
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
