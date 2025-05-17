import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, List, Spin, Typography } from 'antd';
import tutorService from '../../../services/tutorService';
import studentService from '../../../services/studentService';
import { useAuth } from '../../../hooks/useAuth';

const { Title } = Typography;

const TutorAvailabilityList = () => {
  const [availability, setAvailability] = useState([]);
  const [getProcess, setGetProcess] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, setProfileType } = useAuth();

  // Get the tutor ID from the location state or use the current user's ID
  const userId = location.state || localStorage.getItem('username');
  const loginUser = localStorage.getItem('username');

  useEffect(() => {
    getAvailability();
    
    // Set profile type based on the current user
    if (userId === loginUser) {
      setProfileType('tutor');
    } else {
      setProfileType('student');
    }
  }, [userId, loginUser, setProfileType]);

  const getAvailability = async () => {
    setGetProcess(true);
    try {
      const data = await tutorService.getAvailability(userId);
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setGetProcess(false);
    }
  };

  const bookAppointment = async (slotId, slotDate) => {
    setGetProcess(true);
    try {
      const data = {
        tutorid: userId,
        studentid: loginUser,
        slotid: slotId.S,
        slotDate: slotDate
      };
      
      const response = await studentService.bookSlot(data);
      
      if (response.slotBooked) {
        getAvailability();
      } else {
        console.log('Slot has not been booked');
      }
    } catch (error) {
      console.error('Error booking slot:', error);
    } finally {
      setGetProcess(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <section>
      <Button type="primary" onClick={goBack}>
        Go Back
      </Button>
      
      {getProcess ? (
        <Spin size="large" />
      ) : (
        <List
          header={
            <List.Item>
              <Title level={5}>Date</Title>
              <Title level={5}>Start Time</Title>
              <Title level={5}>End Time</Title>
              <Title level={5}>Status</Title>
              <Title level={5} />
            </List.Item>
          }
          itemLayout="horizontal"
          dataSource={availability}
          renderItem={item => (
            <List.Item>
              <Title level={5}>{item?.date.S}</Title>
              <Title level={5}>{item?.startTime.S}</Title>
              <Title level={5}>{item?.endTime.S}</Title>
              <Title level={5}>{item?.slotstatus.S}</Title>
              {auth.profileType === 'student' ? (
                <Button
                  onClick={() => bookAppointment(item?.id, item?.date.S)}
                  type="primary"
                >
                  Book Now
                </Button>
              ) : (
                <div />
              )}
            </List.Item>
          )}
        />
      )}
    </section>
  );
};

export default TutorAvailabilityList;