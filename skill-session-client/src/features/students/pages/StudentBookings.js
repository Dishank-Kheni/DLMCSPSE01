// src/features/student/pages/StudentBookings.js
import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Space, Button, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import studentService from '../services/studentService';
import '../styles/StudentBookings.css';

const { Title, Text } = Typography;

const StudentBookings = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudentBookings(auth.username);
      
      // Process bookings from the response
      const bookingsData = response.Bookings || [];
      
      // Transform DynamoDB format to plain objects
      const transformedBookings = bookingsData.map(booking => ({
        bookingId: booking.bookingId?.S,
        tutorId: booking.tutorId?.S,
        bookingStatus: booking.bookingstatus?.S, // Note: API returns lowercase 'status'
        slotId: booking.slotId?.S,
        slotDate: booking.slotDate?.S,
        studentId: booking.studentId?.S,
        reqMadeOn: booking.reqMadeOn?.S,
        date: booking.slotDate?.S,
        startTime: booking.startTime?.S || "N/A",
        endTime: booking.endTime?.S || "N/A",
        tutorName: booking.tutorName?.S || "Unknown Tutor"
      }));
      
      setBookings(transformedBookings);
    } catch (error) {
      message.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRM':
        return 'green';
      case 'REJECT':
        return 'red';
      case 'PENDING':
        return 'orange';
      default:
        return 'blue';
    }
  };

  const columns = [
    {
      title: 'Tutor',
      dataIndex: 'tutorName',
      key: 'tutorName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => (
        <span>{record.startTime} - {record.endTime}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Requested On',
      dataIndex: 'reqMadeOn',
      key: 'reqMadeOn',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary"
            onClick={() => navigate(`/student/tutor/${record.tutorId}`)}
          >
            View Tutor
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="student-bookings-container">
      <div className="bookings-header">
        <Title level={2}>My Booking Requests</Title>
        <Button 
          onClick={() => navigate('/student')} 
          className="back-button"
        >
          Back to Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Loading your bookings...</Text>
        </div>
      ) : (
        <div className="bookings-table">
          <Table 
            dataSource={bookings} 
            columns={columns}
            rowKey="bookingId"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: "You haven't made any booking requests yet" }}
          />
        </div>
      )}

      <div className="bookings-actions">
        <Button 
          type="primary"
          size="large"
          onClick={() => navigate('/student/find-tutors')}
        >
          Find New Tutors
        </Button>
      </div>
    </div>
  );
};

export default StudentBookings;