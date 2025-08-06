import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './components/Profile';         
import TweetDetailsPage from './pages/TweetDetail';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const userFromStorage = localStorage.getItem('userInfo');
    if (userFromStorage) {
      dispatch({
        type: 'user/login/fulfilled',
        payload: JSON.parse(userFromStorage),
      });
    }
  }, [dispatch]);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* App Routes */}
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />           
          <Route path="/profile/:id" element={<Profile />} />       
          <Route path="/tweet/:id" element={<TweetDetailsPage />} />
        </Routes>
      </BrowserRouter>

      {/* Global Notifications */}
      <ToastContainer position="top-center" autoClose={1000} />
    </div>
  );
}

export default App;
