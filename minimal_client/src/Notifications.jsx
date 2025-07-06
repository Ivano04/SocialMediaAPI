import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch('${BASE_URL}/api/notifications/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Errore nel recupero notifiche");

        const data = await response.json();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token, navigate]);

  if (loading) return <p style={{ textAlign: 'center' }}>Caricamento notifiche...</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Le tue notifiche</h2>
      {notifications.length === 0 ? (
        <p style={styles.empty}>Nessuna notifica al momento.</p>
      ) : (
        <ul style={styles.list}>
          {notifications.map((notif) => (
            <li key={notif.id} style={styles.item}>
              <span style={styles.actor}>{notif.actor?.username}</span> {notif.verb}
              {notif.target_post && (
                <span style={styles.postInfo}> sul tuo post #{notif.target_post}</span>
              )}
              <div style={styles.time}>
                {new Date(notif.created_at).toLocaleString('it-IT')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '10px',
  },
  title: {
    textAlign: 'center',
    fontSize: '24px',
    marginBottom: '20px',
  },
  list: {
    listStyleType: 'none',
    paddingLeft: 0,
  },
  item: {
    backgroundColor: '#fff',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '10px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
  },
  actor: {
    fontWeight: 'bold',
  },
  postInfo: {
    fontStyle: 'italic',
    color: '#444',
  },
  time: {
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
  },
  empty: {
    textAlign: 'center',
    color: '#777',
  },
};
