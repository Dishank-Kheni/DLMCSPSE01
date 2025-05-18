// src/features/student/pages/TutorDetails.js
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { Badge, Button, Calendar, Col, Divider, message, Modal, Rate, Row, Spin, Tag, Typography } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import studentService from '../services/studentService';
import '../styles/TutorDetails.css';

const { Title, Paragraph, Text } = Typography;

const TutorDetails = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [tutor, setTutor] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchTutorData();
  }, [tutorId]);

  const fetchTutorData = async () => {
    try {
      setLoading(true);
      
      // Fetch tutor profile details
      const tutorDetails = await studentService.getTutorDetails(tutorId);
      
      // Fetch tutor availability
      const availabilityData = await studentService.getTutorAvailability(tutorId);
      
      setTutor(tutorDetails);
      setAvailability(availabilityData.availabilityList || []);
    } catch (error) {
      message.error('Failed to load tutor information');
    } finally {
      setLoading(false);
    }
  };

  const getListData = (value) => {
    const dateStr = value.format('DD-MM-YYYY');
    const dateSlots = availability.filter(slot => slot.date === dateStr && !slot.isBooked);
    
    return dateSlots.map(slot => ({
      type: 'success',
      content: `${slot.startTime} - ${slot.endTime}`,
      slot
    }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="calendar-slots">
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const handleDateSelect = (date) => {
    const selectedDateStr = date.format('DD-MM-YYYY');
    const slots = availability.filter(
      slot => slot.date === selectedDateStr && !slot.isBooked
    );
    
    setSelectedDate(date);
    setAvailableSlots(slots);
    setIsModalVisible(true);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) {
      message.warning('Please select a time slot');
      return;
    }
    
    try {
      setBookingLoading(true);
      
      await studentService.bookTutorSlot({
        tutorId: tutorId,
        studentId: auth.username,
        slotId: selectedSlot.slotId,
        slotDate: selectedSlot.date,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });
      
      message.success('Booking request sent successfully');
      setIsModalVisible(false);
      
      // Refresh tutor data to update availability
      fetchTutorData();
    } catch (error) {
      message.error('Failed to book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
        <Text>Loading tutor details...</Text>
      </div>
    );
  }

  return (
    <div className="tutor-details-container">
      <Button 
        onClick={() => navigate('/student/find-tutors')} 
        className="back-button"
      >
        Back to Tutors
      </Button>
      
      <div className="tutor-profile-header">
        <div className="tutor-avatar-container">
          <img 
            src={tutor?.profileImage || "https://via.placeholder.com/150"} 
            alt={`${tutor?.firstName} ${tutor?.lastName}`}
            className="tutor-avatar"
          />
        </div>
        
        <div className="tutor-info">
          <Title level={2}>
            {tutor?.firstName} {tutor?.lastName}
          </Title>
          <Rate disabled defaultValue={4.5} />
          <div className="tutor-meta">
            <Text><UserOutlined /> Experience: {tutor?.expyears || 0} years</Text>
          </div>
          <div className="tutor-skills">
            {tutor?.skills?.split(',').map(skill => (
              <Tag color="blue" key={skill}>
                {skill.trim()}
              </Tag>
            ))}
          </div>
        </div>
      </div>
      
      <Divider />
      
      <div className="tutor-about">
        <Title level={3}>About</Title>
        <Paragraph>
          {tutor?.expdesc || "No description provided."}
        </Paragraph>
      </div>
      
      <Divider />
      
      <div className="tutor-availability">
        <Title level={3}>Availability</Title>
        <Paragraph>
          Select a date to view available time slots and book a session.
        </Paragraph>
        
        <div className="calendar-container">
          <Calendar 
            dateCellRender={dateCellRender}
            onSelect={handleDateSelect}
            disabledDate={(current) => {
              // Disable past dates
              return current && current < moment().startOf('day');
            }}
          />
        </div>
      </div>
      
      <Modal
        title={`Available Slots for ${selectedDate?.format('MMM DD, YYYY')}`}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={bookingLoading}
            onClick={handleBookSlot}
            disabled={!selectedSlot}
          >
            Book Session
          </Button>
        ]}
      >
        {availableSlots.length === 0 ? (
          <div className="no-slots">
            <Text>No available slots for this date</Text>
          </div>
        ) : (
          <div className="slot-selection">
            <Row gutter={[16, 16]}>
              {availableSlots.map(slot => (
                <Col span={12} key={slot.slotId}>
                  <Button
                    block
                    className={`slot-button ${selectedSlot?.slotId === slot.slotId ? 'selected' : ''}`}
                    onClick={() => handleSlotSelect(slot)}
                  >
                    <ClockCircleOutlined /> {slot.startTime} - {slot.endTime}
                  </Button>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TutorDetails;