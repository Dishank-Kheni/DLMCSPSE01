// src/features/profile/components/TutorForm.js
import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useState } from 'react';
import CreatableSelect from 'react-select/creatable';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import profileService from '../services/profileService';

// Validation schema
const tutorSchema = Yup.object().shape({
  fieldExperience: Yup.number()
    .min(0, 'Experience must be at least 0 years')
    .required('Experience is required'),
  description: Yup.string()
    .required('Description is required')
});

const TutorForm = ({ tutorData }) => {
  const [skills, setSkills] = useState(
    tutorData.skills?.split(',').map(skill => ({
      value: skill,
      label: skill
    })) || []
  );

  const handleSubmit = async (values) => {
    try {
      // Format skills for API
      const skillsString = skills.map(skill => skill.value).join(',');
      
      await profileService.updateTutorProfile({
        userType: 'tutor',
        email: localStorage.getItem('username'),
        skills: skillsString,
        expyears: values.fieldExperience.toString(),
        expdesc: values.description
      });
      
      toast.success('Tutor profile updated successfully');
    } catch (error) {
      toast.error('Failed to update tutor profile');
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h5 className="mb-0">Tutor Information</h5>
      </div>
      <div className="card-body">
        <Formik
          initialValues={{
            fieldExperience: tutorData.expyears || 0,
            description: tutorData.expdesc || ''
          }}
          validationSchema={tutorSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <div className="form-group mb-3">
                <label htmlFor="skills">Skills</label>
                <CreatableSelect
                  isMulti
                  name="skills"
                  options={skills}
                  value={skills}
                  onChange={setSkills}
                  className="basic-multi-select"
                  classNamePrefix="select"
                  placeholder="Select or create skills..."
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="fieldExperience">Experience (years)</label>
                <Field
                  type="number"
                  name="fieldExperience"
                  className={`form-control ${errors.fieldExperience && touched.fieldExperience ? 'is-invalid' : ''}`}
                />
                <ErrorMessage
                  name="fieldExperience"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              <div className="form-group mb-3">
                <label htmlFor="description">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  className={`form-control ${errors.description && touched.description ? 'is-invalid' : ''}`}
                  rows="4"
                />
                <ErrorMessage
                  name="description"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Tutor Profile"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default TutorForm;