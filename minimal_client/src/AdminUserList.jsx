import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './main.jsx';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
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

    fetch(`${BASE_URL}/api/accounts/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setUsers(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Errore nel caricamento utenti:', err);
        alert('Errore nel recupero degli utenti');
      });

    fetch(`${BASE_URL}/api/posts/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setPosts(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Errore nel caricamento post:', err);
      });

    fetch(`${BASE_URL}/api/comments/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setComments(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Errore nel caricamento commenti:', err);
      });
  }, [token, navigate]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Vuoi davvero eliminare questo utente?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/accounts/admin-users/${userId}/`, {
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

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Vuoi davvero eliminare questo post?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/admin-posts/${postId}/`, {

        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        alert('Errore durante l’eliminazione del post');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Vuoi davvero eliminare questo commento?')) return;

    try {
      const response = await fetch(`${BASE_URL}/api/comments/${commentId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        alert('Errore durante l’eliminazione del commento');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAdmin) return null;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Gestione Utenti (Solo Admin)</h2>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {users.map(user => (
          <li key={user.id} style={{ marginBottom: '12px' }}>
            <span><strong>{user.username}</strong> - {user.email} ({user.followers_count} follower)</span>
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
              onClick={() => handleDeleteUser(user.id)}
            >
              Elimina
            </button>
          </li>
        ))}
      </ul>

      <h2>Gestione Post</h2>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {posts.map(post => (
          <li key={post.id} style={{ marginBottom: '12px' }}>
            <span><strong>{post.author?.username || 'Utente'}</strong>: {post.content?.slice(0, 50)}...</span>
            <button
              style={{
                marginLeft: '12px',
                backgroundColor: 'orange',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => handleDeletePost(post.id)}
            >
              Elimina Post
            </button>
          </li>
        ))}
      </ul>

      <h2>Gestione Commenti</h2>
      <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
        {comments.map(comment => (
          <li key={comment.id} style={{ marginBottom: '12px' }}>
            <span><strong>{comment.author?.username || 'Utente'}</strong>: {comment.text}</span>
            <button
              style={{
                marginLeft: '12px',
                backgroundColor: '#333',
                color: 'white',
                padding: '6px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              onClick={() => handleDeleteComment(comment.id)}
            >
              Elimina Commento
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminUserList;
