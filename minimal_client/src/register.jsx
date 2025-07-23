import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './main.jsx';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ level: '', color: '' });
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    let level = '', color = '';
    if (score <= 2) { level = 'Debole'; color = 'red'; }
    else if (score === 3) { level = 'Media'; color = 'orange'; }
    else if (score >= 4) { level = 'Forte'; color = 'green'; }

    setPasswordStrength({ level, color });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    try {
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
      <form onSubmit={handleRegister} style={styles.form}>
        <h2 style={styles.title}>Crea un nuovo account</h2>

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

        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              calculateStrength(val);
            }}
            style={styles.inputPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {password && (
          <div style={styles.strengthBarContainer}>
            <div
              style={{
                ...styles.strengthBar,
                backgroundColor: passwordStrength.color,
              }}
            />
            <p style={{ ...styles.strengthText, color: passwordStrength.color }}>
              Forza: {passwordStrength.level}
            </p>
          </div>
        )}

        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Conferma Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.inputPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button type="submit" style={styles.button}>Registrati</button>
        {error && <p style={styles.error}>{error}</p>}
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
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    width: '360px',
  },
  title: {
    fontSize: '26px',
    marginBottom: '25px',
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
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
  strengthBarContainer: {
    marginTop: '-12px',
    marginBottom: '12px',
  },
  strengthBar: {
    height: '8px',
    width: '100%',
    borderRadius: '5px',
    transition: 'background-color 0.3s ease',
  },
  strengthText: {
    marginTop: '4px',
    fontSize: '14px',
    fontWeight: '500',
  },
  button: {
    padding: '14px',
    backgroundColor: '#007BFF',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  error: {
    marginTop: '15px',
    color: 'red',
    textAlign: 'center',
    fontWeight: '500',
  },
};
