// src/features/auth/pages/SignUp.js
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import '../styles/Auth.css';
import SignUpForm from './components/SignUpForm';

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