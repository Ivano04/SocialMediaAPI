import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from './main.jsx';


const UserProfile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    fetch(`${BASE_URL}/api/accounts/profile/${username}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Errore nel caricamento del profilo');
        return res.json();
      })
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [username]);

  if (loading) return <p style={styles.loading}>Caricamento profilo...</p>;
  if (!profile) return <p style={styles.error}>Errore nel caricamento del profilo.</p>;

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>Profilo di {profile.username}</h2>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Bio:</strong> {profile.bio || 'Nessuna bio disponibile.'}</p>
      <p><strong>Post pubblicati:</strong> {profile.posts_count}</p>
      <p><strong>Segue:</strong> {profile.following_count} – {profile.following.join(', ') || 'nessuno'}</p>
      <p><strong>Seguaci:</strong> {profile.followers_count} – {profile.followers.join(', ') || 'nessuno'}</p>

      <hr style={{ margin: '30px 0' }} />

      {profile.posts.length > 0 ? (
        <div>
          <h3 style={{ marginBottom: '20px' }}>Post pubblicati:</h3>
          {profile.posts.map(post => (
            <div key={post.id} style={styles.postBox}>
              <p>{post.content}</p>
              {post.image && (
                <img
                  src={post.image}
                  alt="post"
                  style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '10px' }}
                />
              )}
              <p style={styles.postDate}>
                {new Date(post.created_at).toLocaleString('it-IT')}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p>L'utente non ha ancora pubblicato post.</p>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: 'Segoe UI, sans-serif',
  },
  title: {
    fontSize: '28px',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333',
  },
  loading: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '18px',
    color: '#555',
  },
  error: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '18px',
    color: 'crimson',
  },
  postBox: {
    marginBottom: '30px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
  },
  postDate: {
    fontSize: '12px',
    color: '#888',
    marginTop: '10px',
    fontStyle: 'italic',
  },
};

export default UserProfile;
