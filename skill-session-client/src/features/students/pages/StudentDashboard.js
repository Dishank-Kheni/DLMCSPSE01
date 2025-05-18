// src/features/student/pages/StudentDashboard.js
import React, { useEffect } from 'react';
import { Typography, Button, Space, Card, Row, Col } from 'antd';
import { SearchOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import '../styles/StudentDashboard.css';

const { Title, Paragraph } = Typography;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { auth, setProfileType } = useAuth();

  useEffect(() => {
    // Set profile type to student when this component loads
    setProfileType('student');
  }, []);

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <Title level={2}>Student Dashboard</Title>
        <Paragraph>
          Welcome back, {auth.firstName}! Find tutors and manage your learning sessions here.
        </Paragraph>
      </div>

      <Row gutter={[24, 24]} className="dashboard-cards">
        <Col xs={24} sm={12} lg={8}>
          <Card 
            hoverable 
            className="dashboard-card"
            onClick={() => navigate('/student/find-tutors')}
          >
            <div className="card-content">
              <SearchOutlined className="card-icon" />
              <div className="card-text">
                <Title level={4}>Find Tutors</Title>
                <Paragraph>Browse and connect with qualified tutors.</Paragraph>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card 
            hoverable 
            className="dashboard-card"
            onClick={() => navigate('/student/bookings')}
          >
            <div className="card-content">
              <HistoryOutlined className="card-icon" />
              <div className="card-text">
                <Title level={4}>My Bookings</Title>
                <Paragraph>View and manage your tutor session bookings.</Paragraph>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card 
            hoverable 
            className="dashboard-card"
            onClick={() => navigate('/profile')}
          >
            <div className="card-content">
              <SettingOutlined className="card-icon" />
              <div className="card-text">
                <Title level={4}>Profile Settings</Title>
                <Paragraph>Update your student profile and preferences.</Paragraph>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div className="dashboard-actions">
        <Space size="large">
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/student/find-tutors')}
          >
            Find Tutors
          </Button>
          <Button 
            size="large"
            onClick={() => navigate('/student/bookings')}
          >
            View My Bookings
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default StudentDashboard;