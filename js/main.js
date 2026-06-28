// ===== PROGRESS BAR =====
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
  const updateProgress = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
}

// ===== FADE-UP ANIMATIONS =====
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); fadeObserver.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.fade-up').forEach(el => fadeObserver.observe(el));

// ===== ANIMATED COUNTERS =====
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const isFloat = String(target).includes('.');
  const duration = 2000;
  const start = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  function tick(now) {
    const p = ease(Math.min((now - start) / duration, 1));
    const val = p * target;
    el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.floor(val).toLocaleString()) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { animateCounter(e.target); counterObserver.unobserve(e.target); }
  });
}, { threshold: 0.4 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ===== TABS =====
document.querySelectorAll('.tabs').forEach(group => {
  const btns = group.querySelectorAll('.tab-btn');
  const panels = group.querySelectorAll('.tab-panel');
  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panels[i].classList.add('active');
    });
  });
});

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-close');
hamburger?.addEventListener('click', () => {
  mobileMenu?.classList.add('open');
  document.body.style.overflow = 'hidden';
});
const closeMenu = () => { mobileMenu?.classList.remove('open'); document.body.style.overflow = ''; };
mobileClose?.addEventListener('click', closeMenu);
mobileMenu?.addEventListener('click', e => { if (e.target === mobileMenu) closeMenu(); });

// ===== TOC ACTIVE HIGHLIGHT =====
const tocLinks = document.querySelectorAll('.toc-list a');
if (tocLinks.length) {
  const headings = document.querySelectorAll('.article-content h2[id], .article-content h3[id]');
  const tocObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        tocLinks.forEach(a => a.classList.remove('active'));
        document.querySelector(`.toc-list a[href='#${e.target.id}']`)?.classList.add('active');
      }
    });
  }, { rootMargin: '-15% 0px -75% 0px' });
  headings.forEach(h => tocObserver.observe(h));
}

// ===== HERO SEARCH =====
function doHeroSearch() {
  const q = document.getElementById('hero-search-input')?.value.trim();
  if (q) window.location.href = 'search.html?q=' + encodeURIComponent(q);
}
document.getElementById('hero-search-btn')?.addEventListener('click', doHeroSearch);
document.getElementById('hero-search-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') doHeroSearch();
});

// ===== SEARCH PAGE =====
(function initSearch() {
  const input = document.getElementById('search-input');
  const btn = document.getElementById('search-btn');
  const results = document.getElementById('search-results');
  if (!input || !results) return;

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  if (q) { input.value = q; performSearch(q); }

  btn?.addEventListener('click', () => performSearch(input.value.trim()));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') performSearch(input.value.trim()); });

  const pages = [
    { title: 'What Is Gross Pay?', url: 'paystub/gross-pay.html', cat: 'Pay Stub', desc: 'Learn what gross pay means on your paycheck and how it differs from net pay.' },
    { title: 'What Is Net Pay?', url: 'paystub/net-pay.html', cat: 'Pay Stub', desc: 'Understand the take-home pay amount after all deductions are applied.' },
    { title: 'What Is FICA Tax?', url: 'paystub/fica-tax.html', cat: 'Pay Stub', desc: 'FICA stands for Federal Insurance Contributions Act — Social Security and Medicare taxes.' },
    { title: 'What Is a W-2 Form?', url: 'taxes/w2-form.html', cat: 'Taxes', desc: 'Your employer sends this each January showing total wages and taxes withheld.' },
    { title: 'What Is AGI?', url: 'taxes/agi.html', cat: 'Taxes', desc: 'Adjusted Gross Income is your total income minus specific above-the-line deductions.' },
    { title: 'What Is a 1099 Form?', url: 'taxes/1099-form.html', cat: 'Taxes', desc: 'Independent contractors and freelancers receive 1099 forms instead of W-2s.' },
    { title: 'What Is an HSA?', url: 'benefits/hsa.html', cat: 'Benefits', desc: 'A Health Savings Account lets you save pre-tax money for medical expenses.' },
    { title: 'What Is a 401(k)?', url: 'benefits/401k.html', cat: 'Benefits', desc: 'A 401(k) is an employer-sponsored retirement savings plan with tax advantages.' },
    { title: 'What Is SSI?', url: 'government/ssi.html', cat: 'Government', desc: 'Supplemental Security Income provides monthly payments to low-income aged and disabled individuals.' },
    { title: 'What Is Medicare?', url: 'government/medicare.html', cat: 'Government', desc: 'Federal health insurance program primarily for people 65 and older.' },
  ];

  function performSearch(query) {
    if (!query) return;
    document.title = `"${query}" — PayStubGuide Search`;
    const ql = query.toLowerCase();
    const matched = pages.filter(p =>
      p.title.toLowerCase().includes(ql) ||
      p.desc.toLowerCase().includes(ql) ||
      p.cat.toLowerCase().includes(ql)
    );
    results.innerHTML = matched.length
      ? `<p style="color:var(--text-muted);margin-bottom:1rem;font-size:0.875rem">${matched.length} result${matched.length !== 1 ? 's' : ''} for "<strong>${query}</strong>"</p>` +
        matched.map(p => `
          <div class="search-result-item">
            <div class="search-result-meta">${p.cat}</div>
            <a href="${p.url}">${p.title}</a>
            <p>${p.desc}</p>
          </div>`).join('')
      : `<p style="color:var(--text-muted)">No results found for "<strong>${query}</strong>". Try searching for terms like "W-2", "HSA", "FICA", or "Medicare".</p>`;
  }
})();

// ===== PAYCHECK CALCULATOR =====
document.getElementById('calc-btn')?.addEventListener('click', () => {
  const gross = parseFloat(document.getElementById('calc-gross')?.value);
  const freq = document.getElementById('calc-freq')?.value || 'biweekly';
  const state = document.getElementById('calc-state')?.value || 'ca';
  if (!gross || gross <= 0) { alert('Please enter a valid gross pay amount.'); return; }

  const periods = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
  const annual = gross * periods[freq];

  const taxable = Math.max(0, annual - 14600);
  let fed = 0;
  const brackets = [[11600,0.10],[34000,0.12],[46875,0.22],[95375,0.24],[100000,0.32],[113400,0.35],[Infinity,0.37]];
  let remaining = taxable;
  let prev = 0;
  for (const [limit, rate] of brackets) {
    const band = Math.min(remaining, limit - prev);
    if (band <= 0) break;
    fed += band * rate;
    remaining -= band;
    prev = limit;
    if (remaining <= 0) break;
  }

  const ss = Math.min(annual * 0.062, 10088.40);
  const med = annual * 0.0145 + (annual > 200000 ? (annual - 200000) * 0.009 : 0);
  const stRates = { ca: 0.073, tx: 0, fl: 0, ny: 0.065, wa: 0, il: 0.0495, pa: 0.0307, oh: 0.04, ga: 0.055, nc: 0.0499, mi: 0.0425, nj: 0.0637, va: 0.0575, az: 0.025, co: 0.044, mn: 0.07, wi: 0.0765, ma: 0.05, md: 0.0575 };
  const stTax = annual * (stRates[state] ?? 0.05);

  const perPeriod = periods[freq];
  const net = gross - (fed + ss + med + stTax) / perPeriod;

  const fmt = n => '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  document.getElementById('r-gross').textContent = fmt(gross);
  document.getElementById('r-fed').textContent = '-' + fmt(fed / perPeriod);
  document.getElementById('r-ss').textContent = '-' + fmt(ss / perPeriod);
  document.getElementById('r-med').textContent = '-' + fmt(med / perPeriod);
  document.getElementById('r-state').textContent = '-' + fmt(stTax / perPeriod);
  document.getElementById('r-net').textContent = fmt(net);
  const resultEl = document.getElementById('calc-result');
  resultEl.classList.add('show');
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});