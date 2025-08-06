import React, { useState } from 'react';
import './Login.css';
import Logo from '../img/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../redux/userSlice';
import { toast } from 'react-toastify';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginUser(formData));
      console.log("Login Result:", result); 

      if (loginUser.fulfilled.match(result)) {
        toast.success("Login successful!");
        navigate('/home');
      } else if (loginUser.rejected.match(result)) {
        toast.error(result.payload || 'Login failed');
      }
    } catch (error) {
      toast.error('Something went wrong!');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <h2>Welcome Back</h2>
          <img src={Logo} alt="logo" />
        </div>
        <div className="login-right">
          <h1>Log in</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              className="p-2 mt-4 mb-2 form-control"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              className="p-2 mb-2 form-control"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="mt-3 d-grid">
              <button type="submit" className="login-button">Login</button>
            </div>
            <div className="mt-3 mb-5 d-grid">
              <button className="custom-btn custom-btn-white" type="button">
                <span className="text-muted fs-6">Don't have an account?</span>
                <Link to="/register" className="ms-1 text-info fw-bold"> Register Here</Link>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
