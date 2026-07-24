import { useState } from 'react';
import { authApi } from '../api/api';

export default function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState('login');
  const [form, setForm]         = useState({ email: '', password: '' });
  const [signup, setSignup]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Google modal state
  const [showGoogle, setShowGoogle]     = useState(false);
  const [gEmail, setGEmail]             = useState('');
  const [gName, setGName]               = useState('');
  const [gStep, setGStep]               = useState('email'); // 'email' | 'name'
  const [gError, setGError]             = useState('');
  const [gLoading, setGLoading]         = useState(false);

  const clean = (e) => {
    let v = e.trim().toLowerCase();
    if (v && !v.includes('@')) v += '@gmail.com';
    return v;
  };

  const isGmail = (e) => e.endsWith('@gmail.com');

  // ── Login ──────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const email = clean(form.email);
    if (!email || !form.password) { setError('Please enter your email and password.'); return; }
    if (!isGmail(email)) { setError('Only Gmail addresses (@gmail.com) are supported.'); return; }
    setLoading(true);
    try {
      const data = await authApi.login(email, form.password);
      localStorage.setItem('studyai_token', data.token);
      onLogin({ ...data.user, token: data.token });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Signup ─────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    const email = clean(signup.email);
    if (!signup.name.trim()) { setError('Please enter your full name.'); return; }
    if (!email) { setError('Please enter your Gmail address.'); return; }
    if (!isGmail(email)) { setError('Only Gmail addresses (@gmail.com) are supported.'); return; }
    if (signup.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (signup.password !== signup.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const data = await authApi.signup(signup.name.trim(), email, signup.password);
      localStorage.setItem('studyai_token', data.token);
      onLogin({ ...data.user, token: data.token });
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally { setLoading(false); }
  };

  // ── Google flow ────────────────────────────────────────────────────────
  const closeGoogle = () => { setShowGoogle(false); setGEmail(''); setGName(''); setGStep('email'); setGError(''); };

  const handleGoogleNext = (e) => {
    e.preventDefault();
    setGError('');
    const email = clean(gEmail);
    if (!email || !isGmail(email)) { setGError('Please enter a valid Gmail address (e.g. you@gmail.com).'); return; }
    // Check if already registered locally
    let localUsers = {};
    try { localUsers = JSON.parse(localStorage.getItem('studyai_local_users') || '{}'); } catch {}
    if (localUsers[email]) {
      // Existing user — sign them in directly
      setGLoading(true);
      authApi.googleLogin(localUsers[email].name, email)
        .then(data => { localStorage.setItem('studyai_token', data.token); onLogin({ ...data.user, token: data.token }); })
        .catch(err => setGError(err.message || 'Sign-in failed.'))
        .finally(() => setGLoading(false));
    } else {
      // New user — ask for name
      setGStep('name');
    }
  };

  const handleGoogleCreate = (e) => {
    e.preventDefault();
    setGError('');
    if (!gName.trim()) { setGError('Please enter your name.'); return; }
    const email = clean(gEmail);
    setGLoading(true);
    authApi.googleLogin(gName.trim(), email)
      .then(data => { localStorage.setItem('studyai_token', data.token); onLogin({ ...data.user, token: data.token }); })
      .catch(err => setGError(err.message || 'Account creation failed.'))
      .finally(() => setGLoading(false));
  };

  // ── Styles ─────────────────────────────────────────────────────────────
  const inputSt = {
    width: '100%', padding: '12px 14px 12px 42px', boxSizing: 'border-box',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 12, fontSize: 14, color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', outline: 'none', transition: 'border-color 0.2s',
  };
  const labelSt = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 };
  const iconSt  = { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' };

  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'var(--font-body)', position: 'relative' }}>

      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

        {/* Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: 22, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px', boxShadow: '0 10px 35px rgba(124,58,237,0.45)' }}>🧠</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 900, background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.5px', margin: 0 }}>StudyAI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 6 }}>Your Intelligent AI Study &amp; Productivity Partner</p>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 24, padding: '36px 32px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: 5, borderRadius: 14, marginBottom: 24 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700, background: mode === m ? 'var(--bg-card)' : 'transparent', color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)', boxShadow: mode === m ? '0 4px 12px rgba(0,0,0,0.2)' : 'none', transition: 'all 0.25s' }}>
                {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding: '12px 16px', marginBottom: 20, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 12, color: '#f87171', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* Google button */}
          <button type="button" onClick={() => { setShowGoogle(true); setGStep('email'); setGError(''); setGEmail(''); setGName(''); }}
            style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', transition: 'border-color 0.2s', marginBottom: 20 }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#4285F4'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <GoogleIcon /> Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OR WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          </div>

          {/* ── LOGIN FORM ─────────────────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelSt}>Gmail Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconSt}>📧</span>
                  <input id="login-email" type="email" placeholder="you@gmail.com" autoComplete="username"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputSt}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={labelSt}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconSt}>🔒</span>
                  <input id="login-password" type={showPass ? 'text' : 'password'} placeholder="Your password" autoComplete="current-password"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{ ...inputSt, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)' }}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <span onClick={() => { setMode('signup'); setError(''); }} style={{ fontSize: 12, color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>
                  No account yet? Sign Up →
                </span>
              </div>

              <button id="login-submit" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#7c3aed,#06b6d4)', color: 'white', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-heading)', boxShadow: '0 6px 20px rgba(124,58,237,0.4)', transition: 'opacity 0.25s', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Signing in...' : '🚀 Sign In to Dashboard'}
              </button>
            </form>
          )}

          {/* ── SIGNUP FORM ───────────────────────────────────────────── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconSt}>👤</span>
                  <input id="signup-name" type="text" placeholder="Your full name" autoComplete="name"
                    value={signup.name} onChange={e => setSignup(f => ({ ...f, name: e.target.value }))}
                    style={inputSt}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Gmail Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconSt}>📧</span>
                  <input id="signup-email" type="email" placeholder="you@gmail.com" autoComplete="username"
                    value={signup.email} onChange={e => setSignup(f => ({ ...f, email: e.target.value }))}
                    style={inputSt}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Password <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(min 6 chars)</span></label>
                <div style={{ position: 'relative' }}>
                  <span style={iconSt}>🔒</span>
                  <input id="signup-password" type={showPass ? 'text' : 'password'} placeholder="Create a password" autoComplete="new-password"
                    value={signup.password} onChange={e => setSignup(f => ({ ...f, password: e.target.value }))}
                    style={{ ...inputSt, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)' }}>{showPass ? '🙈' : '👁️'}</button>
                </div>
              </div>

              <div style={{ marginBottom: 8 }}>
                <label style={labelSt}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconSt}>✅</span>
                  <input id="signup-confirm" type={showConfirm ? 'text' : 'password'} placeholder="Repeat your password" autoComplete="new-password"
                    value={signup.confirm} onChange={e => setSignup(f => ({ ...f, confirm: e.target.value }))}
                    style={{ ...inputSt, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)' }}>{showConfirm ? '🙈' : '👁️'}</button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginBottom: 20 }}>
                <span onClick={() => { setMode('login'); setError(''); }} style={{ fontSize: 12, color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>
                  Already have an account? Sign In →
                </span>
              </div>

              <button id="signup-submit" type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', background: 'linear-gradient(135deg,#06b6d4,#7c3aed)', color: 'white', fontSize: 15, fontWeight: 800, fontFamily: 'var(--font-heading)', boxShadow: '0 6px 20px rgba(6,182,212,0.35)', transition: 'opacity 0.25s', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Creating Account...' : '✨ Create Free Account'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          🔒 Sign up required • Each account is fully isolated
        </p>
      </div>

      {/* ── Google Sign-in Modal ─────────────────────────────────────── */}
      {showGoogle && (
        <div className="modal-overlay" onClick={closeGoogle}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>

            <div style={{ textAlign: 'center', marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <svg width="44" height="44" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
              </div>
              <div style={{ fontSize: 19, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                {gStep === 'email' ? 'Sign in with Google' : 'One last step'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {gStep === 'email'
                  ? 'Enter your Gmail to continue to StudyAI'
                  : `Creating account for ${gEmail}`}
              </div>
            </div>

            {gError && (
              <div style={{ padding: '10px 14px', marginBottom: 16, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#f87171', fontSize: 13 }}>
                ⚠️ {gError}
              </div>
            )}

            {gStep === 'email' ? (
              <form onSubmit={handleGoogleNext}>
                <label style={{ ...labelSt, marginBottom: 8 }}>Gmail Address</label>
                <input type="email" placeholder="you@gmail.com" value={gEmail} onChange={e => setGEmail(e.target.value)} autoFocus
                  style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none', marginBottom: 16 }}
                  onFocus={e => e.target.style.borderColor = '#4285F4'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={closeGoogle}>Cancel</button>
                  <button type="submit" disabled={gLoading} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: '#4285F4', color: 'white', fontSize: 14, fontWeight: 700, cursor: gLoading ? 'not-allowed' : 'pointer', opacity: gLoading ? 0.7 : 1 }}>
                    {gLoading ? '⏳ Checking...' : 'Next →'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleGoogleCreate}>
                <div style={{ padding: '10px 14px', marginBottom: 16, background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  📧 <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{gEmail}</span>
                </div>
                <label style={{ ...labelSt, marginBottom: 8 }}>Your Full Name</label>
                <input type="text" placeholder="e.g. Jithamanyu" value={gName} onChange={e => setGName(e.target.value)} autoFocus
                  style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 10, fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-body)', outline: 'none', marginBottom: 8 }}
                  onFocus={e => e.target.style.borderColor = '#4285F4'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>This name will appear on your profile.</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setGStep('email'); setGError(''); }}>← Back</button>
                  <button type="submit" disabled={gLoading} style={{ flex: 2, padding: '12px', borderRadius: 10, border: 'none', background: '#4285F4', color: 'white', fontSize: 14, fontWeight: 700, cursor: gLoading ? 'not-allowed' : 'pointer', opacity: gLoading ? 0.7 : 1 }}>
                    {gLoading ? '⏳ Creating...' : '✓ Create Account & Sign In'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
