import React, { useState } from 'react';
import './Login.css';
import Logo from '../img/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../redux/userSlice';
import { toast } from 'react-toastify';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", formData); 

    try {
      const result = await dispatch(registerUser(formData));
      console.log("Response:", result); 

      // Use matchers to check for fulfilled or rejected status
      if (registerUser.fulfilled.match(result)) {
        toast.success('Registration successful!');
        navigate('/');
      } else if (registerUser.rejected.match(result)) {
        toast.error(result.payload || 'Registration failed');
      }
    } catch (error) {
      toast.error('Something went wrong');
      console.error('Registration error:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <img src={Logo} alt="Logo" />
          <h2>Join Us</h2>
        </div>
        <div className="login-right">
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="login-button">Register</button>
            <div className="mt-3 mb-5 d-grid">
              <div className="custom-btn custom-btn-white" type="button">
                <span className="text-muted fs-6">Already have an account? </span>
                <Link to="/login" className="ms-1 text-info fw-bold"> Login </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
