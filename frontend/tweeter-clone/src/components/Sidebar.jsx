import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../redux/userSlice';
import './Sidebar.css';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <aside className="sidebar shadow-md">
      <div className="sidebar-top">
        <div className="logo-container">
          <img
            className="logo"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7kc14Lagl_gWNh1dX91SLvjXyTOiIYf0-EA&s"
            alt="Logo"
          />
        </div>

        <nav className="nav-links">
          <Link to="/home" className="sidebar-link" title="Home">
            <i className="fa-solid fa-house"></i>
            <span className="link-text">Home</span>
          </Link>

          {userInfo && (
            <Link to={`/profile/${userInfo._id}`} className="sidebar-link" title="Profile">
              <i className="fa-solid fa-user"></i>
              <span className="link-text">Profile</span>
            </Link>
          )}

          <button className="sidebar-link logout-btn" onClick={handleLogout} title="Logout">
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            <span className="link-text">Logout</span>
          </button>
        </nav>
      </div>

      {userInfo && (
        <div className="user-info" title={`${userInfo.name} (@${userInfo.username})`}>
          <img
  src={
    userInfo.profilePic
      ? `http://localhost:4000${userInfo.profilePic}`
      : 'https://i.pinimg.com/736x/62/01/0d/62010d848b790a2336d1542fcda51789.jpg'
  }
  alt="User Avatar"
  className="user-avatar"
  onError={(e) => {
    e.target.src = 'https://i.pinimg.com/736x/62/01/0d/62010d848b790a2336d1542fcda51789.jpg';
  }}
/>

          <div className="user-details">
            <span className="user-name">{userInfo.name}</span>
            <span className="user-handle">@{userInfo.username}</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
