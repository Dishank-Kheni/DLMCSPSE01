import { Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import AuthService from '../../../services/authService';

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  code: Yup.string()
    .required('Verification code is required'),
  newpassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
});

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isResetting, setIsResetting] = useState(false);

  const initialEmail = location.state?.email || '';

  const initialValues = {
    email: initialEmail,
    code: '',
    newpassword: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsResetting(true);
    try {
      await AuthService.resetPassword(values.email, values.code, values.newpassword);
      toast.success('Password updated successfully');
      navigate('/signin');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <h3>Reset Password</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isValid, dirty }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="Enter email"
              />
              {errors.email && touched.email && (
                <small className="error">{errors.email}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <Field
                type="text"
                className="form-control"
                id="code"
                name="code"
                placeholder="Enter verification code"
              />
              {errors.code && touched.code && (
                <small className="error">{errors.code}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="newpassword">New Password</label>
              <Field
                type="password"
                className="form-control"
                id="newpassword"
                name="newpassword"
                placeholder="Enter new password"
              />
              {errors.newpassword && touched.newpassword && (
                <small className="error">{errors.newpassword}</small>
              )}
            </div>

            <center>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!(dirty && isValid) || isResetting}
              >
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </button>
            </center>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ResetPasswordForm;