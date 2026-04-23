import { LitElement, css, html } from 'https://unpkg.com/lit@3/index.js?module';


export class MyElement extends LitElement {
  static get properties() {
    return {
      _page:       { state: true },
      _tab:        { state: true },
      _amt:        { state: true },
      _custom:     { state: true },
      _useCustom:  { state: true },
      _payMethod:  { state: true },
      _payMode:    { state: true },
      _recurDay:   { state: true },
      _anon:       { state: true },
      _errors:     { state: true },
      _loading:    { state: true },
      _showModal:  { state: true },
      _modalData:  { state: true },
      _loginErr:   { state: true },
      _netFilter:  { state: true },
      _careerTab:  { state: true },
    }
  }

  constructor() {
    super()
    this._page      = 'login'
    this._tab       = 'home'
    this._amt       = 500
    this._custom    = ''
    this._useCustom = false
    this._payMethod = 'gcash'
    this._payMode   = 'one-time'
    this._recurDay  = 15
    this._anon      = false
    this._errors    = {}
    this._loading   = false
    this._showModal = false
    this._modalData = {}
    this._loginErr  = ''
    this._netFilter = 'near-me'
    this._careerTab = 'jobs'
  }

  _alumni = [
    { name:'Sarah Chen',     role:'Senior Product Designer', company:'TechFlair Inc.',  batch:'BS Computer Science \'18' },
    { name:'Marcus Johnson', role:'Head of Marketing',       company:'Global Corp',     batch:'BS Communications \'19'  },
    { name:'Elena Rodriguez',role:'Civil Engineer',          company:'BuildRight Inc.', batch:'BS Engineering \'18'     },
  ]

  _appeals = [
    { emoji:'🔬', tag:'VERIFIED · URGENT', tagColor:'#E11D48', title:'Robotics Club Finals Trip',  sub:'Class of 2024 · BS Computer Science', raised:3200,  goal:5000,  donors:24 },
    { emoji:'🌿', tag:'FEATURED',          tagColor:'#135BEC', title:'Urban Garden Study',         sub:'Engineering Dept · Senior Year',      raised:1800,  goal:3000,  donors:18 },
    { emoji:'🏥', tag:'URGENT',            tagColor:'#E11D48', title:'Medical Aid for Alumni Jao', sub:'Alumni Association · Emergency',      raised:12450, goal:20000, donors:97 },
  ]

  _txns = [
    { icon:'🔬', title:'Science Lab Fund',  sub:'Monthly Contribution', amount:'-₱60',    status:'Completed',  date:'Feb 23, 2025' },
    { icon:'🎓', title:'Scholarship Fund',  sub:'One-time Donation',    amount:'-₱1,200', status:'Completed',  date:'Jan 13, 2025' },
    { icon:'🎉', title:'Reunion Ticket',    sub:'Event Purchase',       amount:'-₱125',   status:'Processing', date:'Dec 01, 2024' },
  ]

  _jobs = [
    { title:'Senior Product Designer', company:'Google · Mountain View, CA', tags:['Full-time','Remote'],   salary:'$120k–$160k' },
    { title:'UX Researcher',           company:'Apple · New York, NY',        tags:['Full-time','On-site'], salary:'$110k–$140k' },
    { title:'Product Manager',         company:'Meta · Seattle, WA',          tags:['Hybrid'],              salary:'$130k–$180k' },
  ]

  _mentors = [
    { name:'Sarah Junious \'18',     role:'Specializing in digital strategy and board growth.', batch:'BS Marketing' },
    { name:'Marco Dela Cruz \'15',   role:'Can help with tech interviews and startup advice.',  batch:'BS CS'        },
  ]

  _docs = [
    { icon:'📄', title:'Official Transcript',      status:'Request',     color:'#135BEC' },
    { icon:'🎓', title:'e-Diploma',                status:'Download',    color:'#16a34a' },
    { icon:'✅', title:'Degree Verification',      status:'In Progress', color:'#e8a838' },
    { icon:'📋', title:'Certificate of Good Moral',status:'Request',     color:'#135BEC' },
    { icon:'🪪', title:'Student ID Replacement',   status:'Completed',   color:'#6b7280' },
  ]

  _presets   = [50, 100, 250, 500, 1000, 2500]
  _causeOpts = ['Alumni Business','Student Projects','Community Initiatives','Emergency Fund']

  get _finalAmt() {
    if (this._useCustom && this._custom) return parseFloat(this._custom) || 0
    return this._amt || 0
  }

  _doLogin(e) {
    e.preventDefault()
    const f     = this.shadowRoot.querySelector('#login-form')
    const email = f.querySelector('[name=email]').value
    const pass  = f.querySelector('[name=pass]').value
    if (!email || !pass) { this._loginErr = 'Please enter your email and password.'; return }
    this._loading = true
    setTimeout(() => { this._loading = false; this._page = 'app' }, 900)
  }

  _validateDonate(d) {
    const e = {}
    if (!this._anon) {
      if (!d.fn.trim()) e.fn = 'Required.'
      if (!d.ln.trim()) e.ln = 'Required.'
      if (!d.em.trim()) e.em = 'Required.'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.em)) e.em = 'Invalid email.'
    }
    if (!d.cause)                              e.cause = 'Select a cause.'
    if (!this._finalAmt || this._finalAmt < 1) e.amt   = 'Enter a valid amount (min ₱1).'
    return e
  }

  async _submitDonate(e) {
    e.preventDefault()
    const f    = this.shadowRoot.querySelector('#donate-form')
    const d    = { fn:f.fn?.value||'', ln:f.ln?.value||'', em:f.em?.value||'', cause:f.cause?.value||'' }
    const errs = this._validateDonate(d)
    this._errors = errs
    if (Object.keys(errs).length) return
    this._loading = true
    await new Promise(r => setTimeout(r, 900))
    this._loading   = false
    this._modalData = { name:this._anon?'Anonymous':`${d.fn} ${d.ln}`, amount:this._finalAmt, cause:d.cause, method:this._payMethod, mode:this._payMode }
    this._showModal = true
    f.reset()
    this._amt = 500; this._custom = ''; this._useCustom = false; this._errors = {}
  }

  _initials(name) { return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() }

  render() {
    if (this._page === 'login') return this._renderLogin()
    return html`
      ${this._renderTopNav()}
      <div class="page-wrap">
        ${this._tab==='home'    ? this._renderHome()    : ''}
        ${this._tab==='network' ? this._renderNetwork() : ''}
        ${this._tab==='donate'  ? this._renderDonate()  : ''}
        ${this._tab==='career'  ? this._renderCareer()  : ''}
        ${this._tab==='docs'    ? this._renderDocs()    : ''}
        ${this._tab==='profile' ? this._renderProfile() : ''}
      </div>
      ${this._renderBottomNav()}
      ${this._showModal ? this._renderSuccessModal() : ''}
    `
  }

  _renderLogin() {
    return html`
      <div class="login-wrap">
        <div class="login-hero">
          <img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Ateneo_de_Davao_University_seal.svg/200px-Ateneo_de_Davao_University_seal.svg.png"
            alt="AdDU seal" class="seal-img" />
          <p class="login-school">ATENEO DE DAVAO UNIVERSITY</p>
          <p class="login-nation">ADDU · NATION</p>
        </div>
        <div class="login-card">
          <div class="biometric-row">
            <div class="bio-icon">👤</div>
            <div>
              <p class="bio-label">Biometric Login</p>
              <p class="bio-sub">Use Biometric Link to retrieve record</p>
            </div>
          </div>
          <p class="or-label">OR LOGIN WITH</p>
          <form id="login-form" @submit=${this._doLogin} novalidate>
            <div class="fg">
              <label class="field-lbl">University ID / Email</label>
              <input name="email" type="email" placeholder="juan.delacruz@addu.edu.ph" />
            </div>
            <div class="fg">
              <div class="lbl-row">
                <label class="field-lbl">Password</label>
                <a class="forgot-link" href="#">Forgot?</a>
              </div>
              <input name="pass" type="password" placeholder="••••••••" />
            </div>
            ${this._loginErr ? html`<p class="err-msg">${this._loginErr}</p>` : ''}
            <button type="submit" class="login-btn" ?disabled=${this._loading}>
              ${this._loading ? 'Logging in…' : 'Log In →'}
            </button>
          </form>
          <p class="need-help">Need Help? &nbsp;<a href="#">Create Account</a></p>
        </div>
      </div>
    `
  }

  _renderTopNav() {
    return html`
      <nav class="top-nav">
        <div class="nav-left">
          <img class="nav-logo"
            src="https://upload.wikimedia.org/wikipedia/en/thumb/4/4e/Ateneo_de_Davao_University_seal.svg/200px-Ateneo_de_Davao_University_seal.svg.png"
            alt="AdDU" />
          <div>
            <p class="nav-school">ATENEO DE DAVAO UNIVERSITY</p>
            <p class="nav-sub">Alumni Network</p>
          </div>
        </div>
        <div class="nav-right">
          <button class="nav-icon-btn">🔔</button>
          <button class="avatar-btn" @click=${()=>this._tab='profile'}>AJ</button>
        </div>
      </nav>
    `
  }

  _renderBottomNav() {
    const tabs = [['home','🏠','Home'],['network','👥','Network'],['donate','💙','Donate'],['career','💼','Career'],['docs','📄','Docs']]
    return html`
      <nav class="bottom-nav">
        ${tabs.map(([id,ico,lbl]) => html`
          <button class="tab-btn ${this._tab===id?'active':''}" @click=${()=>this._tab=id}>
            <span class="tab-ico">${ico}</span>
            <span class="tab-lbl">${lbl}</span>
          </button>`)}
      </nav>
    `
  }

  _renderHome() {
    return html`
      <div class="home-hero">
        <div>
          <p class="home-welcome">Welcome back,</p>
          <h1 class="home-name">Hello, Adrian!</h1>
          <div class="home-meta">
            <span class="home-batch">Class of 2015</span>
            <span class="home-dept">Engineering Dept.</span>
          </div>
        </div>
        <div class="home-mascot">🧑‍💼</div>
      </div>
      <div class="snap-row">
        <div class="snap-card"><p class="snap-val">5</p><p class="snap-lbl">Jobs for You</p></div>
        <div class="snap-card snap-warn">
          <p class="snap-val">2 <span class="snap-badge">new</span></p>
          <p class="snap-lbl">Verified Alumni</p>
        </div>
        <div class="snap-card"><p class="snap-val">95%</p><p class="snap-lbl">Profile</p></div>
      </div>
      <div class="section">
        <p class="sec-lbl">Quick Actions</p>
        <div class="qa-grid">
          ${[['👤','My Profile','profile'],['📐','Student Projects','donate'],['💼','Business Support','career'],['🤝','Community','network'],['🚨','Emergency Aid','donate'],['💰','Fundraising','donate']].map(([ico,lbl,dest])=>html`
            <button class="qa-btn" @click=${()=>this._tab=dest}>
              <span class="qa-ico">${ico}</span>
              <span class="qa-lbl">${lbl}</span>
            </button>`)}
        </div>
      </div>
      <div class="impact-card">
        <div class="impact-head"><p class="impact-lbl">Your Total Impact</p><span>📊</span></div>
        <p class="impact-num">15 <span class="impact-unit">Projects Funded</span></p>
        <div class="impact-stats">
          <div><p class="ist-val">1,240+</p><p class="ist-lbl">Lives Touched</p></div>
          <div><p class="ist-val">₱2,500</p><p class="ist-lbl">Contributed</p></div>
        </div>
      </div>
      <div class="section">
        <div class="sec-header">
          <p class="sec-lbl">Transaction History</p>
          <a class="sec-link">View full history</a>
        </div>
        ${this._txns.map(t=>html`
          <div class="txn-row">
            <div class="list-icon">${t.icon}</div>
            <div class="list-info">
              <p class="list-title">${t.title}</p>
              <p class="list-sub">${t.sub} · <span class="status-${t.status==='Completed'?'done':t.status==='Processing'?'proc':'pend'}">${t.status}</span></p>
            </div>
            <div class="txn-right">
              <p class="txn-amt">${t.amount}</p>
              <p class="txn-date">${t.date}</p>
            </div>
          </div>`)}
      </div>
      <div class="section">
        <div class="sec-header"><p class="sec-lbl">Recent Activity</p><a class="sec-link">See All</a></div>
        ${[
          {ico:'💙',t:'New Donation Received',s:'Maria C. donated ₱320 on 18 February'},
          {ico:'📋',t:'Job Posting Approval', s:'Hearing House for Senior Dela now'},
          {ico:'👤',t:'New Alumni Registration',s:'3 new people have registered their profiles'},
        ].map(a=>html`
          <div class="act-row">
            <div class="act-icon">${a.ico}</div>
            <div><p class="list-title">${a.t}</p><p class="list-sub">${a.s}</p></div>
          </div>`)}
      </div>
    `
  }

  _renderNetwork() {
    return html`
      <div class="page-hero">
        <h2 class="page-hero-title">Alumni Network</h2>
        <p class="page-hero-sub">Discover and connect with peers</p>
        <div class="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Search by name, year, or industry" class="search-inp" />
        </div>
        <div class="filter-row">
          ${[['near-me','📍 Near Me'],['experts','Industry Experts']].map(([id,lbl])=>html`
            <button class="filter-btn ${this._netFilter===id?'active':''}" @click=${()=>this._netFilter=id}>${lbl}</button>`)}
        </div>
      </div>
      <div class="tab-strip">
        ${['Network','Alumni','Causes','Quest','Business'].map(t=>html`
          <button class="strip-tab ${t==='Network'?'active':''}">${t}</button>`)}
      </div>
      <div class="section">
        <div class="sec-header">
          <p class="sec-lbl">Featured Alumni</p>
          <a class="sec-link">View All</a>
        </div>
        ${this._alumni.map(a=>html`
          <div class="alumni-card">
            <div class="a-avatar">${this._initials(a.name)}</div>
            <div class="a-info">
              <p class="list-title">${a.name}</p>
              <p class="list-sub">${a.role} at ${a.company}</p>
              <p class="a-batch">${a.batch}</p>
            </div>
            <span class="a-tag">alumni</span>
          </div>
          <div class="alumni-btns">
            <button class="outline-btn">Connect</button>
            <button class="outline-btn">Message</button>
          </div>
          <div class="divider"></div>`)}
      </div>
    `
  }

  _renderDonate() {
    const amt   = this._finalAmt
    const fee   = amt ? Math.round(amt * 0.02 * 100) / 100 : 0
    const total = amt + fee
    return html`
      <div class="donate-hero">
        <p class="donate-eyebrow">Total money raised</p>
        <h1 class="donate-amount">$1,250.00</h1>
        <p class="donate-sub">Make an Impact Today</p>
        <div class="donate-cats">
          ${[['👥','Alumni\nBusiness'],['🔧','Student\nProjects'],['🤝','Community\nInitiatives'],['🚨','Emergency\nFund']].map(([ico,lbl])=>html`
            <button class="dcat"><span class="dcat-ico">${ico}</span><span class="dcat-lbl">${lbl}</span></button>`)}
        </div>
        <button class="campaign-btn">+ Start a Campaign</button>
      </div>
      <div class="section">
        <div class="sec-header">
          <p class="sec-lbl">Verified Urgent Appeals</p>
          <a class="sec-link">See All</a>
        </div>
        ${this._appeals.map(a=>{
          const pct=Math.round(a.raised/a.goal*100)
          return html`
            <div class="appeal-card">
              <div class="appeal-top">
                <div class="appeal-ico">${a.emoji}</div>
                <div>
                  <span class="appeal-tag" style="color:${a.tagColor}">${a.tag}</span>
                  <p class="list-title">${a.title}</p>
                  <p class="list-sub">${a.sub}</p>
                </div>
              </div>
              <div class="prog-bar"><div class="prog-fill" style="width:${pct}%"></div></div>
              <div class="prog-meta">
                <span class="prog-raised">₱${a.raised.toLocaleString()} raised</span>
                <span class="list-sub">${a.donors} donors</span>
              </div>
              <button class="donate-now-btn" @click=${()=>this.shadowRoot.getElementById('donate-anchor').scrollIntoView({behavior:'smooth'})}>Donate Now</button>
            </div>`
        })}
      </div>
      <div class="section" id="donate-anchor">
        <p class="sec-lbl">Complete Your Donation</p>
        <form id="donate-form" @submit=${this._submitDonate} novalidate>
          <div class="mode-toggle">
            <button type="button" class="mode-btn ${this._payMode==='one-time'?'active':''}" @click=${()=>this._payMode='one-time'}>One-time</button>
            <button type="button" class="mode-btn ${this._payMode==='recurring'?'active':''}" @click=${()=>this._payMode='recurring'}>Recurring</button>
          </div>
          ${this._payMode==='recurring' ? html`
            <div class="recur-grid">
              <button type="button" class="day-btn ${this._recurDay===15?'active':''}" @click=${()=>this._recurDay=15}>📅 Monthly (15th)</button>
              <button type="button" class="day-btn ${this._recurDay===30?'active':''}" @click=${()=>this._recurDay=30}>🔄 Monthly (30th)</button>
            </div>` : ''}
          <label class="field-lbl">Select Amount (₱)</label>
          <div class="amt-grid">
            ${this._presets.map(p=>html`
              <button type="button" class="amt-btn ${!this._useCustom&&this._amt===p?'active':''}"
                @click=${()=>{this._amt=p;this._useCustom=false;this._custom=''}}>₱${p.toLocaleString()}</button>`)}
          </div>
          <div class="pfx-wrap">
            <span class="pfx-sym">₱</span>
            <input type="number" class="pfx-inp ${this._errors.amt?'err':''}" placeholder="Custom amount"
              .value=${this._custom} @input=${e=>{this._custom=e.target.value;this._useCustom=true;this._amt=null}} min="1" />
          </div>
          ${this._errors.amt?html`<span class="err-msg">${this._errors.amt}</span>`:''}
          <div class="divider"></div>
          <div class="fg">
            <label class="field-lbl" for="cause">Donate to which cause?</label>
            <select id="cause" name="cause" class="${this._errors.cause?'err':''}">
              <option value="">— Select a cause —</option>
              ${this._causeOpts.map(o=>html`<option value="${o}">${o}</option>`)}
            </select>
            ${this._errors.cause?html`<span class="err-msg">${this._errors.cause}</span>`:''}
          </div>
          <div class="toggle-row">
            <label class="tog">
              <input type="checkbox" @change=${e=>this._anon=e.target.checked} />
              <span class="tog-track"></span>
            </label>
            <span class="tog-lbl">Donate anonymously</span>
          </div>
          ${!this._anon?html`
            <div class="row2 fg">
              <div>
                <label class="field-lbl">First name</label>
                <input type="text" name="fn" placeholder="Juan" class="${this._errors.fn?'err':''}" />
                ${this._errors.fn?html`<span class="err-msg">${this._errors.fn}</span>`:''}
              </div>
              <div>
                <label class="field-lbl">Last name</label>
                <input type="text" name="ln" placeholder="Dela Cruz" class="${this._errors.ln?'err':''}" />
                ${this._errors.ln?html`<span class="err-msg">${this._errors.ln}</span>`:''}
              </div>
            </div>
            <div class="row2 fg">
              <div>
                <label class="field-lbl">Email</label>
                <input type="email" name="em" placeholder="juan@addu.edu.ph" class="${this._errors.em?'err':''}" />
                ${this._errors.em?html`<span class="err-msg">${this._errors.em}</span>`:''}
              </div>
              <div>
                <label class="field-lbl">Phone (optional)</label>
                <input type="tel" placeholder="09xx xxx xxxx" />
              </div>
            </div>` : ''}
          <div class="fg">
            <label class="field-lbl">Message (optional)</label>
            <textarea placeholder="Leave a message of hope..."></textarea>
          </div>
          <div class="divider"></div>
          <div class="fg">
            <label class="field-lbl">Payment Method</label>
            <div class="pay-list">
              ${[['gcash','G','#135BEC','GCash','0917 ···· ····'],['card','💳','#040354','Linked Card','Visa ending in 4242']].map(([id,ico,bg,lbl,sub])=>html`
                <label class="pay-row ${this._payMethod===id?'active':''}">
                  <input type="radio" name="pay" value="${id}" ?checked=${this._payMethod===id} @change=${()=>this._payMethod=id} />
                  <div class="pay-ico" style="background:${bg}">${ico}</div>
                  <div class="pay-text"><span class="pay-name">${lbl}</span><span class="list-sub">${sub}</span></div>
                  <div class="pay-radio ${this._payMethod===id?'checked':''}"></div>
                </label>`)}
            </div>
          </div>
          ${amt?html`
            <div class="summary">
              <div class="sum-row"><span>Donation</span><span>₱${amt.toLocaleString()}</span></div>
              <div class="sum-row"><span>Processing fee (2%)</span><span>₱${fee.toLocaleString()}</span></div>
              <div class="sum-row total"><span>Total</span><span>₱${total.toLocaleString()}</span></div>
            </div>`:''}
          <button type="submit" class="sub-btn" ?disabled=${this._loading}>
            ${this._loading?'Processing…':`Secure Donation${amt?' ₱'+amt.toLocaleString():''} →`}
          </button>
          <p class="secure-note">🔒 Secure & encrypted — 98% goes directly to the cause</p>
        </form>
      </div>
    `
  }

  _renderCareer() {
    return html`
      <div class="page-hero">
        <h2 class="page-hero-title">Career Opportunities</h2>
        <p class="page-hero-sub">Discover paths shared by peers</p>
        <div class="search-bar">
          <span>🔍</span>
          <input type="text" placeholder="Search by name, year, or industry" class="search-inp" />
        </div>
      </div>
      <div class="tab-strip">
        ${['jobs','mentorship','workshops'].map(t=>html`
          <button class="strip-tab ${this._careerTab===t?'active':''}" @click=${()=>this._careerTab=t}>
            ${t.charAt(0).toUpperCase()+t.slice(1)}
          </button>`)}
      </div>
      ${this._careerTab==='jobs'?html`
        <div class="section">
          <div class="sec-header"><p class="sec-lbl">Recommended Jobs</p><a class="sec-link">View All</a></div>
          ${this._jobs.map(j=>html`
            <div class="job-card">
              <p class="list-title">${j.title}</p>
              <p class="list-sub">${j.company}</p>
              <div class="job-tags">
                ${j.tags.map(t=>html`<span class="job-tag">${t}</span>`)}
                <span class="salary-tag">${j.salary}</span>
              </div>
              <button class="apply-btn">Apply Now</button>
            </div>`)}
        </div>
        <div class="section">
          <div class="sec-header"><p class="sec-lbl">Meet Alumni Mentors</p><a class="sec-link">View All</a></div>
          ${this._mentors.map(m=>html`
            <div class="mentor-row">
              <div class="m-avatar">${this._initials(m.name)}</div>
              <div class="m-info">
                <p class="list-title">${m.name}</p>
                <p class="a-batch">${m.batch}</p>
                <p class="list-sub">${m.role}</p>
              </div>
              <button class="connect-btn">Connect</button>
            </div>`)}
        </div>` : html`
        <div class="section"><p class="empty-msg">${this._careerTab} content coming soon.</p></div>`}
    `
  }

  _renderDocs() {
    return html`
      <div class="page-hero">
        <h2 class="page-hero-title">Academic Records</h2>
        <p class="page-hero-sub">Manage your credentials</p>
      </div>
      <div class="section">
        <div class="passport-card">
          <div class="pass-head">
            <span class="pass-official">OFFICIAL DOCUMENT</span>
            <span class="pass-verified">✓ Verified</span>
          </div>
          <p class="pass-school">Ateneo de Davao University</p>
          <p class="pass-deg-lbl">DEGREE CONFERRED</p>
          <h3 class="pass-degree">Bachelor of Science in Information Technology</h3>
          <p class="pass-honors">Magna Cum Laude</p>
          <div class="pass-footer">
            <div><p class="pf-lbl">CLASS OF</p><p class="pf-val">2018</p></div>
            <div><p class="pf-lbl">PASSPORT ID</p><p class="pf-val">ADDU-2618-8921</p></div>
          </div>
          <button class="pass-share">🔗 Share Verification Link</button>
        </div>
      </div>
      <div class="section">
        <div class="sec-header"><p class="sec-lbl">Document Services</p><a class="sec-link">Request History</a></div>
        ${this._docs.map(d=>html`
          <div class="doc-row">
            <div class="doc-ico">${d.icon}</div>
            <p class="list-title">${d.title}</p>
            <button class="doc-action-btn" style="color:${d.color};border-color:${d.color}">${d.status}</button>
          </div>`)}
      </div>
      <div class="section">
        <p class="sec-lbl">Additional Credentials</p>
        ${[{ico:'💻',t:'Advanced Data Analytics',s:'Google Course Certs',tag:'Premium'},{ico:'📊',t:'Project Management',s:'PMI Institute',tag:'Finished'}].map(c=>html`
          <div class="cred-row">
            <div class="doc-ico">${c.ico}</div>
            <div><p class="list-title">${c.t}</p><p class="list-sub">${c.s}</p></div>
            <span class="cred-tag ${c.tag==='Premium'?'prem':'done'}">${c.tag}</span>
          </div>`)}
        <button class="add-badge-btn">+ Add External Badge</button>
      </div>
    `
  }

  _renderProfile() {
    return html`
      <div class="profile-bar">
        <button class="back-btn" @click=${()=>this._tab='home'}>← Back</button>
        <p class="profile-title">PROFILE</p>
        <button class="settings-btn">⚙️</button>
      </div>
      <div class="profile-cover"></div>
      <div class="profile-info">
        <div class="profile-avatar">AJ</div>
        <h2 class="profile-name">Adrian Josh</h2>
        <p class="list-sub">👤 Alumni with record ID</p>
        <div class="profile-badges">
          <span class="pbadge blue">AdDU</span>
          <span class="pbadge navy">Anniversary</span>
        </div>
      </div>
      <div class="section">
        <p class="sec-lbl">Academic Passport</p>
        <div class="passport-card">
          <div class="pass-head">
            <span class="pass-official">OFFICIAL DOCUMENT</span>
            <span class="pass-verified">✓ Verified</span>
          </div>
          <p class="pass-school">Ateneo de Davao University</p>
          <p class="pass-deg-lbl">DEGREE CONFERRED</p>
          <h3 class="pass-degree">Bachelor of Science in Social Work</h3>
          <p class="pass-honors">Magna Cum Laude</p>
          <div class="pass-footer">
            <div><p class="pf-lbl">CLASS OF</p><p class="pf-val">2018</p></div>
            <div><p class="pf-lbl">PASSPORT ID</p><p class="pf-val">ADDU-2618-8921</p></div>
          </div>
          <button class="pass-share">🔗 Share Verification Link</button>
        </div>
      </div>
      <div class="section">
        <p class="sec-lbl">Additional Credentials</p>
        ${[{ico:'💻',t:'Advanced Data Analytics',s:'Google Course Certs',tag:'Premium'},{ico:'📊',t:'Project Management',s:'PMI Institute',tag:'Finished'}].map(c=>html`
          <div class="cred-row">
            <div class="doc-ico">${c.ico}</div>
            <div><p class="list-title">${c.t}</p><p class="list-sub">${c.s}</p></div>
            <span class="cred-tag ${c.tag==='Premium'?'prem':'done'}">${c.tag}</span>
          </div>`)}
        <button class="add-badge-btn">+ Add External Badge</button>
      </div>
      <div class="section">
        <button class="logout-btn" @click=${()=>{this._page='login';this._tab='home'}}>Log Out</button>
      </div>
    `
  }

  _renderSuccessModal() {
    return html`
      <div class="modal-bg" @click=${e=>e.target===e.currentTarget&&(this._showModal=false)}>
        <div class="modal">
          <div class="modal-check">✓</div>
          <h3>You Made a Difference!</h3>
          <p>Your contribution is helping build the future.</p>
          <div class="modal-detail">
            <div class="md-row"><span>Donor</span><span>${this._modalData.name}</span></div>
            <div class="md-row"><span>Amount</span><span>₱${(this._modalData.amount||0).toLocaleString()}</span></div>
            <div class="md-row"><span>Cause</span><span>${this._modalData.cause}</span></div>
            <div class="md-row"><span>Method</span><span>${this._modalData.method?.toUpperCase()}</span></div>
            <div class="md-row"><span>Type</span><span>${this._modalData.mode}</span></div>
          </div>
          <button class="modal-share">📤 Share Impact</button>
          <button class="modal-close" @click=${()=>this._showModal=false}>Back to Dashboard</button>
        </div>
      </div>
    `
  }

  static get styles() {
    return css`
      :host { display:block; font-family:'Segoe UI',system-ui,sans-serif; background:#f5f6fa; color:#040354; max-width:480px; margin:0 auto; min-height:100vh; }
      * { box-sizing:border-box; margin:0; padding:0; }
      .login-wrap { min-height:100vh; display:flex; flex-direction:column; }
      .login-hero { background:linear-gradient(160deg,#040354 0%,#0a0a6e 60%,#135BEC 100%); padding:52px 24px 44px; text-align:center; color:#fff; }
      .seal-img { width:72px; height:72px; object-fit:contain; margin-bottom:12px; }
      .login-school { font-size:.65rem; font-weight:700; letter-spacing:.12em; color:rgba(255,255,255,.7); margin-bottom:4px; }
      .login-nation { font-size:.78rem; font-weight:700; color:rgba(255,255,255,.45); letter-spacing:.2em; }
      .login-card { flex:1; background:#fff; border-radius:24px 24px 0 0; padding:28px 20px 40px; margin-top:-16px; }
      .biometric-row { display:flex; align-items:center; gap:12px; background:#f0f5ff; border:1px solid #c7d7fb; border-radius:12px; padding:12px 14px; margin-bottom:20px; }
      .bio-icon { font-size:1.4rem; }
      .bio-label { font-size:.88rem; font-weight:700; color:#040354; }
      .bio-sub { font-size:.7rem; color:#6b7280; }
      .or-label { text-align:center; font-size:.7rem; font-weight:700; color:#9ca3af; letter-spacing:.1em; margin-bottom:16px; }
      .lbl-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; }
      .forgot-link { font-size:.76rem; color:#135BEC; font-weight:600; text-decoration:none; }
      .login-btn { width:100%; padding:14px; background:#040354; color:#fff; border:none; border-radius:12px; font-family:inherit; font-size:.93rem; font-weight:700; cursor:pointer; margin-top:8px; transition:background .2s; }
      .login-btn:hover { background:#135BEC; }
      .login-btn:disabled { background:#9ca3af; cursor:not-allowed; }
      .need-help { text-align:center; font-size:.76rem; color:#9ca3af; margin-top:14px; }
      .need-help a { color:#135BEC; font-weight:600; text-decoration:none; }
      .top-nav { background:#040354; padding:10px 16px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:20; }
      .nav-left { display:flex; align-items:center; gap:10px; }
      .nav-logo { width:30px; height:30px; border-radius:50%; object-fit:contain; background:#fff; padding:2px; }
      .nav-school { font-size:.55rem; font-weight:700; color:rgba(255,255,255,.55); letter-spacing:.08em; text-transform:uppercase; }
      .nav-sub { font-size:.75rem; font-weight:600; color:#fff; }
      .nav-right { display:flex; align-items:center; gap:8px; }
      .nav-icon-btn { background:rgba(255,255,255,.12); border:none; border-radius:50%; width:32px; height:32px; cursor:pointer; font-size:.9rem; }
      .avatar-btn { width:32px; height:32px; border-radius:50%; background:#135BEC; color:#fff; border:none; font-size:.7rem; font-weight:800; cursor:pointer; }
      .page-wrap { padding-bottom:72px; }
      .section { padding:16px 16px 0; }
      .sec-lbl { font-size:.75rem; font-weight:700; color:#040354; text-transform:uppercase; letter-spacing:.04em; margin-bottom:10px; }
      .sec-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
      .sec-link { font-size:.76rem; color:#135BEC; font-weight:600; text-decoration:none; cursor:pointer; }
      .field-lbl { display:block; font-size:.8rem; font-weight:600; color:#040354; margin-bottom:7px; }
      .list-title { font-size:.85rem; font-weight:700; color:#040354; }
      .list-sub { font-size:.7rem; color:#6b7280; }
      .divider { height:1px; background:#e8eaf0; margin:14px 0; }
      .fg { margin-bottom:13px; }
      .row2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
      .err-msg { font-size:.7rem; color:#E11D48; margin-top:3px; display:block; }
      input,select,textarea { width:100%; padding:10px 12px; border:1.5px solid #e2dce8; border-radius:10px; font-family:inherit; font-size:.87rem; color:#040354; background:#fff; outline:none; transition:border-color .15s; appearance:none; -webkit-appearance:none; }
      input:focus,select:focus,textarea:focus { border-color:#135BEC; }
      input.err,select.err { border-color:#E11D48; }
      textarea { resize:vertical; min-height:70px; }
      .empty-msg { color:#9ca3af; font-size:.85rem; padding:24px 0; text-align:center; }
      .home-hero { background:linear-gradient(135deg,#040354 0%,#135BEC 100%); padding:22px 16px; display:flex; justify-content:space-between; align-items:center; }
      .home-welcome { font-size:.78rem; color:rgba(255,255,255,.7); margin-bottom:2px; }
      .home-name { font-size:1.75rem; font-weight:800; color:#fff; margin-bottom:8px; }
      .home-meta { display:flex; gap:8px; align-items:center; }
      .home-batch { font-size:.7rem; color:#e8a838; font-weight:700; background:rgba(232,168,56,.15); border:1px solid rgba(232,168,56,.3); padding:2px 10px; border-radius:100px; }
      .home-dept { font-size:.7rem; color:rgba(255,255,255,.65); }
      .home-mascot { font-size:2.8rem; }
      .snap-row { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding:12px 16px; background:#fff; }
      .snap-card { background:#f0f5ff; border-radius:10px; padding:10px 8px; text-align:center; }
      .snap-warn { background:#fef3e2; }
      .snap-val { font-size:1.15rem; font-weight:800; color:#040354; }
      .snap-badge { font-size:.6rem; background:#E11D48; color:#fff; border-radius:100px; padding:1px 6px; vertical-align:middle; }
      .snap-lbl { font-size:.63rem; color:#6b7280; margin-top:2px; }
      .qa-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:16px; }
      .qa-btn { background:#fff; border:1px solid #e2dce8; border-radius:12px; padding:12px 8px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:5px; transition:border-color .15s; }
      .qa-btn:hover { border-color:#135BEC; }
      .qa-ico { font-size:1.15rem; }
      .qa-lbl { font-size:.65rem; color:#040354; font-weight:600; text-align:center; }
      .impact-card { margin:16px; background:#040354; border-radius:16px; padding:16px 18px; color:#fff; }
      .impact-head { display:flex; justify-content:space-between; margin-bottom:8px; }
      .impact-lbl { font-size:.75rem; color:rgba(255,255,255,.65); }
      .impact-num { font-size:1.5rem; font-weight:800; margin-bottom:12px; }
      .impact-unit { font-size:.75rem; font-weight:400; color:rgba(255,255,255,.6); }
      .impact-stats { display:flex; gap:24px; border-top:1px solid rgba(255,255,255,.15); padding-top:10px; }
      .ist-val { font-size:.95rem; font-weight:700; color:#e8a838; }
      .ist-lbl { font-size:.6rem; color:rgba(255,255,255,.5); text-transform:uppercase; letter-spacing:.06em; }
      .txn-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f0f0f0; }
      .list-icon,.act-icon { width:38px; height:38px; border-radius:10px; background:#f0f5ff; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
      .act-icon { border-radius:50%; }
      .list-info,.a-info { flex:1; min-width:0; }
      .status-done { color:#16a34a; font-weight:600; }
      .status-proc { color:#e8a838; font-weight:600; }
      .txn-right { text-align:right; flex-shrink:0; }
      .txn-amt { font-size:.83rem; font-weight:700; color:#040354; }
      .txn-date { font-size:.64rem; color:#9ca3af; }
      .act-row { display:flex; gap:10px; padding:10px 0; border-bottom:1px solid #f0f0f0; align-items:flex-start; }
      .page-hero { background:linear-gradient(135deg,#040354 0%,#135BEC 100%); padding:20px 16px 22px; }
      .page-hero-title { font-size:1.2rem; font-weight:800; color:#fff; margin-bottom:2px; }
      .page-hero-sub { font-size:.76rem; color:rgba(255,255,255,.65); margin-bottom:12px; }
      .search-bar { display:flex; align-items:center; background:#fff; border-radius:10px; padding:8px 12px; gap:8px; margin-bottom:10px; }
      .search-inp { border:none; background:transparent; flex:1; font-family:inherit; font-size:.83rem; color:#040354; outline:none; }
      .filter-row { display:flex; gap:8px; }
      .filter-btn { padding:6px 14px; border-radius:100px; border:1.5px solid rgba(255,255,255,.3); background:transparent; color:rgba(255,255,255,.75); font-family:inherit; font-size:.76rem; font-weight:600; cursor:pointer; transition:all .15s; }
      .filter-btn.active { background:#fff; color:#040354; border-color:#fff; }
      .tab-strip { display:flex; overflow-x:auto; background:#fff; border-bottom:1px solid #e8eaf0; padding:0 8px; }
      .strip-tab { padding:10px 14px; border:none; background:transparent; font-family:inherit; font-size:.8rem; font-weight:600; color:#9ca3af; cursor:pointer; white-space:nowrap; border-bottom:2px solid transparent; transition:all .15s; }
      .strip-tab.active { color:#135BEC; border-bottom-color:#135BEC; }
      .alumni-card { display:flex; align-items:center; gap:12px; padding-top:4px; }
      .a-avatar { width:44px; height:44px; border-radius:50%; background:#040354; color:#fff; display:flex; align-items:center; justify-content:center; font-size:.8rem; font-weight:800; flex-shrink:0; }
      .a-batch { font-size:.65rem; color:#9ca3af; }
      .a-tag { font-size:.6rem; background:#f0f5ff; color:#135BEC; padding:3px 8px; border-radius:100px; font-weight:700; flex-shrink:0; }
      .alumni-btns { display:flex; gap:8px; padding:8px 0; }
      .outline-btn { flex:1; padding:7px; border:1.5px solid #e2dce8; border-radius:8px; background:transparent; font-family:inherit; font-size:.76rem; font-weight:600; color:#040354; cursor:pointer; }
      .outline-btn:hover { border-color:#135BEC; color:#135BEC; }
      .donate-hero { background:linear-gradient(160deg,#040354 0%,#0a0a6e 50%,#135BEC 100%); padding:22px 16px 26px; color:#fff; text-align:center; }
      .donate-eyebrow { font-size:.73rem; color:rgba(255,255,255,.6); margin-bottom:4px; }
      .donate-amount { font-size:2.1rem; font-weight:800; letter-spacing:-.03em; margin-bottom:4px; }
      .donate-sub { font-size:.83rem; color:rgba(255,255,255,.7); margin-bottom:16px; }
      .donate-cats { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin-bottom:12px; }
      .dcat { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.15); border-radius:12px; padding:9px 4px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:3px; }
      .dcat-ico { font-size:1.05rem; }
      .dcat-lbl { font-size:.58rem; color:rgba(255,255,255,.85); text-align:center; white-space:pre-line; line-height:1.3; }
      .campaign-btn { width:100%; padding:11px; background:transparent; border:1.5px solid rgba(255,255,255,.4); border-radius:12px; color:#fff; font-family:inherit; font-size:.87rem; font-weight:600; cursor:pointer; }
      .appeal-card { background:#fff; border-radius:14px; padding:14px; margin-bottom:10px; border:1px solid #e8eaf0; }
      .appeal-top { display:flex; gap:12px; margin-bottom:10px; }
      .appeal-ico { width:40px; height:40px; border-radius:10px; background:#f0f5ff; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
      .appeal-tag { font-size:.58rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; display:block; margin-bottom:2px; }
      .prog-bar { height:5px; background:#e8eaf0; border-radius:100px; overflow:hidden; margin-bottom:5px; }
      .prog-fill { height:100%; background:linear-gradient(90deg,#135BEC,#040354); border-radius:100px; }
      .prog-meta { display:flex; justify-content:space-between; margin-bottom:10px; }
      .prog-raised { font-size:.72rem; font-weight:700; color:#040354; }
      .donate-now-btn { width:100%; padding:10px; background:#040354; color:#fff; border:none; border-radius:10px; font-family:inherit; font-size:.82rem; font-weight:700; cursor:pointer; transition:background .15s; }
      .donate-now-btn:hover { background:#135BEC; }
      .mode-toggle { display:flex; background:#e8eaf0; border-radius:10px; padding:3px; margin-bottom:13px; }
      .mode-btn { flex:1; padding:9px; border:none; border-radius:8px; font-family:inherit; font-size:.83rem; font-weight:600; cursor:pointer; background:transparent; color:#6b7280; transition:all .15s; }
      .mode-btn.active { background:#fff; color:#040354; box-shadow:0 1px 4px rgba(0,0,0,.1); }
      .recur-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:13px; }
      .day-btn { padding:11px 8px; border:1.5px solid #e2dce8; border-radius:12px; background:#fff; font-family:inherit; font-size:.78rem; font-weight:600; color:#6b7280; cursor:pointer; transition:all .15s; }
      .day-btn.active { border-color:#135BEC; background:#f0f5ff; color:#135BEC; }
      .amt-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:8px; }
      .amt-btn { padding:10px 6px; border:1.5px solid #e2dce8; border-radius:10px; background:#fff; font-family:inherit; font-size:.87rem; font-weight:700; color:#6b7280; cursor:pointer; transition:all .15s; }
      .amt-btn:hover { border-color:#135BEC; color:#135BEC; }
      .amt-btn.active { background:#040354; border-color:#040354; color:#fff; }
      .pfx-wrap { position:relative; margin-bottom:2px; }
      .pfx-sym { position:absolute; left:12px; top:50%; transform:translateY(-50%); font-weight:700; color:#6b7280; pointer-events:none; font-size:.87rem; }
      .pfx-inp { padding-left:26px; }
      .toggle-row { display:flex; align-items:center; gap:10px; margin-bottom:13px; }
      .tog { position:relative; width:42px; height:24px; flex-shrink:0; }
      .tog input { opacity:0; width:0; height:0; }
      .tog-track { position:absolute; inset:0; background:#d1d5db; border-radius:100px; cursor:pointer; transition:background .2s; }
      .tog-track::after { content:''; position:absolute; width:18px; height:18px; left:3px; top:3px; background:#fff; border-radius:50%; transition:transform .2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
      .tog input:checked + .tog-track { background:#135BEC; }
      .tog input:checked + .tog-track::after { transform:translateX(18px); }
      .tog-lbl { font-size:.82rem; color:#6b7280; }
      .pay-list { display:flex; flex-direction:column; gap:8px; }
      .pay-row { display:flex; align-items:center; gap:12px; background:#fff; border:1.5px solid #e2dce8; border-radius:12px; padding:12px 14px; cursor:pointer; transition:border-color .15s; }
      .pay-row input[type=radio] { display:none; }
      .pay-row.active { border-color:#135BEC; background:#f0f5ff; }
      .pay-ico { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:.88rem; font-weight:800; flex-shrink:0; }
      .pay-text { flex:1; }
      .pay-name { display:block; font-size:.82rem; font-weight:700; color:#040354; }
      .pay-radio { width:20px; height:20px; border-radius:50%; border:2px solid #d1d5db; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all .15s; }
      .pay-radio.checked { border-color:#135BEC; background:#135BEC; }
      .pay-radio.checked::after { content:''; width:8px; height:8px; border-radius:50%; background:#fff; display:block; }
      .summary { background:#f0f5ff; border:1.5px solid #c7d7fb; border-radius:12px; padding:13px 16px; margin-bottom:13px; }
      .sum-row { display:flex; justify-content:space-between; font-size:.8rem; color:#6b7280; margin-bottom:4px; }
      .sum-row.total { font-weight:700; font-size:.9rem; color:#040354; border-top:1px solid #c7d7fb; padding-top:8px; margin-top:4px; margin-bottom:0; }
      .sub-btn { width:100%; padding:13px; background:#135BEC; color:#fff; border:none; border-radius:12px; font-family:inherit; font-size:.92rem; font-weight:700; cursor:pointer; margin-bottom:8px; transition:background .2s; }
      .sub-btn:hover { background:#040354; }
      .sub-btn:disabled { background:#9ca3af; cursor:not-allowed; }
      .secure-note { text-align:center; font-size:.68rem; color:#9ca3af; padding-bottom:16px; }
      .job-card { background:#fff; border-radius:14px; padding:14px; margin-bottom:10px; border:1px solid #e8eaf0; }
      .job-tags { display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin:8px 0 10px; }
      .job-tag { font-size:.66rem; background:#f0f5ff; color:#135BEC; padding:3px 8px; border-radius:100px; font-weight:600; }
      .salary-tag { font-size:.7rem; font-weight:700; color:#16a34a; margin-left:auto; }
      .apply-btn { width:100%; padding:9px; background:#040354; color:#fff; border:none; border-radius:10px; font-family:inherit; font-size:.8rem; font-weight:700; cursor:pointer; transition:background .15s; }
      .apply-btn:hover { background:#135BEC; }
      .mentor-row { display:flex; align-items:flex-start; gap:12px; padding:10px 0; border-bottom:1px solid #f0f0f0; }
      .m-avatar { width:42px; height:42px; border-radius:50%; background:#135BEC; color:#fff; display:flex; align-items:center; justify-content:center; font-size:.77rem; font-weight:800; flex-shrink:0; }
      .m-info { flex:1; min-width:0; }
      .a-batch { font-size:.65rem; color:#9ca3af; margin-bottom:2px; }
      .connect-btn { padding:7px 14px; background:#f0f5ff; color:#135BEC; border:1.5px solid #c7d7fb; border-radius:8px; font-family:inherit; font-size:.73rem; font-weight:700; cursor:pointer; flex-shrink:0; }
      .passport-card { background:#040354; border-radius:16px; padding:18px; color:#fff; margin-bottom:16px; }
      .pass-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
      .pass-official { font-size:.58rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(255,255,255,.5); }
      .pass-verified { font-size:.6rem; font-weight:700; color:#4ade80; background:rgba(74,222,128,.1); padding:2px 8px; border-radius:100px; }
      .pass-school { font-size:.7rem; color:rgba(255,255,255,.55); margin-bottom:10px; }
      .pass-deg-lbl { font-size:.58rem; text-transform:uppercase; letter-spacing:.1em; color:rgba(255,255,255,.4); margin-bottom:4px; }
      .pass-degree { font-size:1.05rem; font-weight:800; line-height:1.2; margin-bottom:4px; }
      .pass-honors { font-size:.7rem; color:#e8a838; margin-bottom:12px; }
      .pass-footer { display:flex; gap:24px; border-top:1px solid rgba(255,255,255,.15); padding-top:10px; margin-bottom:12px; }
      .pf-lbl { font-size:.56rem; text-transform:uppercase; letter-spacing:.08em; color:rgba(255,255,255,.4); margin-bottom:2px; }
      .pf-val { font-size:.8rem; font-weight:700; }
      .pass-share { width:100%; padding:10px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2); border-radius:10px; color:#fff; font-family:inherit; font-size:.8rem; font-weight:600; cursor:pointer; }
      .doc-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f0f0f0; }
      .doc-ico { width:36px; height:36px; background:#f0f5ff; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:.95rem; flex-shrink:0; }
      .doc-action-btn { padding:5px 12px; border-radius:100px; font-family:inherit; font-size:.7rem; font-weight:700; cursor:pointer; background:transparent; }
      .cred-row { display:flex; align-items:center; gap:12px; padding:10px 0; border-bottom:1px solid #f0f0f0; }
      .cred-tag { font-size:.63rem; font-weight:700; padding:3px 10px; border-radius:100px; }
      .cred-tag.prem { background:#fef3e2; color:#b45309; }
      .cred-tag.done { background:#f0fdf4; color:#16a34a; }
      .add-badge-btn { width:100%; margin-top:12px; margin-bottom:16px; padding:10px; background:transparent; border:1.5px dashed #c7d7fb; border-radius:10px; color:#135BEC; font-family:inherit; font-size:.8rem; font-weight:600; cursor:pointer; }
      .profile-bar { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; background:#fff; border-bottom:1px solid #e8eaf0; }
      .back-btn { background:none; border:none; font-family:inherit; font-size:.83rem; color:#135BEC; font-weight:600; cursor:pointer; }
      .profile-title { font-size:.78rem; font-weight:800; color:#040354; letter-spacing:.08em; }
      .settings-btn { background:none; border:none; font-size:.95rem; cursor:pointer; }
      .profile-cover { height:80px; background:linear-gradient(135deg,#040354,#135BEC); }
      .profile-info { display:flex; flex-direction:column; align-items:center; padding:0 16px 16px; margin-top:-28px; }
      .profile-avatar { width:56px; height:56px; border-radius:50%; background:#135BEC; border:3px solid #fff; color:#fff; display:flex; align-items:center; justify-content:center; font-size:1.1rem; font-weight:800; margin-bottom:8px; }
      .profile-name { font-size:1.15rem; font-weight:800; color:#040354; margin-bottom:4px; }
      .profile-badges { display:flex; gap:8px; margin-top:8px; }
      .pbadge { font-size:.66rem; font-weight:700; padding:3px 10px; border-radius:100px; }
      .pbadge.blue { background:#f0f5ff; color:#135BEC; }
      .pbadge.navy { background:#f0f0ff; color:#040354; }
      .logout-btn { width:100%; padding:12px; background:#fff; border:1.5px solid #E11D48; color:#E11D48; border-radius:10px; font-family:inherit; font-size:.87rem; font-weight:700; cursor:pointer; margin-bottom:16px; transition:all .2s; }
      .logout-btn:hover { background:#E11D48; color:#fff; }
      .bottom-nav { position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:480px; background:#fff; border-top:1px solid #e8eaf0; display:flex; height:62px; z-index:20; }
      .tab-btn { flex:1; border:none; background:transparent; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; padding:6px 0; }
      .tab-ico { font-size:1.1rem; }
      .tab-lbl { font-size:.57rem; font-weight:600; color:#9ca3af; }
      .tab-btn.active .tab-lbl { color:#135BEC; }
      .modal-bg { position:fixed; inset:0; background:rgba(4,3,84,.6); display:flex; align-items:flex-end; justify-content:center; z-index:100; }
      .modal { background:#fff; border-radius:24px 24px 0 0; padding:28px 20px 36px; width:100%; max-width:480px; text-align:center; }
      .modal-check { width:56px; height:56px; border-radius:50%; background:#040354; color:#fff; font-size:1.4rem; font-weight:700; display:flex; align-items:center; justify-content:center; margin:0 auto 12px; }
      .modal h3 { font-size:1.15rem; font-weight:800; color:#040354; margin-bottom:6px; }
      .modal > p { font-size:.82rem; color:#6b7280; margin-bottom:13px; }
      .modal-detail { background:#f5f6fa; border-radius:12px; padding:12px 14px; margin-bottom:13px; text-align:left; }
      .md-row { display:flex; justify-content:space-between; font-size:.78rem; padding:4px 0; }
      .md-row span:first-child { color:#9ca3af; }
      .md-row span:last-child { font-weight:700; color:#040354; }
      .modal-share { width:100%; padding:12px; background:#f0f5ff; color:#135BEC; border:1.5px solid #c7d7fb; border-radius:10px; font-family:inherit; font-size:.87rem; font-weight:700; cursor:pointer; margin-bottom:8px; }
      .modal-close { width:100%; padding:12px; background:#040354; color:#fff; border:none; border-radius:10px; font-family:inherit; font-size:.87rem; font-weight:700; cursor:pointer; }
      .modal-close:hover { background:#135BEC; }
      @media (max-width:480px) { .row2 { grid-template-columns:1fr; } }
    `
  }
}

customElements.define('my-element', MyElement);