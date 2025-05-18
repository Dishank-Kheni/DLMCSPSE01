// src/features/auth/pages/ResetPassword.js
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import ResetPasswordForm from '../components/ResetPasswordForm';
import '../styles/Auth.css';

const { Title, Paragraph } = Typography;

const ResetPassword = () => {
  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Set New Password</Title>
          <Paragraph>
            Enter the verification code and your new password
          </Paragraph>
        </div>
        
        <ResetPasswordForm />
        
        <div className="auth-footer">
          <Paragraph>
            <Link to="/signin">Back to Sign In</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;