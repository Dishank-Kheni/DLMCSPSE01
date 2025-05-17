// src/features/profile/components/StudentForm.js
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import profileService from '../services/profileService';

// Validation schema
const studentSchema = Yup.object().shape({
  university: Yup.string()
    .required('University is required'),
  program: Yup.string()
    .required('Program is required'),
  startYear: Yup.number()
    .required('Start year is required')
    .min(1900, 'Invalid year'),
  endYear: Yup.number()
    .required('End year is required')
    .min(Yup.ref('startYear'), 'End year must be after start year')
});

const StudentForm = ({ studentData }) => {
  const [courses, setCourses] = useState(
    studentData.courses?.split(',').map(course => ({
      value: course,
      label: course
    })) || []
  );

  const handleSubmit = async (values) => {
    try {
      // Format courses for API
      const coursesString = courses.map(course => course.value).join(',');
      
      await profileService.updateStudentProfile({
        userType: 'student',
        email: localStorage.getItem('username'),
        university: values.university,
        program: values.program,
        courses: coursesString,
        startyear: values.startYear,
        endyear: values.endYear
      });
      
      toast.success('Student profile updated successfully');
    } catch (error) {
      toast.error('Failed to update student profile');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">Student Information</h5>
      </div>
      <div className="card-body">
        <Formik
          initialValues={{
            university: studentData.university || '',
            program: studentData.program || '',
            startYear: studentData.startyear || new Date().getFullYear(),
            endYear: studentData.endyear || new Date().getFullYear() + 4
          }}
          validationSchema={studentSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <div className="form-group mb-3">
                <label htmlFor="courses">Courses</label>
                <CreatableSelect
                  isMulti
                  name="courses"
                  options={courses}
                  value={courses}
                  onChange={setCourses}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select or create courses..."
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="university">University</label>
                <Field
                  type="text"
                  name="university"
                  className={`form-control ${errors.university && touched.university ? 'is-invalid' : ''}`}
                />
                <ErrorMessage
                  name="university"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="program">Program</label>
                <Field
                  type="text"
                  name="program"
                  className={`form-control ${errors.program && touched.program ? 'is-invalid' : ''}`}
                />
                <ErrorMessage
                  name="program"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="startYear">Start Year</label>
                    <Field
                      type="number"
                      name="startYear"
                      className={`form-control ${errors.startYear && touched.startYear ? 'is-invalid' : ''}`}
                    />
                    <ErrorMessage
                      name="startYear"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="form-group">
                    <label htmlFor="endYear">End Year</label>
                    <Field
                      type="number"
                      name="endYear"
                      className={`form-control ${errors.endYear && touched.endYear ? 'is-invalid' : ''}`}
                    />
                    <ErrorMessage
                      name="endYear"
                      component="div"
                      className="invalid-feedback"
                    />
                  </div>
                </div>
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Student Profile"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default StudentForm;