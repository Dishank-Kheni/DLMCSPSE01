import { Field, Form, Formik } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useAuth } from '../../../hooks/useAuth';

// Validation schema
const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required'),
});

const SigninForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const initialValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const success = await login(values.email, values.password);
      
      if (success) {
        toast.success('Login successful');
        navigate('/home');
      } else {
        toast.error('Login failed');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <h3>Sign In</h3>
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
              <label htmlFor="password">Password</label>
              <Field
                type="password"
                className="form-control"
                id="password"
                name="password"
                placeholder="Enter password"
              />
              {errors.password && touched.password && (
                <small className="error">{errors.password}</small>
              )}
            </div>

            <div className="form-group">
              <Link to="/forgetpassword">Forgot Password?</Link>
            </div>

            <center>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!(dirty && isValid)}
              >
                Sign In
              </button>
            </center>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SigninForm;