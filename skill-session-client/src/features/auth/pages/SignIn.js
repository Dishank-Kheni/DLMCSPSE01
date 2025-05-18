// src/features/auth/pages/SignIn.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import SignInForm from '../components/SignInForm';
import '../styles/Auth.css';

const { Title, Paragraph } = Typography;

const SignIn = () => {
  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Sign In</Title>
          <Paragraph>
            Sign in to your account to access tutoring services
          </Paragraph>
        </div>
        
        <SignInForm />
        
        <div className="auth-footer">
          <Paragraph>
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </Paragraph>
          <Paragraph>
            <Link to="/forgetpassword">Forgot password?</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default SignIn;