// src/features/student/pages/TutorList.js
import { UserOutlined } from '@ant-design/icons';
import { Button, Card, Col, Input, Rate, Row, Select, Spin, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import studentService from '../services/studentService';
import '../styles/TutorList.css';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const TutorList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tutors, setTutors] = useState([]);
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [allSkills, setAllSkills] = useState([]);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await studentService.getTutorList();
      const tutorList = response.tutors || [];
      
      // Extract all unique skills
      const skillsSet = new Set();
      tutorList.forEach(tutor => {
        const skills = tutor.skills?.split(',') || [];
        skills.forEach(skill => skillsSet.add(skill.trim()));
      });
      
      setAllSkills(Array.from(skillsSet));
      setTutors(tutorList);
      setFilteredTutors(tutorList);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    filterTutors(value, selectedSkill);
  };

  const handleSkillFilter = (value) => {
    setSelectedSkill(value);
    filterTutors(searchValue, value);
  };

  const filterTutors = (search, skill) => {
    let filtered = [...tutors];
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(tutor => 
        tutor.firstName?.toLowerCase().includes(searchLower) ||
        tutor.lastName?.toLowerCase().includes(searchLower) ||
        tutor.expdesc?.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by skill
    if (skill) {
      filtered = filtered.filter(tutor => 
        tutor.skills?.split(',').some(s => s.trim().toLowerCase() === skill.toLowerCase())
      );
    }
    
    setFilteredTutors(filtered);
  };

  const handleViewTutor = (tutorId) => {
    navigate(`/student/tutor/${tutorId}`);
  };

  return (
    <div className="tutor-list-container">
      <div className="tutor-list-header">
        <Title level={2}>Find a Tutor</Title>
        <Paragraph>Browse through our qualified tutors and find the perfect match for your learning needs.</Paragraph>
      </div>

      <div className="tutor-list-filters">
        <Row gutter={16} align="middle">
          <Col xs={24} md={12} lg={10}>
            <Search
              placeholder="Search tutors by name or description"
              allowClear
              enterButton="Search"
              size="large"
              onSearch={handleSearch}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Select
              placeholder="Filter by skill"
              style={{ width: '100%' }}
              onChange={handleSkillFilter}
              allowClear
              size="large"
            >
              {allSkills.map(skill => (
                <Option key={skill} value={skill}>{skill}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} lg={8} className="reset-filter">
            <Button 
              onClick={() => {
                setSearchValue('');
                setSelectedSkill('');
                setFilteredTutors(tutors);
              }}
            >
              Reset Filters
            </Button>
          </Col>
        </Row>
      </div>

      <div className="tutor-list-results">
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
            <Text>Loading tutors...</Text>
          </div>
        ) : (
          <>
            <Title level={4}>
              {filteredTutors.length} {filteredTutors.length === 1 ? 'Tutor' : 'Tutors'} Found
            </Title>
            
            <Row gutter={[24, 24]}>
              {filteredTutors.map(tutor => (
                <Col xs={24} md={12} lg={8} key={tutor.email}>
                  <Card 
                    className="tutor-card"
                    hoverable
                    onClick={() => handleViewTutor(tutor.email)}
                  >
                    <div className="tutor-card-header">
                      <img 
                        src={tutor.profileImage || "https://via.placeholder.com/80"} 
                        alt={`${tutor.firstName} ${tutor.lastName}`}
                        className="tutor-avatar"
                      />
                      <div className="tutor-info">
                        <Title level={5}>{tutor.firstName} {tutor.lastName}</Title>
                        <Rate disabled defaultValue={4.5} />
                      </div>
                    </div>
                    
                    <div className="tutor-card-body">
                      <Paragraph className="tutor-description" ellipsis={{ rows: 2 }}>
                        {tutor.expdesc || "No description provided."}
                      </Paragraph>
                      
                      <div className="tutor-experience">
                        <Text><UserOutlined /> Experience: {tutor.expyears || 0} years</Text>
                      </div>
                      
                      <div className="tutor-skills">
                        {tutor.skills?.split(',').map(skill => (
                          <Tag color="blue" key={skill}>
                            {skill.trim()}
                          </Tag>
                        ))}
                      </div>
                    </div>
                    
                    <div className="tutor-card-footer">
                      <Button type="primary" block>
                        View Profile
                      </Button>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
            
            {filteredTutors.length === 0 && (
              <div className="no-results">
                <Title level={4}>No tutors found matching your criteria</Title>
                <Paragraph>Try adjusting your filters or search term</Paragraph>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TutorList;