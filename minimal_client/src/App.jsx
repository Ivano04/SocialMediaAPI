// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import HomePage from './HomePage';
import PrivateRoute from './PrivateRoute';
import Register from './Register';
import AdminUserList from './AdminUserList';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }/>
        <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<PrivateRoute> <AdminUserList /> </PrivateRoute>
  }
/>

      </Routes>
    </Router>
  );
}

export default App;

