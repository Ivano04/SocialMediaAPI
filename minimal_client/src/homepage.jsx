import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FollowButton from './FollowButton';
import { BASE_URL } from './main.jsx';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [likedPosts, setLikedPosts] = useState([]);
  const [hoveredPost, setHoveredPost] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('access');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const loggedUserId = payload?.user_id;
  const isAdmin = payload?.is_staff;

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', newPostContent);
    if (newPostImage) formData.append('image', newPostImage);

    try {
      const response = await fetch(`${BASE_URL}/api/posts/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
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
      const response = await fetch(`${BASE_URL}/api/posts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Errore nel recupero dei post');
      const data = await response.json();
      setPosts(data);
      const liked = data
        .filter(post => post.likes?.some(like => like.user === loggedUserId))
        .map(post => post.id);
      setLikedPosts(liked);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/accounts/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Errore nel recupero utenti');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/notifications/unread_count/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Errore nel recupero notifiche');
      const data = await res.json();
      setUnreadCount(data.unread_count);
    } catch (err) {
      console.error('Errore notifiche:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    navigate('/');
  };

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/likes/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ post: postId }),
      });
      if (!response.ok) throw new Error('Errore nel mettere like');
      if (likedPosts.includes(postId)) {
        setLikedPosts(likedPosts.filter(id => id !== postId));
      } else {
        setLikedPosts([...likedPosts, postId]);
      }
      fetchPosts();
    } catch (error) {
      console.error(error);
      alert('Errore di rete nel mettere like');
    }
  };

  const handleCommentSubmit = async (postId) => {
    const comment = commentText[postId]?.trim();
    if (!comment) return;

    try {
      const response = await fetch(`${BASE_URL}/api/comments/`, {
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

  useEffect(() => {
    fetchPosts();
    fetchUsers();
    fetchNotifications();
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
              <Link to={`/profile/${user.username}`} style={{ fontWeight: 'bold' }}>
                {user.username}
              </Link> ({user.followers_count} follower)
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
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleLogout} style={styles.logout}>Logout</button>
          <button onClick={() => navigate('/notifications')} style={styles.notificationButton}>
            🔔 Notifiche {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
          </button>
        </div>

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
            <div
              key={post.id}
              style={{
                ...styles.post,
                ...(hoveredPost === post.id ? styles.postHover : {})
              }}
              onMouseEnter={() => setHoveredPost(post.id)}
              onMouseLeave={() => setHoveredPost(null)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h4 style={styles.author}>
                  <Link to={`/profile/${post.author.username}`}>
                    {post.author?.username || 'Utente sconosciuto'}
                  </Link>
                </h4>
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
              <p style={styles.date}>{post.created_at ? new Date(post.created_at).toLocaleString('it-IT') : 'Data non disponibile'}</p>
              <button
                onClick={() => handleLike(post.id)}
                style={{
                  marginBottom: '10px',
                  cursor: 'pointer',
                  color: likedPosts.includes(post.id) ? 'red' : 'black'
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
    maxWidth: '1200px',
    margin: '40px auto',
    gap: '40px',
    padding: '0 20px',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
  },
  sidebar: {
    width: '280px',
    background: 'linear-gradient(180deg, #f7f7f7 0%, #eaeaea 100%)',
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
  },
  container: {
    flex: 1,
    position: 'relative',
  },
  logout: {
    padding: '10px 14px',
    border: 'none',
    backgroundColor: '#ff4d4f',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  notificationButton: {
    padding: '10px 14px',
    border: 'none',
    backgroundColor: '#4f46e5',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    position: 'relative',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  badge: {
    backgroundColor: 'crimson',
    borderRadius: '50%',
    color: 'white',
    padding: '3px 7px',
    fontSize: '12px',
    position: 'absolute',
    top: '-6px',
    right: '-6px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '32px',
    color: '#222',
    fontWeight: '600',
  },
  post: {
    background: '#fff',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    marginBottom: '25px',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  postHover: {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  },
  author: {
    margin: 0,
    fontWeight: '600',
    fontSize: '18px',
    color: '#333',
  },
  content: {
    marginTop: '12px',
    marginBottom: '12px',
    fontSize: '16px',
    lineHeight: '1.5',
    color: '#444',
  },
  date: {
    fontSize: '13px',
    color: '#999',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  center: {
    textAlign: 'center',
    marginTop: '30px',
    fontSize: '18px',
    color: '#555',
  },
  postForm: {
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    backgroundColor: '#f2f2f2',
    padding: '20px',
    borderRadius: '14px',
  },
  textarea: {
    padding: '12px',
    fontSize: '16px',
    borderRadius: '10px',
    border: '1px solid #ccc',
    resize: 'vertical',
    minHeight: '100px',
  },
  postButton: {
    padding: '12px',
    backgroundColor: '#00b894',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background 0.3s',
  },
  adminButton: {
    marginTop: '30px',
    padding: '12px',
    width: '100%',
    backgroundColor: '#333',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
