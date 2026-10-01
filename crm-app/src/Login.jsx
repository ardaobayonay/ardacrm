import { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Giriş başarısız. E-posta veya şifre hatalı.');
    } else {
      navigate('/dashboard'); // Giriş başarılıysa ana ekrana yönlendir
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>FTS</h2>
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="E-posta adresiniz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Şifreniz"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Giriş yapılıyor...' : 'Sisteme Gir'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', color: '#ffffff', fontFamily: 'sans-serif' },
  card: { backgroundColor: '#1e1e1e', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.8)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', marginBottom: '24px', fontSize: '24px', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  input: { padding: '14px', borderRadius: '8px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: '#fff', fontSize: '16px', outline: 'none' },
  button: { padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  error: { color: '#ef4444', fontSize: '14px', textAlign: 'center', margin: '0' }
};