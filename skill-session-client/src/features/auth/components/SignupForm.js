import { Field, Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import AuthService from '../../../services/authService';

// Validation schema
const validationSchema = Yup.object().shape({
  firstname: Yup.string().required('First name is required'),
  lastname: Yup.string().required('Last name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  mobileno: Yup.string()
    .required('Mobile number is required')
    .matches(/^\+?[0-9]+$/, 'Invalid phone number format'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmpassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  userType: Yup.string().required('User type is required'),
});

const SignupForm = () => {
  const navigate = useNavigate();
  
  const initialValues = {
    firstname: '',
    lastname: '',
    email: '',
    mobileno: '',
    password: '',
    confirmpassword: '',
    userType: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await AuthService.signUp({
        email: values.email,
        password: values.password,
        firstName: values.firstname,
        lastName: values.lastname,
        mobileno: values.mobileno,
        userType: values.userType,
      });
      
      toast.success('Please check your email for verification code');
      navigate('/verifyaccount', { state: { email: values.email } });
    } catch (error) {
      toast.error(error.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-container">
      <h3>Sign Up</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isValid, dirty, handleChange, handleBlur }) => (
          <Form>
            <div className="form-group">
              <label htmlFor="firstname">First Name</label>
              <Field
                type="text"
                className="form-control"
                id="firstname"
                name="firstname"
                placeholder="Enter first name"
              />
              {errors.firstname && touched.firstname && (
                <small className="error">{errors.firstname}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Last Name</label>
              <Field
                type="text"
                className="form-control"
                id="lastname"
                name="lastname"
                placeholder="Enter last name"
              />
              {errors.lastname && touched.lastname && (
                <small className="error">{errors.lastname}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <Field
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="Enter email address"
              />
              {errors.email && touched.email && (
                <small className="error">{errors.email}</small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="mobileno">Mobile Number</label>
              <Field
                type="text"
                className="form-control"
                id="mobileno"
                name="mobileno"
                placeholder="Enter mobile number"
              />
              {errors.mobileno && touched.mobileno && (
                <small className="error">{errors.mobileno}</small>
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
              <label htmlFor="confirmpassword">Confirm Password</label>
              <Field
                type="password"
                className="form-control"
                id="confirmpassword"
                name="confirmpassword"
                placeholder="Confirm password"
              />
              {errors.confirmpassword && touched.confirmpassword && (
                <small className="error">{errors.confirmpassword}</small>
              )}
            </div>

            <div className="form-group">
              <label>I am a:</label>
              <div>
                <div className="form-check form-check-inline">
                  <Field
                    type="radio"
                    className="form-check-input"
                    id="tutor"
                    name="userType"
                    value="tutor"
                  />
                  <label className="form-check-label" htmlFor="tutor">
                    Tutor
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    type="radio"
                    className="form-check-input"
                    id="student"
                    name="userType"
                    value="student"
                  />
                  <label className="form-check-label" htmlFor="student">
                    Student
                  </label>
                </div>
                <div className="form-check form-check-inline">
                  <Field
                    type="radio"
                    className="form-check-input"
                    id="both"
                    name="userType"
                    value="tutor,student"
                  />
                  <label className="form-check-label" htmlFor="both">
                    Both
                  </label>
                </div>
              </div>
              {errors.userType && touched.userType && (
                <small className="error">{errors.userType}</small>
              )}
            </div>

            <center>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!(dirty && isValid)}
              >
                Sign Up
              </button>
            </center>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SignupForm;