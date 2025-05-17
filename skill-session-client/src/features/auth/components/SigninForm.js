// src/features/auth/components/SignInForm.js
import { Field, Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useAuth } from '../../../context/AuthContext';
import { authService } from '../services/authService';

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const SignInForm = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await authService.signIn(values.email, values.password);
      
      setAuth({
        isAuthenticated: true,
        username: result.getIdToken().payload.email,
        firstName: result.getIdToken().payload.given_name,
        lastName: result.getIdToken().payload.family_name,
        mobileNo: result.getIdToken().payload.phone_number,
        userType: result.getIdToken().payload['custom:userType'],
        isTutor: result.getIdToken().payload['custom:userType'].includes('tutor'),
        isStudent: result.getIdToken().payload['custom:userType'].includes('student'),
        profileType: result.getIdToken().payload['custom:userType'].includes('tutor') 
          ? 'tutor' : 'student'
      });
      
      toast.success('Successfully signed in!');
      navigate('/home');
    } catch (error) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Sign In</h2>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, errors, touched }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field
                type="email"
                name="email"
                className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && touched.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <Field
                type="password"
                name="password"
                className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
              />
              {errors.password && touched.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
            </div>

            <div className="form-group mt-3 text-center">
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
            
            <div className="mt-3 text-center">
              <p>
                <a href="/forgetpassword">Forgot password?</a>
              </p>
              <p>
                Don't have an account? <a href="/signup">Sign up</a>
              </p>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignInForm;