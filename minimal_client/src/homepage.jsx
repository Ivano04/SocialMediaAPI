import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [likedPosts, setLikedPosts] = useState(new Set());

  const navigate = useNavigate();
  const token = localStorage.getItem('access');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const loggedUserId = payload?.user_id;
  const isAdmin = payload?.is_staff;

  const handleCreatePost = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('content', newPostContent);
    if (newPostImage) {
      formData.append('image', newPostImage);
    }

    try {
      const response = await fetch('http://localhost:8000/api/posts/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Errore durante la creazione del post');

      setNewPostContent('');
      setNewPostImage(null);
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('Errore nella pubblicazione');
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/posts/', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Errore nel recupero dei post');

      const data = await response.json();
      setPosts(data);

      const likedPostIds = new Set();
      data.forEach(post => {
        if (post.likes.some(like => like.user === loggedUserId)) {
          likedPostIds.add(post.id);
        }
      });
      setLikedPosts(likedPostIds);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/accounts/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Errore nel recupero utenti');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch('http://localhost:8000/api/likes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postId }),
      });

      if (response.status === 201) {
        setLikedPosts(prev => new Set(prev).add(postId));
      } else if (response.status === 204) {
        setLikedPosts(prev => {
          const updated = new Set(prev);
          updated.delete(postId);
          return updated;
        });
      } else {
        const data = await response.json();
        alert(data.detail || 'Errore nel gestire il like');
      }

      fetchPosts();
    } catch (error) {
      console.error(error);
      alert('Errore di rete nel gestire il like');
    }
  };

  const handleCommentSubmit = async (postId) => {
    const comment = commentText[postId]?.trim();
    if (!comment) return;

    try {
      const response = await fetch('http://localhost:8000/api/comments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postId, text: comment }),
      });

      if (!response.ok) throw new Error('Errore nel commento');

      setCommentText(prev => ({ ...prev, [postId]: '' }));
      fetchPosts();
    } catch (error) {
      console.error(error);
      alert('Errore di rete nel commentare');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/');
  };

  useEffect(() => {
    fetchPosts();
    fetchUsers();
  }, []);

  if (loading) return <p style={styles.center}>Caricamento...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.sidebar}>
        <h3>Utenti registrati</h3>
        <ul style={{ listStyleType: 'none', paddingLeft: 0 }}>
          {users.map((user) => (
            <li key={user.id} style={{ marginBottom: '10px' }}>
              {user.username}
              {user.id !== loggedUserId && (
                <FollowButton
                  username={user.username}
                  initialIsFollowing={user.followers?.includes(loggedUserId)}
                />
              )}
            </li>
          ))}
        </ul>
        {isAdmin && (
          <button onClick={() => navigate('/admin')} style={styles.adminButton}>
            Pannello Admin
          </button>
        )}
      </div>

      <div style={styles.container}>
        <button onClick={handleLogout} style={styles.logout}>Logout</button>
        <h2 style={styles.title}>Feed del Social</h2>

        <form onSubmit={handleCreatePost} style={styles.postForm} encType="multipart/form-data">
          <textarea
            placeholder="Scrivi un nuovo post..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            style={styles.textarea}
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewPostImage(e.target.files[0])}
          />
          <button type="submit" style={styles.postButton}>Pubblica</button>
        </form>

        {posts.length === 0 ? (
          <p style={styles.center}>Nessun post disponibile.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={styles.post}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 style={styles.author}>{post.author?.username || 'Utente sconosciuto'}</h4>
                {post.author?.id !== loggedUserId && (
                  <FollowButton
                    username={post.author.username}
                    initialIsFollowing={post.author.followers?.includes(loggedUserId)}
                  />
                )}
              </div>
              <p style={styles.content}>{post.content}</p>
              {post.image && (
                <img
                  src={post.image}
                  alt="post"
                  style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '10px' }}
                />
              )}
              <p style={styles.date}>
                {post.created_at ? new Date(post.created_at).toLocaleString('it-IT') : 'Data non disponibile'}
              </p>
              <button
                onClick={() => handleLike(post.id)}
                style={{
                  marginBottom: '10px',
                  cursor: 'pointer',
                  backgroundColor: likedPosts.has(post.id) ? '#ffcccb' : '#f0f0f0',
                  border: '1px solid #ccc',
                  padding: '6px 12px',
                  borderRadius: '6px'
                }}
              >
                ❤️ {post.likes_count}
              </button>
              <div>
                <h5>Commenti:</h5>
                <ul>
                  {(post.comments || []).map((comment) => (
                    <li key={comment.id}>
                      <strong>{comment.author?.username || 'Anonimo'}</strong>: {comment.text}
                    </li>
                  ))}
                </ul>
                <form onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(post.id); }} style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    placeholder="Scrivi un commento..."
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    required
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '80%', marginRight: '8px' }}
                  />
                  <button type="submit" style={{ padding: '8px 12px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Invia
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '1000px',
    margin: '40px auto',
    gap: '40px',
    padding: '0 20px',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#f0f0f0',
    padding: '20px',
    borderRadius: '10px',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  logout: {
    position: 'absolute',
    top: '0',
    right: '0',
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
  postForm: {
    marginBottom: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  textarea: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    resize: 'vertical',
    minHeight: '80px',
  },
  postButton: {
    padding: '10px',
    backgroundColor: '#4f46e5',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  adminButton: {
    marginTop: '20px',
    padding: '10px',
    width: '100%',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

