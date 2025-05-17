import { Field, Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import AuthService from '../../../services/authService';

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
});

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialValues = {
    email: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsSubmitting(true);
    try {
      await AuthService.forgotPassword(values.email);
      toast.success('Reset password verification code sent to your email');
      navigate('/resetpassword', { state: { email: values.email } });
    } catch (error) {
      toast.error(error.message || 'Failed to send reset password email');
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <h3>Forgot Password</h3>
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

            <center>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!(dirty && isValid) || isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Reset Code'}
              </button>
            </center>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPasswordForm;