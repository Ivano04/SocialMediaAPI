import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './main.jsx';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // 1. REGISTRAZIONE
      const registerResponse = await fetch(`${BASE_URL}/api/accounts/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!registerResponse.ok) {
        const data = await registerResponse.json();
        setError(data.username || data.email || data.password || 'Errore nella registrazione');
        return;
      }

      // 2. LOGIN AUTOMATICO
      const loginResponse = await fetch(`${BASE_URL}/api/accounts/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('access', loginData.access);
        localStorage.setItem('refresh', loginData.refresh);
        navigate('/home');
      } else {
        setError('Registrazione riuscita, ma errore nel login automatico');
      }
    } catch (err) {
      console.error(err);
      setError('Errore di rete');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Registrati</h2>
      <form onSubmit={handleRegister} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>Crea account</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 0 20px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  input: {
    padding: '10px',
    marginBottom: '16px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#4caf50',
    color: '#fff',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  error: {
    marginTop: '10px',
    color: 'red',
    textAlign: 'center',
  },
};
