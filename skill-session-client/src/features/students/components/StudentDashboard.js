import React, { useState, useEffect } from 'react';
import { Spin, Table, Typography, Tag, Space, Button, Input } from 'antd';
import { useNavigate } from 'react-router-dom';
import tutorService from '../../../services/tutorService';
import { useAuth } from '../../../hooks/useAuth';

const { Column, ColumnGroup } = Table;
const { Search } = Input;
const { Title } = Typography;

const StudentDashboard = () => {
  const [getProcess, setGetProcess] = useState(true);
  const [tutorData, setTutorData] = useState([]);
  const navigate = useNavigate();
  const { setProfileType } = useAuth();

  useEffect(() => {
    getTutorList();
    setProfileType('student');
  }, [setProfileType]);

  const getTutorList = async () => {
    setGetProcess(true);
    try {
      const tutors = await tutorService.getTutors();
      setTutorData(tutors);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setGetProcess(false);
    }
  };

  const onSearch = async (searchTerm) => {
    if (searchTerm !== '') {
      setGetProcess(true);
      try {
        const tutors = await tutorService.getTutors(searchTerm);
        setTutorData(tutors);
      } catch (error) {
        console.error('Error searching tutors:', error);
      } finally {
        setGetProcess(false);
      }
    }
  };

  return (
    <section>
      {getProcess ? (
        <Spin key="spin" size="large" />
      ) : (
        <section>
          <Search
            placeholder="Search Tutors by Skills"
            allowClear
            onSearch={onSearch}
            style={{ width: 304 }}
          />
          <Table dataSource={tutorData} key="table" rowKey="email">
            <ColumnGroup title="Name" key="name">
              <Column title="First Name" dataIndex="firstName" key="firstName" />
              <Column title="Last Name" dataIndex="lastName" key="lastName" />
            </ColumnGroup>
            <Column title="Experience Years" dataIndex="expyears" key="expyears" />
            <Column title="Description" dataIndex="expdesc" key="expdesc" />
            <Column
              title="Skills"
              dataIndex="skills"
              key="skills"
              render={(skills) => (
                <>
                  {skills.split(',').map((skill, key) => (
                    <Tag color="blue" key={key}>
                      {skill}
                    </Tag>
                  ))}
                </>
              )}
            />
            <Column
              key="action"
              render={(_, record) => (
                <Space size="middle">
                  <Button
                    onClick={() => {
                      navigate('../tutor/availability', { state: record.email });
                    }}
                    type="primary"
                  >
                    Book Session
                  </Button>
                </Space>
              )}
            />
          </Table>
        </section>
      )}
    </section>
  );
};

export default StudentDashboard;