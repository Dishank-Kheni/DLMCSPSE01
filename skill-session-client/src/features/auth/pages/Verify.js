// src/features/auth/pages/VerifyAccount.js
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import VerifyAccountForm from '../components/VerifyAccountForm';
import '../styles/Auth.css';

const { Title, Paragraph } = Typography;

const VerifyAccount = () => {
  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <Title level={2}>Verify Your Account</Title>
          <Paragraph>
            Enter the verification code sent to your email
          </Paragraph>
        </div>
        
        <VerifyAccountForm />
        
        <div className="auth-footer">
          <Paragraph>
            <Link to="/signin">Back to Sign In</Link>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default VerifyAccount;