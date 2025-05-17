import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatePicker, TimePicker, Button, Typography, Space } from 'antd';
import moment from 'moment';
import { useAuth } from '../../../hooks/useAuth';
import tutorService from '../../../services/tutorService';
import '../styles/Tutor.css';

const { Title } = Typography;

const TutorAvailabilityForm = () => {
  const navigate = useNavigate();
  const { setProfileType } = useAuth();
  const [submitProcess, setSubmitProcess] = useState(false);
  const [requestError, setRequestError] = useState(false);
  const [requestData, setRequestData] = useState({
    id: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    setProfileType('tutor');
  }, [setProfileType]);

  const onChangeDate = (date, dateString) => {
    setRequestData(prev => ({ ...prev, date: dateString }));
  };

  const onChangeTime = (time, timeString) => {
    setRequestData(prev => ({
      ...prev,
      startTime: timeString[0],
      endTime: timeString[1],
    }));
  };

  const onSubmitHandle = async (e) => {
    e.preventDefault();
    
    const data = {
      ...requestData,
      id: localStorage.getItem('username'),
    };
    
    if (data.date && data.id && data.startTime && data.endTime) {
      setSubmitProcess(true);
      setRequestError(false);
      
      try {
        await tutorService.saveAvailability(data);
        navigate('availability');
      } catch (error) {
        console.error('Error saving availability:', error);
        setRequestError(true);
      } finally {
        setSubmitProcess(false);
      }
    } else {
      setRequestError(true);
    }
  };

  return (
    <>
      <form>
        <section style={{ textAlign: 'center' }}>
          <Title level={2}>Enter your availability</Title>
          <section>
            <Space direction="vertical" size={12}>
              <DatePicker
                disabledDate={(current) => {
                  return moment().add(-1, 'days') >= current ||
                    moment().add(1, 'month') <= current;
                }}
                format={'DD-MM-YYYY'}
                onChange={onChangeDate}
              />
            </Space>
            <TimePicker.RangePicker format={'HH:mm'} onChange={onChangeTime} />
          </section>
          <section style={{ marginTop: '2.5%' }}>
            <Button
              type="primary"
              htmlType="button"
              onClick={onSubmitHandle}
              loading={submitProcess}
            >
              Submit
            </Button>
            <Button
              style={{ marginLeft: '2.5%' }}
              type="primary"
              onClick={() => navigate('availability')}
            >
              See All Availabilities
            </Button>
          </section>
          {requestError && (
            <div className="error-message">
              Please fill in all required fields
            </div>
          )}
        </section>
      </form>
    </>
  );
};

export default TutorAvailabilityForm;