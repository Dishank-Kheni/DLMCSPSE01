import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Menu } from 'antd';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const profileMenu = (
    <Menu
      items={[
        {
          label: 'Profile',
          key: '1',
          onClick: () => navigate('/profile')
        },
        {
          label: 'Logout',
          key: '2',
          onClick: handleLogout
        },
      ]}
    />
  );
  
  const tutorMenu = (
    <Menu
      items={[
        {
          label: 'Availability',
          key: '1',
          onClick: () => navigate('/tutor')
        },
        {
          label: 'Booking details',
          key: '2',
          onClick: () => navigate('/tutor/bookings')
        },
      ]}
    />
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <button
        className="navbar-toggler"
        type="button"
        data-toggle="collapse"
        data-target="#headermenu"
        aria-controls="navbarText"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>
      
      <div className="collapse navbar-collapse" id="headermenu">
        {!isAuthenticated ? (
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signin">
                Login
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/signup">
                Sign up
              </Link>
            </li>
          </ul>
        ) : (
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/home">
                Home
              </Link>
            </li>
            
            {user?.isTutor && (
              <li className="nav-item">
                <Dropdown overlay={tutorMenu} trigger={['click']}>
                  <a className="nav-link" onClick={(e) => e.preventDefault()}>
                    Tutor
                  </a>
                </Dropdown>
              </li>
            )}
            
            {user?.isStudent && (
              <li className="nav-item">
                <Link className="nav-link" to="/student">
                  Student
                </Link>
              </li>
            )}
            
            <li className="nav-item">
              <Dropdown overlay={profileMenu} trigger={['click']}>
                <a className="nav-link" onClick={(e) => e.preventDefault()}>
                  {user?.username ? user.username : 'Account'}
                </a>
              </Dropdown>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Header;