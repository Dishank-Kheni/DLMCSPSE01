// src/features/dashboard/pages/Dashboard.js
import {
    BookOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Button, Card, Carousel, Col, Row, Statistic, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import heroImage from '../../../assets/images/hero-image.jpg';
import '../styles/Dashboard.css';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      text: "United Tutoring helped me improve my grades significantly. The platform is easy to use and the tutors are excellent!",
      author: "Alex Johnson",
      role: "Computer Science Student"
    },
    {
      id: 2,
      text: "As a tutor on this platform, I've found it incredibly rewarding to connect with students who are genuinely eager to learn.",
      author: "Dr. Sarah Williams",
      role: "Mathematics Tutor"
    },
    {
      id: 3,
      text: "The flexible scheduling allowed me to find tutoring sessions that fit perfectly with my busy college schedule.",
      author: "Michael Chen",
      role: "Engineering Student"
    }
  ];

  // Features data
  const features = [
    {
      icon: <UserOutlined className="feature-icon" />,
      title: "Expert Tutors",
      description: "Connect with qualified tutors who are experts in their fields."
    },
    {
      icon: <BookOutlined className="feature-icon" />,
      title: "Any Subject",
      description: "Find help in a wide range of academic subjects and skill levels."
    },
    {
      icon: <ClockCircleOutlined className="feature-icon" />,
      title: "Flexible Scheduling",
      description: "Book sessions at times that work best for your schedule."
    },
    {
      icon: <CheckCircleOutlined className="feature-icon" />,
      title: "Verified Profiles",
      description: "All tutors are verified to ensure quality education."
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Hero Section */}
      <section className="hero-section">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12}>
            <div className="hero-content">
              <Title>Find Your Perfect Tutor Today</Title>
              <Paragraph className="hero-text">
                Connect with qualified tutors to achieve your academic goals. Our platform makes it easy to find, book, and manage tutoring sessions.
              </Paragraph>
              <div className="hero-buttons">
                <Button 
                  type="primary" 
                  size="large"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
                <Button 
                  size="large"
                  onClick={() => navigate('/signin')}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div className="hero-image-container">
              <img 
                src={heroImage} 
                alt="Students learning" 
                className="hero-image" 
              />
            </div>
          </Col>
        </Row>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <Row gutter={[32, 32]}>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic 
                title="Active Tutors" 
                value={500} 
                prefix={<UserOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic 
                title="Students" 
                value={2000} 
                prefix={<UserOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic 
                title="Subjects" 
                value={50} 
                prefix={<BookOutlined />} 
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card>
              <Statistic 
                title="Sessions Completed" 
                value={15000} 
                prefix={<CheckCircleOutlined />} 
              />
            </Card>
          </Col>
        </Row>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Title level={2} className="section-title">Why Choose Us</Title>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card className="feature-card">
                <div className="feature-icon-wrapper">
                  {feature.icon}
                </div>
                <Title level={4}>{feature.title}</Title>
                <Paragraph>{feature.description}</Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <Title level={2} className="section-title">How It Works</Title>
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={8}>
            <div className="step-card">
              <div className="step-number">1</div>
              <Title level={3}>Create an Account</Title>
              <Paragraph>
                Sign up and complete your profile with your academic details and learning preferences.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="step-card">
              <div className="step-number">2</div>
              <Title level={3}>Find a Tutor</Title>
              <Paragraph>
                Browse through our qualified tutors and find the perfect match for your subject needs.
              </Paragraph>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div className="step-card">
              <div className="step-number">3</div>
              <Title level={3}>Book a Session</Title>
              <Paragraph>
                Select your preferred time slot, book your session, and start learning immediately.
              </Paragraph>
            </div>
          </Col>
        </Row>
        <div className="cta-container">
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/signup')}
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <Title level={2} className="section-title">What Our Users Say</Title>
        <Carousel autoplay>
          {testimonials.map(testimonial => (
            <div key={testimonial.id}>
              <div className="testimonial-card">
                <div className="testimonial-content">
                  <div className="testimonial-text">
                    "{testimonial.text}"
                  </div>
                  <div className="testimonial-author">
                    <strong>{testimonial.author}</strong>
                    <div className="testimonial-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </section>

      {/* Sign Up CTA Section */}
      <section className="signup-cta-section">
        <Title level={2}>Ready to Start Learning?</Title>
        <Paragraph className="cta-text">
          Join thousands of students who are already improving their grades with United Tutoring
        </Paragraph>
        <div className="cta-buttons">
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/signup')}
          >
            Sign Up as Student
          </Button>
          <Button 
            type="default" 
            size="large"
            onClick={() => navigate('/signup')}
          >
            Become a Tutor
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;