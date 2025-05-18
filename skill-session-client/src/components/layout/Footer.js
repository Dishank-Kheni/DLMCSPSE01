// src/components/layout/Footer.js
import {
    EnvironmentOutlined,
    FacebookOutlined,
    InstagramOutlined,
    LinkedinOutlined,
    MailOutlined,
    PhoneOutlined,
    TwitterOutlined
} from '@ant-design/icons';
import { Col, Divider, Layout, Row, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';
import './Footer.css';

const { Footer: AntFooter } = Layout;
const { Title, Text } = Typography;

const Footer = () => {
  return (
    <AntFooter className="app-footer">
      <div className="footer-content">
        <Row gutter={[32, 24]}>
          <Col xs={24} sm={12} md={8}>
            <div className="footer-section">
              <Title level={4}>United Tutoring</Title>
              <Text>Connecting students with expert tutors for personalized learning experiences.</Text>
              <div className="social-icons">
                <Space size="middle">
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <FacebookOutlined />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <TwitterOutlined />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <InstagramOutlined />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <LinkedinOutlined />
                  </a>
                </Space>
              </div>
            </div>
          </Col>

          <Col xs={24} sm={12} md={8}>
            <div className="footer-section">
              <Title level={4}>Quick Links</Title>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/tutor/find">Find a Tutor</Link></li>
                <li><Link to="/become-tutor">Become a Tutor</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>
          </Col>

          <Col xs={24} sm={24} md={8}>
            <div className="footer-section">
              <Title level={4}>Contact Us</Title>
              <ul className="contact-info">
                <li>
                  <MailOutlined />
                  <a href="mailto:info@unitedtutoring.com">info@unitedtutoring.com</a>
                </li>
                <li>
                  <PhoneOutlined />
                  <a href="tel:+1234567890">+1 (234) 567-890</a>
                </li>
                <li>
                  <EnvironmentOutlined />
                  <span>123 Education Street, Learning City</span>
                </li>
              </ul>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <div className="footer-bottom">
          <Row justify="space-between" align="middle">
            <Col xs={24} sm={12}>
              <div className="copyright">
                &copy; {new Date().getFullYear()} United Tutoring. All rights reserved.
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="footer-bottom-links">
                <Link to="/privacy-policy">Privacy Policy</Link>
                <Link to="/terms-of-service">Terms of Service</Link>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;