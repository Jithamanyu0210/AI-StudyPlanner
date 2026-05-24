import { useState } from 'react';

const DEMO_USERS = [
  { email: 'alex@gmail.com', password: 'study123', name: 'Alex Johnson', avatar: 'A', joined: 'May 2026' },
  { email: 'demo@gmail.com', password: 'demo123', name: 'Demo User', avatar: 'D', joined: 'May 2026' },
];

export default function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [signupError, setSignupError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    if (!form.email.endsWith('@gmail.com')) { setError('Please use a Gmail address (@gmail.com).'); return; }

    setLoading(true);
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email === form.email && u.password === form.password);
      if (user) {
        onLogin({ email: user.email, name: user.name, avatar: user.avatar, joined: user.joined });
      } else {
        setError('Invalid email or password. Try alex@gmail.com / study123');
        setLoading(false);
      }
    }, 1000);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    setSignupError('');
    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirm) {
      setSignupError('Please fill in all fields.'); return;
    }
    if (!signupForm.email.endsWith('@gmail.com')) {
      setSignupError('Please use a Gmail address (@gmail.com).'); return;
    }
    if (signupForm.password.length < 6) {
      setSignupError('Password must be at least 6 characters.'); return;
    }
    if (signupForm.password !== signupForm.confirm) {
      setSignupError('Passwords do not match.'); return;
    }
    setLoading(true);
    setTimeout(() => {
      onLogin({
        email: signupForm.email,
        name: signupForm.name,
        avatar: signupForm.name[0].toUpperCase(),
        joined: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      fontFamily: 'var(--font-body)',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
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
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 24,
          padding: 36,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', padding: 4, borderRadius: 12, marginBottom: 28 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSignupError(''); }}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                  background: mode === m ? 'var(--bg-card)' : 'transparent',
                  color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.2s ease',
                }}>
                {m === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Gmail Address
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>📧</span>
                  <input
                    id="login-email"
                    type="email"
                    placeholder="you@gmail.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    style={{
                      width: '100%', padding: '11px 14px 11px 42px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: 10, fontSize: 14, color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔒</span>
                  <input
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{
                      width: '100%', padding: '11px 44px 11px 42px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: 10, fontSize: 14, color: 'var(--text-primary)',
                      fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#7c3aed'}
                    onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
                    {showPass ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}

              <button id="login-submit" type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                  color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
                  boxShadow: '0 4px 15px rgba(124,58,237,0.4)',
                  transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1,
                }}>
                {loading ? '⏳ Signing in...' : '🚀 Sign In'}
              </button>

              <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(124,58,237,0.06)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.15)', fontSize: 12, color: 'var(--text-secondary)' }}>
                💡 <strong>Demo credentials:</strong><br />
                Email: <code style={{ color: '#7c3aed' }}>alex@gmail.com</code> &nbsp;|&nbsp;
                Password: <code style={{ color: '#7c3aed' }}>study123</code>
              </div>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignup}>
              {[
                { id: 'signup-name', key: 'name', label: 'Full Name', icon: '👤', type: 'text', placeholder: 'Your full name' },
                { id: 'signup-email', key: 'email', label: 'Gmail Address', icon: '📧', type: 'email', placeholder: 'you@gmail.com' },
                { id: 'signup-password', key: 'password', label: 'Password', icon: '🔒', type: 'password', placeholder: 'Min 6 characters' },
                { id: 'signup-confirm', key: 'confirm', label: 'Confirm Password', icon: '✅', type: 'password', placeholder: 'Repeat password' },
              ].map(field => (
                <div key={field.key} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{field.label}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>{field.icon}</span>
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={signupForm[field.key]}
                      onChange={e => setSignupForm(f => ({ ...f, [field.key]: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px 10px 40px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                        borderRadius: 10, fontSize: 14, color: 'var(--text-primary)',
                        fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box',
                      }}
                      onFocus={e => e.target.style.borderColor = '#7c3aed'}
                      onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
                    />
                  </div>
                </div>
              ))}

              {signupError && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#ef4444', fontSize: 13, marginBottom: 14 }}>
                  ⚠️ {signupError}
                </div>
              )}

              <button id="signup-submit" type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #06b6d4, #7c3aed)',
                  color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
                  boxShadow: '0 4px 15px rgba(6,182,212,0.35)',
                  transition: 'all 0.2s ease', opacity: loading ? 0.7 : 1, marginTop: 4,
                }}>
                {loading ? '⏳ Creating account...' : '✨ Create Account'}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
          🔒 Your data is stored locally on this device only.
        </p>
      </div>
    </div>
  );
}
