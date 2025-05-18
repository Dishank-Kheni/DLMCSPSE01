// src/components/layout/Header.js
import { LogoutOutlined, MenuOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Layout, Menu } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const { Header: AntHeader } = Layout;

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate('/signin');
  };

  // Common navigation items
  const navItems = [
    {
      key: '/',
      label: <Link to="/">Home</Link>,
    }
  ];

  // Authenticated user menu items
  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  // Conditional navigation based on authentication status
  if (auth.isAuthenticated) {
    if (auth.isTutor) {
      navItems.push({
        key: '/tutor',
        label: <Link to="/tutor">Tutor Dashboard</Link>,
      });
    }
    
    if (auth.isStudent) {
      navItems.push({
        key: '/student',
        label: <Link to="/student">Student Dashboard</Link>,
      });
    }
  }

  return (
    <AntHeader className="app-header">
      <div className="header-content">
        <div className="logo-container">
          <Link to="/">
            <img src={logo} alt="Logo" className="logo" />
            <span className="logo-text">United Tutoring</span>
          </Link>
        </div>
        
        <div className="nav-container desktop-nav">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={navItems}
            className="main-menu"
          />
          
          {auth.isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-menu">
                <Avatar 
                  src={auth.profilePic} 
                  icon={<UserOutlined />} 
                  className="user-avatar" 
                />
                <span className="user-name">{auth.firstName}</span>
              </div>
            </Dropdown>
          ) : (
            <div className="auth-buttons">
              <Button type="text" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
              <Button type="primary" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
        
        <div className="mobile-nav">
          <Dropdown
            menu={{
              items: [
                ...navItems,
                ...(auth.isAuthenticated ? [] : [
                  { key: 'signin', label: <Link to="/signin">Sign In</Link> },
                  { key: 'signup', label: <Link to="/signup">Sign Up</Link> }
                ]),
                ...(auth.isAuthenticated ? userMenuItems : [])
              ]
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<MenuOutlined />} />
          </Dropdown>
        </div>
      </div>
    </AntHeader>
  );
};

export default Header;