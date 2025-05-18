// src/features/home/pages/Home.js
import React, { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Button, Space, List, Tabs, Avatar, Spin } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  BookOutlined, 
  ClockCircleOutlined 
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import studentService from '../../student/services/studentService';
import tutorService from '../../tutor/services/tutorService';
import '../styles/Home.css';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const Home = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);

  useEffect(() => {
    fetchUserData();
  }, [auth.profileType]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      if (auth.isTutor) {
        const tutorBookings = await tutorService.getBookings(auth.username);
        const bookings = tutorBookings.Bookings || [];
        
        // Transform bookings
        const transformed = bookings.map(booking => ({
          id: booking.bookingId?.S,
          date: booking.slotDate?.S,
          startTime: booking.startTime?.S,
          endTime: booking.endTime?.S,
          status: booking.bookingstatus?.S,
          studentName: booking.studentId?.S,
          bookingType: 'tutor'
        }));
        
        // Filter by status
        setUpcomingBookings(transformed.filter(b => b.status === 'CONFIRM'));
        setPendingBookings(transformed.filter(b => b.status === 'PENDING'));
      }
      
      if (auth.isStudent) {
        const studentBookings = await studentService.getStudentBookings(auth.username);
        const bookings = studentBookings.Bookings || [];
        
        // Transform bookings
        const transformed = bookings.map(booking => ({
          id: booking.bookingId?.S,
          date: booking.slotDate?.S,
          startTime: booking.startTime?.S,
          endTime: booking.endTime?.S,
          status: booking.bookingstatus?.S,
          tutorName: booking.tutorId?.S,
          bookingType: 'student'
        }));
        
        // Filter by status
        setUpcomingBookings(transformed.filter(b => b.status === 'CONFIRM'));
        setPendingBookings(transformed.filter(b => b.status === 'PENDING'));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="welcome-section">
        <Title level={2}>Welcome back, {auth.firstName}!</Title>
        <Paragraph>
          {auth.isTutor && auth.isStudent ? 
            "Manage your tutoring sessions and student bookings all in one place." :
            auth.isTutor ? 
              "Manage your tutoring sessions and availability." :
              "Browse tutors and manage your learning sessions."}
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card className="main-card">
            <Tabs defaultActiveKey="upcoming">
              <TabPane 
                tab={
                  <span>
                    <CalendarOutlined /> Upcoming Sessions
                  </span>
                } 
                key="upcoming"
              >
                {loading ? (
                  <div className="loading-container">
                    <Spin size="large" />
                    <Text>Loading your sessions...</Text>
                  </div>
                ) : (
                  <List
                    dataSource={upcomingBookings}
                    locale={{ emptyText: "You don't have any upcoming sessions" }}
                    renderItem={item => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<ClockCircleOutlined />} />}
                          title={
                            <div className="session-title">
                              <span>{item.date} ({item.startTime} - {item.endTime})</span>
                              <Tag color="green">Confirmed</Tag>
                            </div>
                          }
                          description={
                            <div>
                              {item.bookingType === 'tutor' ? 
                                `Student: ${item.studentName}` : 
                                `Tutor: ${item.tutorName}`}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </TabPane>
              <TabPane 
                tab={
                  <span>
                    <ClockCircleOutlined /> Pending Requests
                  </span>
                } 
                key="pending"
              >
                {loading ? (
                  <div className="loading-container">
                    <Spin size="large" />
                    <Text>Loading your pending requests...</Text>
                  </div>
                ) : (
                  <List
                    dataSource={pendingBookings}
                    locale={{ emptyText: "You don't have any pending requests" }}
                    renderItem={item => (
                      <List.Item 
                        actions={
                          item.bookingType === 'tutor' ? [
                            <Button 
                              key="view" 
                              onClick={() => navigate('/tutor/bookings')}
                            >
                              Manage
                            </Button>
                          ] : []
                        }
                      >
                        <List.Item.Meta
                          avatar={<Avatar icon={<ClockCircleOutlined />} />}
                          title={
                            <div className="session-title">
                              <span>{item.date} ({item.startTime} - {item.endTime})</span>
                              <Tag color="orange">Pending</Tag>
                            </div>
                          }
                          description={
                            <div>
                              {item.bookingType === 'tutor' ? 
                                `Student: ${item.studentName}` : 
                                `Tutor: ${item.tutorName}`}
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </TabPane>
            </Tabs>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <Card className="dashboard-card">
              <Title level={4}>Quick Actions</Title>
              <div className="quick-actions">
                {auth.isTutor && (
                  <>
                    <Button 
                      type="primary" 
                      icon={<CalendarOutlined />}
                      block
                      onClick={() => navigate('/tutor/availability')}
                    >
                      Manage Availability
                    </Button>
                    <Button 
                      icon={<BookOutlined />}
                      block
                      onClick={() => navigate('/tutor/bookings')}
                    >
                      View Booking Requests
                    </Button>
                  </>
                )}
                
                {auth.isStudent && (
                  <>
                    <Button 
                      type="primary" 
                      icon={<UserOutlined />}
                      block
                      onClick={() => navigate('/student/find-tutors')}
                    >
                      Find Tutors
                    </Button>
                    <Button 
                      icon={<BookOutlined />}
                      block
                      onClick={() => navigate('/student/bookings')}
                    >
                      My Bookings
                    </Button>
                  </>
                )}
                
                <Button 
                  icon={<UserOutlined />}
                  block
                  onClick={() => navigate('/profile')}
                >
                  Update Profile
                </Button>
              </div>
            </Card>
            
            {auth.isTutor && auth.isStudent && (
              <Card className="switch-card">
                <Title level={4}>Switch Role</Title>
                <div className="switch-actions">
                  <Button 
                    type={auth.profileType === 'tutor' ? 'primary' : 'default'}
                    block
                    onClick={() => {
                      auth.setProfileType('tutor');
                      navigate('/tutor');
                    }}
                  >
                    Tutor Dashboard
                  </Button>
                  <Button 
                    type={auth.profileType === 'student' ? 'primary' : 'default'}
                    block
                    onClick={() => {
                      auth.setProfileType('student');
                      navigate('/student');
                    }}
                  >
                    Student Dashboard
                  </Button>
                </div>
              </Card>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default Home;