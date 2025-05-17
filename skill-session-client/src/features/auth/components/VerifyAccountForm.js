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
});

const VerifyAccountForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const initialEmail = location.state?.email || '';

  const initialValues = {
    email: initialEmail,
    code: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsVerifying(true);
    try {
      await AuthService.verifyAccount(values.email, values.code);
      toast.success('Account verified successfully');
      navigate('/signin');
    } catch (error) {
      toast.error(error.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
      setSubmitting(false);
    }
  };

  const handleResendCode = async (email) => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      await AuthService.resendConfirmationCode(email);
      toast.success('Verification code resent successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="signup-container">
      <h3>Verify Account</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isValid, dirty }) => (
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
              <button
                type="button"
                className="btn btn-link"
                onClick={() => handleResendCode(values.email)}
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Resend Code'}
              </button>
            </div>

            <center>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!(dirty && isValid) || isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify Account'}
              </button>
            </center>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default VerifyAccountForm;