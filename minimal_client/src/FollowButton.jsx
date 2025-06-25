// src/FollowButton.jsx
import React, { useState } from 'react';
import axios from 'axios';

const FollowButton = ({ username, initialIsFollowing }) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('access');

  const handleFollowToggle = async () => {
    if (!token || loading) return;
    setLoading(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      if (isFollowing) {
        await axios.delete(`http://localhost:8000/api/accounts/follow/${username}/`, config);
        setIsFollowing(false);
      } else {
        await axios.post(`http://localhost:8000/api/accounts/follow/${username}/`, {}, config);
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Errore durante il follow/unfollow", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollowToggle}
      disabled={loading}
      style={{
        marginLeft: '10px',
        padding: '4px 8px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        backgroundColor: isFollowing ? '#ddd' : '#4f46e5',
        color: isFollowing ? '#333' : '#fff'
      }}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

export default FollowButton;
