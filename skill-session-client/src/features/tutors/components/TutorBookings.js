import React, { useState, useEffect } from 'react';
import { Spin, Table, Tag, Tooltip, Typography, message } from 'antd';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import tutorService from '../../../services/tutorService';
import { useAuth } from '../../../hooks/useAuth';

const { Column } = Table;
const { Title } = Typography;

const TutorBookings = () => {
  const [rejectedBookings, setRejectedBookings] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [confirmBookings, setConfirmBookings] = useState([]);
  const [getProcess, setGetProcess] = useState(true);
  const { setProfileType } = useAuth();

  useEffect(() => {
    setProfileType('tutor');
    loadBookings();
  }, [setProfileType]);

  const loadBookings = async () => {
    try {
      const tutorId = localStorage.getItem('username');
      
      // Get all bookings for this tutor
      const bookings = await tutorService.getBookings(tutorId);
      
      // Categorize bookings by status
      const confirmed = [];
      const pending = [];
      const rejected = [];
      
      bookings.forEach(booking => {
        if (booking.bookingStatus === 'REJECT') {
          rejected.push(booking);
        } else if (booking.bookingStatus === 'CONFIRM') {
          confirmed.push(booking);
        } else if (booking.bookingStatus === 'PENDING') {
          pending.push(booking);
        }
      });
      
      setConfirmBookings(confirmed);
      setPendingBookings(pending);
      setRejectedBookings(rejected);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setGetProcess(false);
    }
  };

  const confirmBooking = async (record) => {
    setGetProcess(true);
    
    const data = {
      bookingId: record.bookingId,
      tutorId: localStorage.getItem('username'),
      studentId: record.studentId,
      slotId: record.slotId,
      action: 'CONFIRM',
    };
    
    try {
      await tutorService.updateBookingStatus(data);
      message.success('Booking CONFIRMED');
      loadBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
    } finally {
      setGetProcess(false);
    }
  };

  const rejectBooking = async (record) => {
    setGetProcess(true);
    
    const data = {
      bookingId: record.bookingId,
      tutorId: localStorage.getItem('username'),
      studentId: record.studentId,
      slotId: record.slotId,
      action: 'REJECT',
    };
    
    try {
      await tutorService.updateBookingStatus(data);
      message.success('Booking REJECTED');
      loadBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
    } finally {
      setGetProcess(false);
    }
  };

  return (
    <section>
      {getProcess ? (
        <Spin size="large" />
      ) : (
        <div>
          <Title level={3}>Pending Bookings</Title>
          <Table dataSource={pendingBookings} key="pendingtable">
            <Column title="Student Name" dataIndex="studentId" key="studentId" />
            <Column
              title="Booking Status"
              dataIndex="bookingStatus"
              key="bookingStatus"
              render={(bookingStatus) => (
                <Tag color="yellow">{bookingStatus}</Tag>
              )}
            />
            <Column title="Date" dataIndex="date" key="date" />
            <Column title="Start Time" dataIndex="startTime" key="startTime" />
            <Column title="End Time" dataIndex="endTime" key="endTime" />
            <Column
              key="action"
              render={(_, record) => (
                <>
                  <Tooltip title="confirm">
                    <CheckCircleTwoTone
                      onClick={() => confirmBooking(record)}
                      style={{ fontSize: '150%' }}
                      twoToneColor="#52c41a"
                    />
                  </Tooltip>
                  <Tooltip title="reject">
                    <CloseCircleTwoTone
                      onClick={() => rejectBooking(record)}
                      style={{ fontSize: '150%', marginLeft: '15%' }}
                      twoToneColor="#d90909"
                    />
                  </Tooltip>
                </>
              )}
            />
          </Table>

          <Title level={3}>Rejected Bookings</Title>
          <Table dataSource={rejectedBookings} key="rejecttable">
            <Column title="Student Name" dataIndex="studentId" key="studentId" />
            <Column
              title="Booking Status"
              dataIndex="bookingStatus"
              key="bookingStatus"
              render={(bookingStatus) => (
                <Tag color="red">{bookingStatus}</Tag>
              )}
            />
            <Column title="Date" dataIndex="date" key="date" />
            <Column title="Start Time" dataIndex="startTime" key="startTime" />
            <Column title="End Time" dataIndex="endTime" key="endTime" />
          </Table>

          <Title level={3}>Confirmed Bookings</Title>
          <Table dataSource={confirmBookings} key="confirmTable">
            <Column title="Student Name" dataIndex="studentId" key="studentId" />
            <Column
              title="Booking Status"
              dataIndex="bookingStatus"
              key="bookingStatus"
              render={(bookingStatus) => (
                <Tag color="green">{bookingStatus}</Tag>
              )}
            />
            <Column title="Date" dataIndex="date" key="date" />
            <Column title="Start Time" dataIndex="startTime" key="startTime" />
            <Column title="End Time" dataIndex="endTime" key="endTime" />
          </Table>
        </div>
      )}
    </section>
  );
};

export default TutorBookings;