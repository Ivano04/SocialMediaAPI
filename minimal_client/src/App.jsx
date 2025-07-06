// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './login';
import HomePage from './homePage';
import PrivateRoute from './PrivateRoute';
import Register from './register';
import AdminUserList from './AdminUserList';
import Notifications from './Notifications';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminUserList />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
