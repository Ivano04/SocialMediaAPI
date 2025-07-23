import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { BASE_URL } from './main.jsx';


export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/api/accounts/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('access', data.access);
        localStorage.setItem('refresh', data.refresh);
        navigate('/home');
      } else {
        setError(data.detail || 'Credenziali non valide');
      }
    } catch (err) {
      console.error('ERRORE:', err);
      setError('Errore di rete o server non raggiungibile');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={styles.title}>Accedi al Social</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={styles.input}
        />

        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.inputPassword}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button type="submit" style={styles.button}>Login</button>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.registerPrompt}>
          Non hai un account? <Link to="/register" style={styles.link}>Registrati</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #e0eafc, #cfdef3)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    width: '320px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '24px',
    fontSize: '24px',
    color: '#333',
    fontWeight: '600',
  },
  input: {
    padding: '12px',
    marginBottom: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
  },
  passwordContainer: {
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    marginBottom: '16px',
  },
  inputPassword: {
    flex: 1,
    padding: '12px 40px 12px 12px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  eyeButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: 0,
  },
  button: {
    padding: '14px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    marginTop: '12px',
    color: 'red',
    textAlign: 'center',
    fontWeight: '500',
  },
  registerPrompt: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '15px',
    color: '#333',
  },
  link: {
    color: '#007BFF',
    textDecoration: 'none',
    fontWeight: 'bold',
  },
};
