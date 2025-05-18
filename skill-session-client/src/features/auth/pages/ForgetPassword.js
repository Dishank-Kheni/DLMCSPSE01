// src/features/auth/pages/ForgotPassword.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import ForgotPasswordForm from '../components/ForgotPasswordForm';
import '../styles/Auth.css';

const { Title, Paragraph } = Typography;

const ForgotPassword = () => {
  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Reset Password</Title>
          <Paragraph>
            Enter your email to receive a password reset code
          </Paragraph>
        </div>
        
        <ForgotPasswordForm />
        
        <div className="auth-footer">
          <Paragraph>
            <Link to="/signin">Back to Sign In</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;