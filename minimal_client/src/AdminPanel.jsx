import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const token = localStorage.getItem('access');
  const isAdmin = JSON.parse(atob(token.split('.')[1])).is_staff;

  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchAll = async () => {
    try {
      const [postRes, commentRes, userRes] = await Promise.all([
        axios.get('/api/posts/', config),
        axios.get('/api/comments/', config),
        axios.get('/api/accounts/admin-users/', config),
      ]);
      setPosts(postRes.data);
      setComments(commentRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error('Errore nel recupero dati admin:', err);
    }
  };

  const deleteItem = async (type, id) => {
    const endpoint = {
      post: `/api/posts/${id}/`,
      comment: `/api/comments/${id}/`,
      user: `/api/accounts/admin-users/${id}/`,
    };

    try {
      await axios.delete(endpoint[type], config);
      fetchAll(); // aggiorna dopo cancellazione
    } catch (err) {
      console.error(`Errore nel cancellare ${type}:`, err);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, []);

  if (!isAdmin) return <p>Non sei autorizzato a visualizzare questa pagina.</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Pannello Amministrazione</h2>

      <section>
        <h3>Post</h3>
        <ul>
          {posts.map((p) => (
            <li key={p.id}>
              {p.content} - <strong>{p.author.username}</strong>
              <button onClick={() => deleteItem('post', p.id)} style={styles.delBtn}>Elimina</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Commenti</h3>
        <ul>
          {comments.map((c) => (
            <li key={c.id}>
              {c.text} - <strong>{c.author.username}</strong>
              <button onClick={() => deleteItem('comment', c.id)} style={styles.delBtn}>Elimina</button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Utenti</h3>
        <ul>
          {users.map((u) => (
            <li key={u.id}>
              {u.username} ({u.email})
              <button onClick={() => deleteItem('user', u.id)} style={styles.delBtn}>Elimina</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

const styles = {
  delBtn: {
    marginLeft: '10px',
    backgroundColor: '#e53935',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '4px 8px',
    cursor: 'pointer',
  },
};

export default AdminPanel;

