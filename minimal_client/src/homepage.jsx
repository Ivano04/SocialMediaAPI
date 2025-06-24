import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/');
  };

  const fetchPosts = async () => {
    const token = localStorage.getItem('access');
    try {
      const response = await fetch('http://localhost:8000/api/posts/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Errore nel recupero dei post');
      }

      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) return <p style={styles.center}>Caricamento...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.container}>
      <button onClick={handleLogout} style={styles.logout}>Logout</button>
      <h2 style={styles.title}>Feed del Social</h2>
      {posts.length === 0 ? (
        <p style={styles.center}>Nessun post disponibile.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={styles.post}>
            <h4 style={styles.author}>{post.author?.username || 'Utente sconosciuto'}</h4>
            <p style={styles.content}>{post.content}</p>
            <p style={styles.date}>
              {post.created_at
                ? new Date(post.created_at).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Data non disponibile'}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '40px auto',
    padding: '0 20px',
    position: 'relative', // 👈 aggiunto per rendere visibile il bottone Logout assoluto
  },
  logout: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    padding: '8px 12px',
    border: 'none',
    backgroundColor: '#e53935',
    color: '#fff',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '28px',
    color: '#333',
  },
  post: {
    background: '#f9f9f9',
    padding: '16px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.05)',
    marginBottom: '20px',
  },
  author: {
    margin: 0,
    fontWeight: 'bold',
  },
  content: {
    marginTop: '8px',
    marginBottom: '8px',
  },
  date: {
    fontSize: '12px',
    color: '#666',
    textAlign: 'right',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
    marginTop: '30px',
  },
};
