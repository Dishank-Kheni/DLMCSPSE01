// src/features/tutor/pages/TutorAvailability.js
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Button, DatePicker, List, Space, Spin, TimePicker, Typography, message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import tutorService from '../services/tutorService';
import '../styles/TutorAvailability.css';

const { Title, Text } = Typography;
const { RangePicker } = TimePicker;

const TutorAvailability = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availabilityList, setAvailabilityList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(null);

  // Load availability data
  useEffect(() => {
    fetchAvailability();
  }, []);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await tutorService.getAvailability(auth.username);
      setAvailabilityList(response.availabilityList || []);
    } catch (error) {
      message.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  };

  // Date selection handler
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Time selection handler
  const handleTimeChange = (times) => {
    setSelectedTimeRange(times);
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeRange) {
      message.warning('Please select both date and time');
      return;
    }

    try {
      setSubmitting(true);
      const data = {
        id: auth.username,
        date: selectedDate.format('DD-MM-YYYY'),
        startTime: selectedTimeRange[0].format('HH:mm'),
        endTime: selectedTimeRange[1].format('HH:mm')
      };

      await tutorService.saveAvailability(data);
      message.success('Availability saved successfully');
      
      // Reset form and refresh list
      setSelectedDate(null);
      setSelectedTimeRange(null);
      fetchAvailability();
    } catch (error) {
      message.error('Failed to save availability');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="availability-container">
      <div className="availability-header">
        <Title level={2}>Manage Your Availability</Title>
        <Button onClick={() => navigate('/tutor')} className="back-button">
          Back to Dashboard
        </Button>
      </div>

      <div className="availability-form">
        <Title level={4}>Add New Availability</Title>
        <div className="form-inputs">
          <Space direction="vertical" size={16} className="date-picker-container">
            <Text strong>Select Date</Text>
            <DatePicker 
              onChange={handleDateChange}
              value={selectedDate}
              format="DD-MM-YYYY"
              disabledDate={(current) => {
                // Disable past dates and dates more than a month in the future
                return current && (current < moment().startOf('day') || 
                       current > moment().add(1, 'month'));
              }}
            />
          </Space>
          
          <Space direction="vertical" size={16} className="time-picker-container">
            <Text strong>Select Time Range</Text>
            <RangePicker 
              onChange={handleTimeChange}
              value={selectedTimeRange}
              format="HH:mm"
            />
          </Space>
        </div>
        
        <Button 
          type="primary" 
          className="submit-button"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!selectedDate || !selectedTimeRange}
        >
          Add Availability
        </Button>
      </div>

      <div className="availability-list">
        <Title level={4}>Your Available Slots</Title>
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Loading availability...</Text>
          </div>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={availabilityList}
            locale={{ emptyText: "You haven't added any availability yet" }}
            renderItem={(item) => (
              <List.Item className="availability-item">
                <List.Item.Meta
                  avatar={<CalendarOutlined className="list-icon" />}
                  title={`Date: ${item.date}`}
                  description={
                    <Space direction="vertical">
                      <Text><ClockCircleOutlined /> Time: {item.startTime} - {item.endTime}</Text>
                      <Text type={item.isBooked ? "warning" : "success"}>
                        Status: {item.isBooked ? "Booked" : "Available"}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
};

export default TutorAvailability;