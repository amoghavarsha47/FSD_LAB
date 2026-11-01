import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownUp, ArrowLeft, ArrowRight, BadgeCheck, Bell, BookOpen, Check,
  CheckCircle2, ChevronDown, CircleHelp, Clock3, Eye, EyeOff, Flag, Heart,
  House, LayoutDashboard, LayoutGrid, Laptop, Leaf, LockKeyhole, LogOut,
  Menu, MessageCircle, Package, Plus, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Star, Tag, UserRound, Wallet, X, Armchair, LampDesk, FlaskConical,
  BookMarked, MapPin, CircleDollarSign, ClipboardCheck, AlertTriangle, Send,
  CheckCheck, Settings2, ArrowUpRight, Handshake, ScanLine, Recycle
} from 'lucide-react'
import { categories, initialProducts, categoryDeposits, demoFees, formatINR, suggestCategory } from './data'

const STORE_KEY = 'bms-loop-demo-v1'
const DEMO_OTP = '246810'

function readStore() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}
function writeStore(next) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(next)) } catch { /* storage may be disabled */ }
}
function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = readStore()
    return stored[key] ?? initialValue
  })
  useEffect(() => {
    const stored = readStore()
    writeStore({ ...stored, [key]: value })
  }, [key, value])
  return [value, setValue]
}
function IconForCategory({ name, size = 18 }) {
  const icons = {
    'All items': LayoutGrid,
    'Books & notes': BookOpen,
    Electronics: Laptop,
    Furniture: Armchair,
    'Hostel essentials': LampDesk,
    'Lab equipment': FlaskConical,
    Other: Package,
  }
  const Icon = icons[name] || Package
  return <Icon size={size} strokeWidth={1.8} aria-hidden="true" />
}
function StatusBadge({ status }) {
  const className = status === 'Available' ? 'status-available'
    : status === 'Under Agreement' ? 'status-agreement'
    : status === 'Sold' ? 'status-sold'
    : status === 'Pending Review' ? 'status-pending'
    : 'status-rejected'
  return <span className={`status-badge ${className}`}><span />{status}</span>
}
function Button({ children, variant = 'primary', className = '', ...props }) {
  return <button className={`button button-${variant} ${className}`} {...props}>{children}</button>
}
function Field({ label, hint, error, children, className = '' }) {
  return <div className={`field ${className}`}><label>{label}</label>{children}{hint && !error && <small className="field-hint">{hint}</small>}{error && <small className="field-error">{error}</small>}</div>
}
function Header({ page, setPage, user, onLogout, onOpenSell, mobileOpen, setMobileOpen }) {
  const nav = [
    { id: 'marketplace', label: 'Marketplace', icon: House },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'dashboard', label: 'My activity', icon: LayoutDashboard },
  ]
  return <header className="site-header">
    <div className="header-inner">
      <button className="brand" onClick={() => setPage('marketplace')} aria-label="BMS Loop home">
        <span className="brand-mark"><Recycle size={21} strokeWidth={2.2} /></span>
        <span className="brand-wordmark">BMS <b>Loop</b><small>THE CAMPUS EXCHANGE</small></span>
      </button>
      <nav className={`main-nav ${mobileOpen ? 'main-nav-open' : ''}`} aria-label="Main navigation">
        {nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-link ${page === id ? 'nav-link-active' : ''}`} onClick={() => { setPage(id); setMobileOpen(false) }}><Icon size={17} />{label}</button>)}
        <button className={`nav-link ${page === 'admin' ? 'nav-link-active' : ''}`} onClick={() => { setPage('admin'); setMobileOpen(false) }}><ShieldCheck size={17} />Moderation</button>
      </nav>
      <div className="header-actions">
        <button className="button button-primary header-sell" onClick={onOpenSell}><Plus size={17} /> Sell an item</button>
        <button className="avatar-button" aria-label="Open profile" onClick={() => setPage('dashboard')}><span>{(user?.name || 'Student').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</span></button>
        <button className="icon-button mobile-menu-button" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
  </header>
}
function ProductCard({ product, saved, onSave, onOpen }) {
  const percent = product.originalPrice > product.price ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  return <article className="product-card">
    <button className="product-image-wrap" onClick={() => onOpen(product)} aria-label={`View ${product.title}`}>
      <img src={product.image} alt={product.imageAlt || product.title} loading="lazy" />
      <span className="condition-tag">{product.condition}</span>
      {percent > 0 && <span className="saving-tag">{percent}% less</span>}
    </button>
    <div className="product-card-body">
      <div className="product-category">{product.category}</div>
      <button className="product-title" onClick={() => onOpen(product)}>{product.title}</button>
      <div className="product-price-row"><strong>{formatINR(product.price)}</strong>{product.originalPrice > product.price && <del>{formatINR(product.originalPrice)}</del>}</div>
      <div className="product-meta"><span><Star size={13} fill="currentColor" /> {product.rating?.toFixed(1) || 'New'}</span><span className="meta-dot">·</span><span>{product.seller}</span></div>
      <div className="product-card-footer">
        <span className="verified-mini"><BadgeCheck size={14} /> BMSCE verified</span>
        <button className={`save-button ${saved ? 'save-button-active' : ''}`} onClick={() => onSave(product.id)} aria-label={saved ? `Remove ${product.title} from saved items` : `Save ${product.title}`} aria-pressed={saved}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
    </div>
  </article>
}
function EmptyState({ icon: Icon = Package, title, description, action, onAction }) {
  return <div className="empty-state"><span className="empty-icon"><Icon size={25} /></span><h3>{title}</h3><p>{description}</p>{action && <Button onClick={onAction}>{action}</Button>}</div>
}
function Marketplace({ products, saved, onSave, onOpen, onSell, search, setSearch, category, setCategory, sort, setSort }) {
  const [showFilters, setShowFilters] = useState(false)
  const [condition, setCondition] = useState('Any condition')
  const [maxPrice, setMaxPrice] = useState('2500')
  const [filtersApplied, setFiltersApplied] = useState(false)
  const visibleProducts = useMemo(() => {
    const filtered = products.filter(p => p.status === 'Available'
      && (category === 'All items' || p.category === category)
      && (p.title + ' ' + p.category + ' ' + p.seller + ' ' + p.description).toLowerCase().includes(search.toLowerCase().trim())
      && (!filtersApplied || condition === 'Any condition' || p.condition === condition)
      && (!filtersApplied || p.price <= Number(maxPrice || 0)))
    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price)
    if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price)
    if (sort === 'newest') filtered.sort((a, b) => String(b.id).localeCompare(String(a.id)))
    return filtered
  }, [products, category, search, sort, condition, maxPrice, filtersApplied])
  return <main className="page-shell">
    <section className="market-hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-line" /> MADE FOR THE BMSCE COMMUNITY</div>
        <h1>Good things deserve<br /><em>another round.</em></h1>
        <p>Find pre-loved essentials from people on your campus. Spend a little less, waste a little less.</p>
        <div className="hero-actions"><Button onClick={() => document.getElementById('market-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>Explore listings <ArrowRight size={16} /></Button><button className="text-button" onClick={onSell}>Have something to pass on? <span>Sell an item</span></button></div>
        <div className="hero-proof"><span><ShieldCheck size={15} /> BMSCE email community</span><span><MapPin size={15} /> Campus handovers</span></div>
      </div>
      <div className="hero-art" aria-label="Illustration of circular reuse">
        <div className="hero-art-caption"><span className="hero-art-number">01 / 03</span><span>Keep useful things in use.</span></div>
        <div className="hero-circle hero-circle-one"></div><div className="hero-circle hero-circle-two"></div>
        <div className="hero-stamp"><Recycle size={33} /><span>PASS IT<br />FORWARD</span></div>
        <div className="hero-art-note"><Leaf size={15} /> Better for your budget. Better for the planet.</div>
      </div>
    </section>
    <section className="trust-strip" aria-label="Marketplace principles">
      <div><span className="trust-icon"><BadgeCheck size={18} /></span><span><b>Campus-only community</b><small>College email eligibility</small></span></div>
      <div><span className="trust-icon"><Handshake size={18} /></span><span><b>Agree before you meet</b><small>Negotiation-friendly listings</small></span></div>
      <div><span className="trust-icon"><Recycle size={18} /></span><span><b>Reuse with purpose</b><small>Built around SDG 12</small></span></div>
    </section>
    <section className="market-section" id="market-listings">
      <div className="section-heading">
        <div><div className="eyebrow">THE CAMPUS EXCHANGE</div><h2>Find your next <em>good thing.</em></h2><p>Useful finds, shared by students like you.</p></div>
        <span className="listing-count">{visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'items'} available</span>
      </div>
      <div className="search-toolbar">
        <label className="search-box"><Search size={19} /><input aria-label="Search listings" placeholder="Search books, tech, hostel essentials…" value={search} onChange={e => setSearch(e.target.value)} /><kbd>⌕</kbd></label>
        <button className={`button button-outline filter-toggle ${showFilters ? 'filter-toggle-active' : ''}`} onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16} /> Filters</button>
        <label className="sort-select"><ArrowDownUp size={15} /><select aria-label="Sort listings" value={sort} onChange={e => setSort(e.target.value)}><option value="recommended">Recommended</option><option value="newest">Recently listed</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><ChevronDown size={14} /></label>
      </div>
      {showFilters && <div className="filter-panel">
        <Field label="Condition"><select value={condition} onChange={e => { setCondition(e.target.value); setFiltersApplied(true) }}><option>Any condition</option><option>Like new</option><option>Good</option><option>Fair</option></select></Field>
        <Field label={`Maximum price · ${formatINR(Number(maxPrice))}`}><input type="range" min="100" max="5000" step="100" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setFiltersApplied(true) }} /></Field>
        <Button variant="quiet" onClick={() => { setCondition('Any condition'); setMaxPrice('2500'); setFiltersApplied(false) }}>Reset filters</Button>
      </div>}
      <div className="category-tabs" aria-label="Filter by category">
        {categories.map(item => <button key={item.name} onClick={() => setCategory(item.name)} className={`category-tab ${category === item.name ? 'category-tab-active' : ''}`} aria-pressed={category === item.name}><IconForCategory name={item.name} size={17} />{item.name}</button>)}
      </div>
      {visibleProducts.length ? <div className="product-grid">{visibleProducts.map(product => <ProductCard key={product.id} product={product} saved={saved.includes(product.id)} onSave={onSave} onOpen={onOpen} />)}</div> : <EmptyState icon={Search} title="No items found" description="Try a different search, category, or price range." action="Clear search" onAction={() => { setSearch(''); setCategory('All items'); setFiltersApplied(false); setCondition('Any condition'); setMaxPrice('2500') }} />}
    </section>
    <section className="impact-banner">
      <div className="impact-mark"><Recycle size={27} /></div><div className="impact-copy"><span className="eyebrow">SMALL CHOICES, SHARED IMPACT</span><h2>One campus. <em>More circular.</em></h2><p>Buying second-hand keeps useful things moving through the community instead of into the bin.</p></div><div className="impact-goal"><span>OUR GUIDING GOAL</span><strong>SDG 12</strong><small>Responsible consumption<br />& production</small></div>
    </section>
    <footer className="site-footer"><span>© 2026 BMS Loop</span><span>Designed for a more circular campus <Leaf size={14} /></span></footer>
  </main>
}
function AuthScreen({ onVerified }) {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('email')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [showDemo, setShowDemo] = useState(false)
  const submitEmail = e => {
    e.preventDefault()
    const normalized = email.trim().toLowerCase()
    if (!/^[^\s@]+@bmsce\.ac\.in$/.test(normalized)) {
      setError('Use your BMSCE email address ending in @bmsce.ac.in.')
      return
    }
    setError('')
    setEmail(normalized)
    setStep('otp')
    setShowDemo(true)
  }
  const submitOtp = e => {
    e.preventDefault()
    if (otp.trim() !== DEMO_OTP) { setError('That demo code does not match. Try the code shown below.'); return }
    setError('')
    onVerified({ email: email.trim().toLowerCase(), name: name.trim() || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), verified: true })
  }
  return <main className="auth-layout">
    <section className="auth-brand-panel">
      <button className="brand brand-on-dark" onClick={() => { setStep('email'); setError('') }}><span className="brand-mark"><Recycle size={21} /></span><span className="brand-wordmark">BMS <b>Loop</b><small>THE CAMPUS EXCHANGE</small></span></button>
      <div className="auth-panel-copy"><span className="eyebrow eyebrow-light">A BETTER WAY TO PASS IT ON</span><h1>Your campus has<br />more to <em>give.</em></h1><p>A trusted place for the BMSCE community to find, share, and rehome everyday essentials.</p><div className="auth-panel-note"><ShieldCheck size={18} /><span><b>One campus community</b><small>Access starts with a BMSCE email address.</small></span></div></div>
      <div className="auth-panel-bottom"><span>BUILT AROUND SDG 12</span><span>Reuse · Rehome · Repeat</span></div>
      <div className="auth-decoration auth-decoration-one"></div><div className="auth-decoration auth-decoration-two"></div>
    </section>
    <section className="auth-form-panel">
      <div className="auth-form-wrap">
        <div className="auth-form-top"><span className="mini-lock"><LockKeyhole size={17} /></span><span>THE BMSCE COMMUNITY</span></div>
        {step === 'email' ? <>
          <div className="auth-heading"><h2>Welcome to<br /><em>your campus loop.</em></h2><p>Sign in with your college email to continue to the marketplace.</p></div>
          <form onSubmit={submitEmail} noValidate>
            <Field label="BMSCE email address" error={error} hint="Only addresses ending in @bmsce.ac.in are eligible."><input type="email" autoComplete="email" placeholder="you@bmsce.ac.in" value={email} onChange={e => { setEmail(e.target.value); setError('') }} required /></Field>
            <Button type="submit" className="auth-submit">Continue with college email <ArrowRight size={17} /></Button>
          </form>
          <div className="auth-divider"><span></span>WHY CAMPUS-ONLY?<span></span></div>
          <div className="auth-benefits"><div><BadgeCheck size={17} /><span><b>Community eligibility</b><small>Designed for BMSCE students and faculty.</small></span></div><div><Handshake size={17} /><span><b>Meet on campus</b><small>Make handovers easier to coordinate.</small></span></div></div>
        </> : <>
          <button className="back-link" onClick={() => { setStep('email'); setError(''); setOtp('') }}><ArrowLeft size={15} /> Change email address</button>
          <div className="auth-heading"><h2>Check it's <em>you.</em></h2><p>Enter the verification code for <b>{email}</b>.</p></div>
          <form onSubmit={submitOtp} noValidate>
            <Field label="Your name (optional)"><input autoComplete="name" placeholder="How should we address you?" value={name} onChange={e => setName(e.target.value)} /></Field>
            <Field label="6-digit verification code" error={error}><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter demo code" value={otp} onChange={e => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} required /></Field>
            {showDemo && <div className="demo-code-notice"><Sparkles size={16} /><span><b>Frontend demo mode</b><small>Use demo code <strong>{DEMO_OTP}</strong>. No email is sent or verified by a server.</small></span></div>}
            <Button type="submit" className="auth-submit">Verify and enter <ArrowRight size={17} /></Button>
          </form>
        </>}
        <p className="auth-legal"><LockKeyhole size={13} /> Demo only. Real email verification requires a backend service.</p>
      </div>
    </section>
  </main>
}
function ProductModal({ product, onClose, onNegotiate, saved, onSave }) {
  useEffect(() => {
    if (!product) return undefined
    const handle = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [product, onClose])
  if (!product) return null
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="product-modal modal-panel" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
    <button className="modal-close" onClick={onClose} aria-label="Close product details"><X size={19} /></button>
    <div className="modal-product-image"><img src={product.image} alt={product.imageAlt || product.title} /></div>
    <div className="modal-product-content"><div className="modal-topline"><span className="product-category">{product.category}</span><StatusBadge status={product.status} /></div><h2 id="product-modal-title">{product.title}</h2><div className="modal-price">{formatINR(product.price)}{product.originalPrice > product.price && <del>{formatINR(product.originalPrice)}</del>}</div><p className="modal-description">{product.description}</p><div className="product-detail-facts"><span><Tag size={15} /> {product.condition} condition</span><span><MapPin size={15} /> {product.location}</span><span><Clock3 size={15} /> Listed {product.posted || 'recently'}</span></div>
      <div className="seller-card"><div className="seller-avatar">{product.seller.split(' ').map(x => x[0]).slice(0, 2).join('')}</div><div className="seller-info"><b>{product.seller} <BadgeCheck size={14} /></b><small>{product.department || 'BMSCE community member'}</small><span><Star size={13} fill="currentColor" /> {product.rating?.toFixed(1) || 'New seller'} · {product.reviews || 0} reviews</span></div><span className="seller-verified">Verified<br />community</span></div>
      <div className="modal-actions"><Button onClick={() => onNegotiate(product)}><MessageCircle size={16} /> Make an offer</Button><Button variant="outline" onClick={() => onSave(product.id)}><Heart size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save item'}</Button></div><p className="modal-safety"><ShieldCheck size={15} /> Meet in a public campus spot. Never share passwords or payment codes.</p>
    </div>
  </section></div>
}
function OfferModal({ product, onClose, onSubmit }) {
  const [offer, setOffer] = useState(String(product?.price || ''))
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  if (!product) return null
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="modal-panel offer-modal" role="dialog" aria-modal="true" aria-labelledby="offer-title"><button className="modal-close" onClick={onClose} aria-label="Close offer form"><X size={19} /></button><span className="modal-kicker"><Handshake size={16} /> START A CONVERSATION</span><h2 id="offer-title">Make an offer.</h2><p className="muted">Offer a fair price for <b>{product.title}</b>. This demo stores your offer locally; it does not message the seller.</p><form onSubmit={e => { e.preventDefault(); if (!Number(offer) || Number(offer) < 1) { setError('Enter a valid offer amount.'); return } onSubmit({ product, amount: Number(offer), message: message.trim() }); onClose() }}><Field label="Your offer (₹)" error={error}><input type="number" min="1" max="1000000" value={offer} onChange={e => { setOffer(e.target.value); setError('') }} required /></Field><Field label="Message (optional)"><textarea rows="3" maxLength="240" placeholder="Hi! Is this still available? I can meet near…" value={message} onChange={e => setMessage(e.target.value)} /></Field><div className="offer-price-note">Listed price: <b>{formatINR(product.price)}</b></div><Button type="submit" className="full-width"><Send size={16} /> Submit demo offer</Button></form></section></div>
}
function SellModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ title: '', category: '', price: '', originalPrice: '', condition: 'Good', description: '', location: 'Library entrance', image: '' })
  const [suggestion, setSuggestion] = useState('')
  const [error, setError] = useState('')
  const [aiUsed, setAiUsed] = useState(false)
  const deposit = categoryDeposits[form.category] ?? categoryDeposits.Other
  const update = (key, value) => setForm(old => ({ ...old, [key]: value }))
  const classify = () => {
    const category = suggestCategory(form.title)
    setSuggestion(category)
    setAiUsed(true)
    if (!form.category || form.category === 'Other') update('category', category)
  }
  const submit = e => {
    e.preventDefault()
    if (form.title.trim().length < 4) { setError('Use a more descriptive title (at least 4 characters).'); return }
    if (!form.category) { setError('Choose a category before submitting.'); return }
    if (!Number(form.price) || Number(form.price) < 1) { setError('Enter a valid price in rupees.'); return }
    if (form.description.trim().length < 12) { setError('Add a little more detail to help buyers.'); return }
    setError('')
    onCreate({ ...form, title: form.title.trim(), description: form.description.trim(), price: Number(form.price), originalPrice: Number(form.originalPrice) || Number(form.price), image: form.image.trim() || categoryImage(form.category), status: 'Pending Review', seller: 'You', department: 'BMSCE community member', rating: null, reviews: 0, posted: 'Just now', verified: true, id: `user-${Date.now()}`, imageAlt: form.title.trim() })
    onClose()
  }
  return <div className="modal-backdrop sell-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="modal-panel sell-modal" role="dialog" aria-modal="true" aria-labelledby="sell-title"><div className="sell-modal-header"><div><span className="modal-kicker"><Plus size={16} /> SELL ON BMS LOOP</span><h2 id="sell-title">Give it a new home.</h2><p className="muted">Add the details. Your listing will be marked for demo moderation.</p></div><button className="modal-close" onClick={onClose} aria-label="Close listing form"><X size={19} /></button></div><form onSubmit={submit} className="sell-form">
    <div className="sell-form-main">
      <Field label="Item title"><input value={form.title} onChange={e => { update('title', e.target.value); setSuggestion(''); setAiUsed(false) }} placeholder="e.g. Engineering Mathematics textbook" required maxLength={80} /></Field>
      <div className="ai-suggestion-row"><span><Sparkles size={15} /> Category assistant <small>· demo rule-based suggestion</small></span><button type="button" className="text-button" onClick={classify}>Suggest category</button></div>
      {aiUsed && <div className="suggestion-result"><CheckCircle2 size={15} /> Suggested: <b>{suggestion}</b>{suggestion !== form.category && <button type="button" onClick={() => update('category', suggestion)}>Use suggestion</button>}</div>}
      <Field label="Category"><select value={form.category} onChange={e => update('category', e.target.value)} required><option value="">Choose a category</option>{categories.filter(c => c.name !== 'All items').map(c => <option key={c.name}>{c.name}</option>)}<option>Other</option></select></Field>
      <div className="form-two-col"><Field label="Your price (₹)"><input type="number" min="1" max="1000000" value={form.price} onChange={e => update('price', e.target.value)} placeholder="e.g. 350" required /></Field><Field label="Original price (₹)"><input type="number" min="0" max="1000000" value={form.originalPrice} onChange={e => update('originalPrice', e.target.value)} placeholder="Optional" /></Field></div>
      <div className="form-two-col"><Field label="Item condition"><select value={form.condition} onChange={e => update('condition', e.target.value)}><option>Like new</option><option>Good</option><option>Fair</option></select></Field><Field label="Preferred handover spot"><select value={form.location} onChange={e => update('location', e.target.value)}><option>Library entrance</option><option>Main canteen</option><option>Academic block 1</option><option>Academic block 2</option><option>Hostel block A</option><option>Hostel block B</option><option>Hostel block C</option></select></Field></div>
      <Field label="Description" hint="Mention wear, included accessories, and anything a buyer should know."><textarea rows="4" maxLength={500} value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe the item honestly…" required /></Field>
      <Field label="Image URL (optional)" hint="For this demo, paste a direct image URL. A real upload service can be added later."><input type="url" value={form.image} onChange={e => update('image', e.target.value)} placeholder="https://…" /></Field>
      {error && <p className="form-error"><AlertTriangle size={15} /> {error}</p>}
    </div>
    <aside className="sell-form-aside"><div className="deposit-card"><span className="deposit-icon"><Wallet size={19} /></span><span className="eyebrow">REFUNDABLE LISTING DEPOSIT</span><strong>{formatINR(deposit)}</strong><p>Demo amount for {form.category || 'your chosen category'}. The amount is illustrative and not collected.</p><div className="deposit-rule"><Check size={14} /> Returned after successful transaction (planned workflow)</div></div><div className="review-note"><ShieldCheck size={18} /><div><b>Review before publishing</b><p>New listings enter <strong>Pending Review</strong> in this frontend demo. An admin can approve or reject them.</p></div></div><Button type="submit" className="full-width">Submit listing <ArrowRight size={16} /></Button><p className="form-disclaimer">No payment is taken. Real deposits and image uploads require backend services.</p></aside>
  </form></section></div>
}
function categoryImage(category) {
  const item = initialProducts.find(p => p.category === category)
  return item?.image || initialProducts[0].image
}
function Dashboard({ user, products, saved, onSave, onOpen, onSell, onPage }) {
  const mine = products.filter(p => p.seller === 'You')
  const [privacy, setPrivacy] = usePersistentState('privacy', { showEmail: false, showSaved: false })
  const [activeTab, setActiveTab] = useState('listings')
  return <main className="page-shell subpage-shell"><div className="page-title-row"><div><div className="eyebrow">YOUR CAMPUS ACCOUNT</div><h1>Your activity, <em>in one place.</em></h1><p>Keep track of listings, saved finds, and the next handover.</p></div><Button onClick={onSell}><Plus size={16} /> List an item</Button></div>
    <section className="profile-overview"><div className="profile-avatar">{(user.name || 'Student').split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase()}</div><div className="profile-main"><h2>{user.name} <BadgeCheck size={17} /></h2><p>{user.email}</p><span className="verified-chip"><CheckCircle2 size={13} /> BMSCE email demo-verified</span></div><div className="profile-stats"><div><strong>{mine.length}</strong><small>Your listings</small></div><div><strong>{saved.length}</strong><small>Saved items</small></div><div><strong>{mine.filter(p => p.status === 'Available').length}</strong><small>Live listings</small></div></div></section>
    <div className="dashboard-layout"><aside className="dashboard-sidebar"><span className="sidebar-label">ACCOUNT</span><button className={activeTab === 'listings' ? 'side-nav-active' : ''} onClick={() => setActiveTab('listings')}><Package size={17} /> My listings</button><button className={activeTab === 'saved' ? 'side-nav-active' : ''} onClick={() => setActiveTab('saved')}><Heart size={17} /> Saved items <span>{saved.length}</span></button><button onClick={() => onPage('transactions')}><Wallet size={17} /> Transactions</button><button className={activeTab === 'privacy' ? 'side-nav-active' : ''} onClick={() => setActiveTab('privacy')}><Eye size={17} /> Privacy settings</button><div className="sidebar-note"><LockKeyhole size={16} /><p>Your contact details stay private by default in this demo.</p></div></aside><section className="dashboard-content">
      {activeTab === 'listings' && <><div className="content-heading"><div><h2>My listings</h2><p>Listings you have submitted to the campus marketplace.</p></div></div>{mine.length ? <div className="my-listing-list">{mine.map(p => <div className="my-listing" key={p.id}><img src={p.image} alt="" /><div className="my-listing-info"><b>{p.title}</b><span>{p.category} · {formatINR(p.price)}</span><StatusBadge status={p.status} /></div><button className="button button-outline button-small" onClick={() => onOpen(p)}>View</button></div>)}</div> : <EmptyState title="Nothing listed yet" description="Your items will appear here after you submit your first listing." action="Sell your first item" onAction={onSell} />}</>}
      {activeTab === 'saved' && <><div className="content-heading"><div><h2>Saved items</h2><p>Your shortlist for later.</p></div></div>{saved.length ? <div className="saved-list">{products.filter(p => saved.includes(p.id)).map(p => <div className="saved-row" key={p.id}><button className="saved-row-main" onClick={() => onOpen(p)}><img src={p.image} alt="" /><span><b>{p.title}</b><small>{p.category}</small><strong>{formatINR(p.price)}</strong></span></button><button className="icon-button" onClick={() => onSave(p.id)} aria-label={`Remove ${p.title} from saved items`}><Heart size={17} fill="currentColor" /></button></div>)}</div> : <EmptyState icon={Heart} title="No saved items" description="Tap the heart on a listing to keep it here." action="Browse marketplace" onAction={() => onPage('marketplace')} />}</>}
      {activeTab === 'privacy' && <><div className="content-heading"><div><h2>Privacy controls</h2><p>Choose what is visible to other community members.</p></div></div><div className="privacy-list"><div><span className="privacy-symbol"><EyeOff size={18} /></span><div><b>Show email on my profile</b><p>Keep your college email hidden unless you choose to share it.</p></div><button className={`switch ${privacy.showEmail ? 'switch-on' : ''}`} role="switch" aria-checked={privacy.showEmail} onClick={() => setPrivacy(v => ({ ...v, showEmail: !v.showEmail }))}><span /></button></div><div><span className="privacy-symbol"><Heart size={18} /></span><div><b>Show my saved items</b><p>Your saved products are private by default.</p></div><button className={`switch ${privacy.showSaved ? 'switch-on' : ''}`} role="switch" aria-checked={privacy.showSaved} onClick={() => setPrivacy(v => ({ ...v, showSaved: !v.showSaved }))}><span /></button></div><p className="privacy-disclaimer"><LockKeyhole size={15} /> These controls are stored locally for demonstration. Production privacy controls must be enforced by a backend.</p></div></>}
    </section></div>
    <footer className="site-footer"><span>© 2026 BMS Loop</span><span>Keep useful things in use <Leaf size={14} /></span></footer>
  </main>
}
function Transactions({ products, setProducts, onOffer, offers, onPage }) {
  const [otpInputs, setOtpInputs] = useState({})
  const [notice, setNotice] = useState('')
  const [selected, setSelected] = useState(null)
  const [handoverOtp, setHandoverOtp] = useState('')
  const [error, setError] = useState('')
  const listed = products.filter(p => p.status === 'Under Agreement' || p.status === 'Sold')
  const startHandover = product => { setSelected(product); setHandoverOtp(''); setError(''); setNotice('') }
  const confirmHandover = e => {
    e.preventDefault()
    if (handoverOtp !== '135790') { setError('Incorrect demo handover OTP. Use 135790.'); return }
    setProducts(old => old.map(p => p.id === selected.id ? { ...p, status: 'Sold' } : p))
    setNotice(`Handover confirmed for “${selected.title}”. This is a local demo state, not a payment release.`)
    setSelected(null)
    setHandoverOtp('')
    setError('')
  }
  const beginAgreement = product => setProducts(old => old.map(p => p.id === product.id ? { ...p, status: 'Under Agreement' } : p))
  return <main className="page-shell subpage-shell"><div className="page-title-row"><div><div className="eyebrow">AGREEMENTS & HANDOVERS</div><h1>Transactions, <em>made clearer.</em></h1><p>Keep the agreement, fee breakdown, and campus handover details together.</p></div><span className="demo-indicator"><span /> DEMO WORKFLOW</span></div>
    <div className="transaction-notice"><ShieldCheck size={19} /><div><b>How the planned escrow flow works</b><p>In production, payment would be held securely and released after buyer OTP confirmation. This frontend only demonstrates the states; no payment or escrow account is connected.</p></div></div>
    {notice && <div className="success-notice"><CheckCircle2 size={17} />{notice}</div>}
    <section className="transaction-section"><div className="content-heading"><div><h2>Offers and agreements</h2><p>Offers you've created in this browser session.</p></div></div>
      {offers.length ? <div className="transaction-list">{offers.map((offer, i) => <article className="transaction-card" key={`${offer.product.id}-${i}`}><img src={offer.product.image} alt="" /><div className="transaction-card-main"><b>{offer.product.title}</b><span>Offer sent · {offer.product.seller}</span><small>{offer.message || 'No message added.'}</small></div><div className="transaction-card-price"><span>Your offer</span><strong>{formatINR(offer.amount)}</strong><StatusBadge status={offer.product.status === 'Under Agreement' ? 'Under Agreement' : 'Pending Review'} /></div><div className="transaction-card-actions"><Button variant="outline" onClick={() => onOffer(offer.product)}>Edit offer</Button><Button variant="quiet" onClick={() => beginAgreement(offer.product)}>Mark agreement</Button></div></article>)}</div> : <EmptyState icon={MessageCircle} title="No offers yet" description="Open a listing and make an offer to start a conversation." action="Browse marketplace" onAction={() => onPage('marketplace')} />}
    </section>
    <section className="transaction-section"><div className="content-heading"><div><h2>Handover tracker</h2><p>Demo transactions that are ready for a campus handover.</p></div></div>
      {listed.length ? <div className="handover-list">{listed.map(p => <article className="handover-card" key={p.id}><div className="handover-product"><img src={p.image} alt="" /><div><b>{p.title}</b><small>{p.seller} · {p.location}</small><StatusBadge status={p.status} /></div></div><div className="handover-breakdown"><span>Item price <b>{formatINR(p.price)}</b></span><span>Buyer fee ({demoFees.buyerPercent}%) <b>{formatINR(Math.round(p.price * demoFees.buyerPercent / 100))}</b></span><span>Seller fee ({demoFees.sellerPercent}%) <b>{formatINR(Math.round(p.price * demoFees.sellerPercent / 100))}</b></span><span className="breakdown-total">Illustrative total <b>{formatINR(p.price + Math.round(p.price * demoFees.buyerPercent / 100))}</b></span></div>{p.status !== 'Sold' ? <Button onClick={() => startHandover(p)}><ScanLine size={16} /> Confirm demo handover</Button> : <span className="completed-label"><CheckCircle2 size={16} /> Handover demo complete</span>}</article>)}</div> : <EmptyState icon={ClipboardCheck} title="No active handovers" description="Once an item is marked Under Agreement, it will appear here." />}
    </section>
    {selected && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null) }}><section className="modal-panel offer-modal" role="dialog" aria-modal="true" aria-labelledby="handover-title"><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close handover"><X size={19} /></button><span className="modal-kicker"><ScanLine size={16} /> BUYER CONFIRMATION</span><h2 id="handover-title">Confirm the handover.</h2><p className="muted">Only enter the code after you have physically received and checked the item. This code is for the frontend demo only.</p><form onSubmit={confirmHandover}><Field label="Demo handover OTP" error={error} hint="Demo code: 135790"><input value={handoverOtp} onChange={e => { setHandoverOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setError('') }} inputMode="numeric" maxLength={6} placeholder="6-digit code" required /></Field><Button type="submit" className="full-width"><CheckCheck size={16} /> Confirm handover demo</Button></form></section></div>}
    <footer className="site-footer"><span>© 2026 BMS Loop</span><span>Keep useful things in use <Leaf size={14} /></span></footer>
  </main>
}
function Admin({ products, setProducts }) {
  const [tab, setTab] = useState('pending')
  const [message, setMessage] = useState('')
  const pending = products.filter(p => p.status === 'Pending Review')
  const queue = tab === 'pending' ? pending : products.filter(p => p.status === 'Rejected' || p.status === 'Available')
  const decide = (id, status) => {
    setProducts(old => old.map(p => p.id === id ? { ...p, status } : p))
    setMessage(`Listing ${status === 'Available' ? 'approved and published' : 'rejected'} in this demo.`)
  }
  return <main className="page-shell subpage-shell"><div className="page-title-row"><div><div className="eyebrow">TRUST & SAFETY</div><h1>Moderation <em>desk.</em></h1><p>Review community listings before they appear in the marketplace.</p></div><span className="demo-indicator"><span /> LOCAL DEMO ONLY</span></div>
    <div className="admin-warning"><AlertTriangle size={18} /><div><b>Demonstration dashboard, not an access-controlled admin system</b><p>This screen is available in the frontend to show the workflow. Production moderation requires server-side roles, audit logs, and listing checks.</p></div></div>
    {message && <div className="success-notice"><CheckCircle2 size={17} />{message}<button onClick={() => setMessage('')} aria-label="Dismiss message"><X size={15} /></button></div>}
    <div className="admin-stats"><div><span>Awaiting review</span><strong>{pending.length}</strong><small><Clock3 size={13} /> Needs attention</small></div><div><span>Published listings</span><strong>{products.filter(p => p.status === 'Available').length}</strong><small><CheckCircle2 size={13} /> Visible in marketplace</small></div><div><span>Rejected</span><strong>{products.filter(p => p.status === 'Rejected').length}</strong><small><Flag size={13} /> Not published</small></div></div>
    <div className="admin-tabs"><button className={tab === 'pending' ? 'admin-tab-active' : ''} onClick={() => setTab('pending')}>Pending review <span>{pending.length}</span></button><button className={tab === 'other' ? 'admin-tab-active' : ''} onClick={() => setTab('other')}>Published & rejected</button></div>
    {queue.length ? <div className="moderation-list">{queue.map(p => <article className="moderation-card" key={p.id}><img src={p.image} alt={p.imageAlt || p.title} /><div className="moderation-main"><div className="moderation-top"><span className="product-category">{p.category}</span><StatusBadge status={p.status} /></div><h3>{p.title}</h3><p>{p.description}</p><div className="moderation-meta"><span><UserRound size={14} /> {p.seller}</span><span><Tag size={14} /> {formatINR(p.price)}</span><span><MapPin size={14} /> {p.location}</span></div></div><div className="moderation-actions">{p.status !== 'Available' && <Button onClick={() => decide(p.id, 'Available')}><Check size={15} /> Approve</Button>}{p.status !== 'Rejected' && <Button variant="outline" onClick={() => decide(p.id, 'Rejected')}><X size={15} /> Reject</Button>}</div></article>)}</div> : <EmptyState icon={ClipboardCheck} title={tab === 'pending' ? 'Queue is clear' : 'No other listings'} description={tab === 'pending' ? 'New listings submitted through the sell form will appear here.' : 'Published or rejected listings will appear here.'} />}
    <footer className="site-footer"><span>© 2026 BMS Loop </span><span>Review carefully. Keep the campus trusted. <ShieldCheck size={14} /></span></footer>
  </main>
}
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, 3500)
    return () => window.clearTimeout(timer)
  }, [toast, onClose])
  if (!toast) return null
  return <div className="toast-message" role="status"><CheckCircle2 size={18} /><span>{toast}</span><button onClick={onClose} aria-label="Dismiss notification"><X size={15} /></button></div>
}
export default function App() {
  const [user, setUser] = usePersistentState('user', null)
  const [products, setProducts] = usePersistentState('products', initialProducts)
  const [saved, setSaved] = usePersistentState('saved', [])
  const [offers, setOffers] = usePersistentState('offers', [])
  const [page, setPage] = useState('marketplace')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All items')
  const [sort, setSort] = useState('recommended')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [offerProduct, setOfferProduct] = useState(null)
  const [sellOpen, setSellOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [resetPrompt, setResetPrompt] = useState(false)
  const showToast = message => setToast(message)
  const handleSave = id => {
    setSaved(old => {
      const exists = old.includes(id)
      showToast(exists ? 'Removed from saved items.' : 'Added to saved items.')
      return exists ? old.filter(x => x !== id) : [...old, id]
    })
  }
  const handleCreate = product => {
    setProducts(old => [product, ...old])
    showToast('Listing submitted to the demo moderation queue.')
    setPage('dashboard')
  }
  const handleOffer = offer => {
    setOffers(old => [offer, ...old])
    setProducts(old => old.map(p => p.id === offer.product.id ? { ...p, status: 'Under Agreement' } : p))
    showToast('Offer saved locally. The seller has not been notified.')
    setPage('transactions')
  }
  const logout = () => {
    setUser(null)
    setPage('marketplace')
    setSearch('')
    showToast('Signed out of the local demo.')
  }
  if (!user?.verified || !/@bmsce\.ac\.in$/i.test(user.email || '')) {
    return <><AuthScreen onVerified={setUser} /><Toast toast={toast} onClose={() => setToast('')} /></>
  }
  return <div className="app">
    <Header page={page} setPage={setPage} user={user} onLogout={logout} onOpenSell={() => setSellOpen(true)} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    {page === 'marketplace' && <Marketplace products={products} saved={saved} onSave={handleSave} onOpen={setSelectedProduct} onSell={() => setSellOpen(true)} search={search} setSearch={setSearch} category={category} setCategory={setCategory} sort={sort} setSort={setSort} />}
    {page === 'dashboard' && <Dashboard user={user} products={products} saved={saved} onSave={handleSave} onOpen={setSelectedProduct} onSell={() => setSellOpen(true)} onPage={setPage} />}
    {page === 'transactions' && <Transactions products={products} setProducts={setProducts} onOffer={setOfferProduct} offers={offers} onPage={setPage} />}
    {page === 'admin' && <Admin products={products} setProducts={setProducts} />}
    <button className="account-menu-button" onClick={() => setResetPrompt(true)}><Settings2 size={15} /> Demo controls</button>
    {resetPrompt && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setResetPrompt(false) }}><section className="modal-panel offer-modal" role="dialog" aria-modal="true" aria-labelledby="demo-controls-title"><button className="modal-close" onClick={() => setResetPrompt(false)} aria-label="Close demo controls"><X size={19} /></button><span className="modal-kicker"><Settings2 size={16} /> PROJECT DEMO</span><h2 id="demo-controls-title">Demo controls</h2><p className="muted">Reset locally stored sample data if you want to repeat the submission walkthrough from a clean state.</p><div className="demo-control-row"><div><b>Reset sample data</b><small>Restores sample listings, clears saved items and demo offers.</small></div><Button variant="outline" onClick={() => { setProducts(initialProducts); setSaved([]); setOffers([]); setPage('marketplace'); setResetPrompt(false); showToast('Sample data reset in this browser.') }}>Reset data</Button></div><div className="demo-control-row"><div><b>Sign out</b><small>Return to the BMSCE email verification screen.</small></div><Button variant="quiet" onClick={() => { setResetPrompt(false); logout() }}><LogOut size={15} /> Sign out</Button></div><p className="form-disclaimer">All state is stored in this browser only. Clearing site data will remove it.</p></section></div>}
    <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onNegotiate={p => { setSelectedProduct(null); setOfferProduct(p) }} saved={selectedProduct ? saved.includes(selectedProduct.id) : false} onSave={handleSave} />
    {offerProduct && <OfferModal product={offerProduct} onClose={() => setOfferProduct(null)} onSubmit={handleOffer} />}
    {sellOpen && <SellModal onClose={() => setSellOpen(false)} onCreate={handleCreate} />}
    <Toast toast={toast} onClose={() => setToast('')} />
  </div>
}