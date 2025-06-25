import { Navigate } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const token = localStorage.getItem('access');

  if (!token) return <Navigate to="/" />;

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const payload = JSON.parse(jsonPayload);

    if (payload.is_staff) {
      return children;
    } else {
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          Non sei autorizzato a visualizzare questa pagina
        </div>
      );
    }
  } catch (err) {
    console.error('Errore nella decodifica del token:', err);
    return <Navigate to="/" />;
  }
}

