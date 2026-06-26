import { useState } from 'react';
import { authApi } from '../api/api';

export default function LoginPage({ onLogin }) {
  const [mode, setMode]         = useState('login');
  const [form, setForm]         = useState({ email: '', password: '' });
  const [signup, setSignup]     = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (!form.email.endsWith('@gmail.com')) { setError('Please use a Gmail address (@gmail.com).'); return; }

    setLoading(true);
    try {
      const data = await authApi.login(form.email, form.password);
      localStorage.setItem('studyai_token', data.token);
      onLogin({ ...data.user, token: data.token });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Signup ─────────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!signup.name || !signup.email || !signup.password || !signup.confirm) {
      setError('Please fill in all fields.'); return;
    }
    if (!signup.email.endsWith('@gmail.com')) {
      setError('Please use a Gmail address (@gmail.com).'); return;
    }
    if (signup.password.length < 6) {
      setError('Password must be at least 6 characters.'); return;
    }
    if (signup.password !== signup.confirm) {
      setError('Passwords do not match.'); return;
    }

    setLoading(true);
    try {
      const data = await authApi.signup(signup.name, signup.email, signup.password);
      localStorage.setItem('studyai_token', data.token);
      onLogin({ ...data.user, token: data.token });
    } catch (err) {
      setError(err.message || 'Sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Styles (shared) ────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '11px 14px 11px 42px', boxSizing: 'border-box',
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 10, fontSize: 14, color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)', outline: 'none',
  };
  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: 6,
  };
  const iconStyle = {
    position: 'absolute', left: 14, top: '50%',
    transform: 'translateY(-50%)', fontSize: 16,
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: 'var(--font-body)',
    }}>
      {/* Background decoration */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.15), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)' }} />
      </div>

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
          }}>🧠</div>
          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 28, fontWeight: 800,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>StudyAI</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
            Your AI-powered study companion
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 24, padding: 36, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, marginBottom: 28 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color:      mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow:  mode === m ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px', marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, color: '#ef4444', fontSize: 13,
            }}>⚠️ {error}</div>
          )}

          {/* ── LOGIN FORM ──────────────────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Gmail Address</label>
                <div style={{ position: 'relative' }}>
                  <span style={iconStyle}>📧</span>
                  <input
                    id="login-email" type="email" placeholder="you@gmail.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
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
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button id="login-submit" type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  color: 'white', fontSize: 15, fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                  transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1,
                }}>
                {loading ? '⏳ Signing in...' : '🚀 Sign In'}
              </button>

              <div style={{
                marginTop: 20, padding: '12px 16px',
                background: 'rgba(124,58,237,0.06)', borderRadius: 10,
                border: '1px solid rgba(124,58,237,0.15)',
                fontSize: 12, color: 'var(--text-secondary)',
              }}>
                💡 <strong>New here?</strong> Switch to Sign Up to create an account.<br />
                All data is stored securely in MongoDB.
              </div>
            </form>
          )}

          {/* ── SIGNUP FORM ─────────────────────────────────────────────── */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              {[
                { id: 'signup-name',     key: 'name',     label: 'Full Name',         icon: '👤', type: 'text',     placeholder: 'Your full name' },
                { id: 'signup-email',    key: 'email',    label: 'Gmail Address',     icon: '📧', type: 'email',    placeholder: 'you@gmail.com' },
                { id: 'signup-password', key: 'password', label: 'Password',          icon: '🔒', type: 'password', placeholder: 'Min 6 characters' },
                { id: 'signup-confirm',  key: 'confirm',  label: 'Confirm Password',  icon: '✅', type: 'password', placeholder: 'Repeat password' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 14 }}>
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
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
                  color: 'white', fontSize: 15, fontWeight: 700,
                  fontFamily: 'var(--font-body)',
                  boxShadow: '0 4px 15px rgba(6,182,212,0.35)',
                  transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1, marginTop: 4,
                }}>
                {loading ? '⏳ Creating account...' : '✨ Create Account'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          🔒 Your data is stored securely in MongoDB.
        </p>
      </div>
    </div>
  );
}
