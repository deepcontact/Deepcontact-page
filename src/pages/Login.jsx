import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import logo from '../assets/images/favicon-32x32.png';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    setLoading(false);

    if (dbError || !data) {
      setError('Email o contraseña incorrectos.');
      return;
    }

    navigate('/backoffice');
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Link to="/" className="login-brand">
          <img src={logo} alt="DeepContact" width="40" height="40" />
          <span className="login-brand-name">DeepContact</span>
        </Link>

        <h2 className="login-title">Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
