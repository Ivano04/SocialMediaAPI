import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('access');

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload?.is_staff) {
      alert('Accesso negato: non sei un amministratore');
      navigate('/home');
      return;
    }

    setIsAdmin(true);

    fetch('http://localhost:8000/api/accounts/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('DEBUG utenti ricevuti:', data);
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Errore nel caricamento utenti:', err);
        alert('Errore nel recupero degli utenti');
      });
  }, [token, navigate]);

  const handleDelete = async (userId) => {
    if (!window.confirm('Vuoi davvero eliminare questo utente?')) return;

    try {
      const response = await fetch(`http://localhost:8000/api/accounts/admin-users/${userId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        const data = await response.json();
        alert(data.detail || 'Errore durante l’eliminazione');
      }
    } catch (err) {
      console.error(err);
      alert('Errore durante la richiesta di eliminazione');
    }
  };

  if (!isAdmin) return null;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestione Utenti (Solo Admin)</h2>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {users.map(user => (
          <li key={user.id} style={{ marginBottom: '12px' }}>
            <span><strong>{user.username}</strong> - {user.email}</span>
            <button
              style={{
                marginLeft: '12px',
                backgroundColor: 'red',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => handleDelete(user.id)}
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUserList;
