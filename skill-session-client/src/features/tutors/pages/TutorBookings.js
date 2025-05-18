// src/features/tutor/pages/TutorBookings.js
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { Spin, Table, Tag, Tooltip, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import tutorService from '../services/tutorService';
import '../styles/TutorBookings.css';

const { Title } = Typography;

const TutorBookings = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [rejectedBookings, setRejectedBookings] = useState([]);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await tutorService.getBookings(auth.username);
      
      // Process bookings from the response
      const bookings = response.Bookings || [];
      
      // Transform DynamoDB format to plain objects and categorize by status
      const transformedBookings = bookings.map(booking => ({
        bookingId: booking.bookingId?.S,
        tutorId: booking.tutorId?.S,
        bookingStatus: booking.bookingstatus?.S, // Note: API returns lowercase 'status'
        slotId: booking.slotId?.S,
        slotDate: booking.slotDate?.S,
        studentId: booking.studentId?.S,
        reqMadeOn: booking.reqMadeOn?.S,
        date: booking.slotDate?.S,
        startTime: booking.startTime?.S || "N/A",
        endTime: booking.endTime?.S || "N/A"
      }));
      
      // Categorize bookings
      setPendingBookings(transformedBookings.filter(b => b.bookingStatus === 'PENDING'));
      setConfirmedBookings(transformedBookings.filter(b => b.bookingStatus === 'CONFIRM'));
      setRejectedBookings(transformedBookings.filter(b => b.bookingStatus === 'REJECT'));
    } catch (error) {
      message.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async (record) => {
    try {
      setLoading(true);
      await tutorService.updateBookingStatus({
        bookingId: record.bookingId,
        tutorId: auth.username,
        studentId: record.studentId,
        slotId: record.slotId,
        action: 'CONFIRM'
      });
      
      message.success('Booking confirmed');
      loadBookings();
    } catch (error) {
      message.error('Failed to confirm booking');
      setLoading(false);
    }
  };

  const handleRejectBooking = async (record) => {
    try {
      setLoading(true);
      await tutorService.updateBookingStatus({
        bookingId: record.bookingId,
        tutorId: auth.username,
        studentId: record.studentId,
        slotId: record.slotId,
        action: 'REJECT'
      });
      
      message.success('Booking rejected');
      loadBookings();
    } catch (error) {
      message.error('Failed to reject booking');
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: 'Student Email',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: 'Booking Status',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (status) => {
        let color = 'blue';
        if (status === 'CONFIRM') color = 'green';
        if (status === 'REJECT') color = 'red';
        if (status === 'PENDING') color = 'orange';
        
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
    }
  ];

  // Add action column for pending bookings
  const pendingColumns = [
    ...columns,
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <>
          <Tooltip title="Confirm">
            <CheckCircleTwoTone 
              onClick={() => handleConfirmBooking(record)} 
              style={{ fontSize: '150%', cursor: 'pointer' }} 
              twoToneColor="#52c41a" 
            />
          </Tooltip>
          <Tooltip title="Reject">
            <CloseCircleTwoTone 
              onClick={() => handleRejectBooking(record)} 
              style={{ fontSize: '150%', marginLeft: '15%', cursor: 'pointer' }} 
              twoToneColor="#d90909" 
            />
          </Tooltip>
        </>
      )
    }
  ];

  return (
    <div className="bookings-container">
      <div className="bookings-header">
        <Title level={2}>Booking Requests</Title>
        <Button onClick={() => navigate('/tutor')} className="back-button">
          Back to Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading bookings...</p>
        </div>
      ) : (
        <div className="bookings-content">
          <div className="booking-section">
            <Title level={3}>Pending Bookings</Title>
            <Table 
              dataSource={pendingBookings} 
              columns={pendingColumns}
              rowKey="bookingId"
              locale={{ emptyText: "No pending booking requests" }}
            />
          </div>
          
          <div className="booking-section">
            <Title level={3}>Confirmed Bookings</Title>
            <Table 
              dataSource={confirmedBookings} 
              columns={columns}
              rowKey="bookingId"
              locale={{ emptyText: "No confirmed bookings" }}
            />
          </div>
          
          <div className="booking-section">
            <Title level={3}>Rejected Bookings</Title>
            <Table 
              dataSource={rejectedBookings} 
              columns={columns}
              rowKey="bookingId"
              locale={{ emptyText: "No rejected bookings" }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorBookings;