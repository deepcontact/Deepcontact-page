import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/favicon-32x32.png';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: handle authentication
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

          <button type="submit" className="login-btn">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
