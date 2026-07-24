import { useState } from 'react';
import { authApi } from '../api/api';

const DEMO_ACCOUNTS = [
  { name: 'Alex Johnson', email: 'alex.johnson@gmail.com', role: 'Computer Science Major', icon: '💻' },
  { name: 'Sarah Chen', email: 'sarah.chen@gmail.com', role: 'Pre-Med Student', icon: '🩺' },
  { name: 'David Kim', email: 'david.kim@gmail.com', role: 'High School Senior', icon: '🎓' },
];

export default function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState('login');
  const [form, setForm]         = useState({ email: '', password: '' });
  const [signup, setSignup]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Helper: sanitize email
  const cleanEmail = (e) => {
    let trimmed = e.trim().toLowerCase();
    if (trimmed && !trimmed.includes('@')) {
      trimmed += '@gmail.com';
    }
    return trimmed;
  };

  // ── Login Handler ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const emailToUse = cleanEmail(form.email);

    if (!emailToUse || !form.password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!emailToUse.endsWith('@gmail.com')) {
      setError('Please use a valid Gmail address ending in @gmail.com.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login(emailToUse, form.password);
      localStorage.setItem('studyai_token', data.token);
      onLogin({ ...data.user, token: data.token });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Signup Handler ─────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    const emailToUse = cleanEmail(signup.email);

    if (!signup.name.trim() || !emailToUse || !signup.password || !signup.confirm) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!emailToUse.endsWith('@gmail.com')) {
      setError('Please use a valid Gmail address ending in @gmail.com.');
      return;
    }
    if (signup.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (signup.password !== signup.confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.signup(signup.name.trim(), emailToUse, signup.password);
      localStorage.setItem('studyai_token', data.token);
      onLogin({ ...data.user, token: data.token });
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── 1-Click Demo Login ─────────────────────────────────────────────────────
  const handleDemoLogin = async (demoUser) => {
    setLoading(true);
    setError('');
    try {
      const data = await authApi.login(demoUser.email, 'demo12345');
      const userPayload = {
        ...data.user,
        name: demoUser.name,
        email: demoUser.email,
        token: data.token,
      };
      localStorage.setItem('studyai_token', data.token);
      onLogin(userPayload);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px 12px 42px', boxSizing: 'border-box',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 12, fontSize: 14, color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', outline: 'none', transition: 'all 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: 6,
  };
  const iconStyle = {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', fontFamily: 'var(--font-body)', position: 'relative',
    }}>
      {/* Dynamic Background Glow Spheres */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: 550, height: 550, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 650, height: 650, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, margin: '0 auto 16px',
            boxShadow: '0 10px 35px rgba(124,58,237,0.45)',
          }}>🧠</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 32, fontWeight: 900,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '-0.5px',
          }}>StudyAI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginTop: 4 }}>
            Your Intelligent AI Study & Productivity Partner
          </p>
        </div>

        {/* Main Authentication Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 24, padding: '36px 32px', boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
        }}>
          {/* Mode Switcher Tabs */}
          <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: 5, borderRadius: 14, marginBottom: 24 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 700,
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color:      mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow:  mode === m ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                  transition: 'all 0.25s ease',
                }}>
                {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {/* Alert / Error Banner */}
          {error && (
            <div style={{
              padding: '12px 16px', marginBottom: 20,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 12, color: '#f87171', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <div style={{ flex: 1 }}>{error}</div>
            </div>
          )}

          {/* Google Sign-in Button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            style={{
              width: '100%', padding: '12px', borderRadius: 12,
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: 'pointer', transition: 'all 0.2s', marginBottom: 20,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OR WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-color)' }} />
          </div>

          {/* ── LOGIN FORM ────────────────────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Gmail Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconStyle}>📧</span>
                  <input
                    id="login-email" type="text" placeholder="you@gmail.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconStyle}>🔒</span>
                  <input
                    id="login-password" type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: 44 }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)' }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  color: 'white', fontSize: 15, fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  boxShadow: '0 6px 20px rgba(124,58,237,0.4)',
                  transition: 'all 0.25s ease', opacity: loading ? 0.7 : 1,
                }}>
                {loading ? '⏳ Authenticating...' : '🚀 Sign In to Dashboard'}
              </button>
            </form>
          )}

          {/* ── SIGNUP FORM ───────────────────────────────────────────────── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              {[
                { id: 'signup-name',     key: 'name',     label: 'Full Name',         icon: '👤', type: 'text',     placeholder: 'Alex Johnson' },
                { id: 'signup-email',    key: 'email',    label: 'Gmail Address',     icon: '📧', type: 'text',     placeholder: 'alex@gmail.com' },
                { id: 'signup-password', key: 'password', label: 'Password',          icon: '🔒', type: 'password', placeholder: 'Min 6 characters' },
                { id: 'signup-confirm',  key: 'confirm',  label: 'Confirm Password',  icon: '✅', type: 'password', placeholder: 'Repeat password' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconStyle}>{field.icon}</span>
                    <input
                      id={field.id} type={field.type} placeholder={field.placeholder}
                      value={signup[field.key]}
                      onChange={e => setSignup(f => ({ ...f, [field.key]: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#7c3aed'}
                      onBlur={e  => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>
                </div>
              ))}

              <button id="signup-submit" type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
                  color: 'white', fontSize: 15, fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  boxShadow: '0 6px 20px rgba(6,182,212,0.35)',
                  transition: 'all 0.25s ease', opacity: loading ? 0.7 : 1, marginTop: 6,
                }}>
                {loading ? '⏳ Creating Account...' : '✨ Create Free Account'}
              </button>
            </form>
          )}

          {/* Quick Demo Accounts Drawer */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 0.5, marginBottom: 12, textAlign: 'center' }}>
              ⚡ QUICK 1-CLICK DEMO ACCOUNTS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoLogin(acc)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10,
                    background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.18)',
                    cursor: loading ? 'not-allowed' : 'pointer', textAlignment: 'left',
                    transition: 'all 0.2s', width: '100%',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.14)'; e.currentTarget.style.borderColor = '#7c3aed'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.18)'; }}
                >
                  <span style={{ fontSize: 20 }}>{acc.icon}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{acc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{acc.email} • {acc.role}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#06b6d4' }}>Log In →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
          🔒 Safe & Secure Authentication • Multi-user Isolation • MongoDB Ready
        </p>
      </div>

      {/* Google Account Selector Modal */}
      {showGoogleModal && (
        <div className="modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🌐</div>
              <div className="modal-title" style={{ marginBottom: 4 }}>Sign in with Google</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Choose a Gmail account to continue to StudyAI</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { name: 'Alex Johnson', email: 'alex.johnson@gmail.com', avatar: 'A' },
                { name: 'Sarah Chen', email: 'sarah.chen@gmail.com', avatar: 'S' },
                { name: 'David Kim', email: 'david.kim@gmail.com', avatar: 'D' },
                { name: 'User Gmail', email: 'user.study@gmail.com', avatar: 'U' },
              ].map(acc => (
                <div
                  key={acc.email}
                  onClick={() => {
                    setShowGoogleModal(false);
                    handleDemoLogin(acc);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 12,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#06b6d4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: 'white', fontSize: 16,
                  }}>{acc.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{acc.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{acc.email}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowGoogleModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
