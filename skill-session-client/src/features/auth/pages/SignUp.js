// src/features/auth/pages/SignUp.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Typography } from 'antd';
import SignUpForm from '../components/SignUpForm';
import '../styles/Auth.css';

const { Title, Paragraph } = Typography;

const SignUp = () => {
  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Create Account</Title>
          <Paragraph>
            Join our platform to connect with tutors and students
          </Paragraph>
        </div>
        
        <SignUpForm />
        
        <div className="auth-footer">
          <Paragraph>
            Already have an account? <Link to="/signin">Sign In</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;