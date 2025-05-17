// src/App.js
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Layout Components
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';

// Route Guards
import PrivateRoute from './components/common/PrivateRoute';
import PublicRoute from './components/common/PublicRoute';

// Auth Feature
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import SignIn from './features/auth/pages/SignIn';
import SignUp from './features/auth/pages/SignUp';
import VerifyAccount from './features/auth/pages/VerifyAccount';

// Main Features
import Dashboard from './features/dashboard/pages/Dashboard';
import Home from './features/home/pages/Home';
import Profile from './features/profile/pages/Profile';
import StudentDashboard from './features/student/pages/StudentDashboard';
import TutorAvailability from './features/tutor/pages/TutorAvailability';
import TutorBookings from './features/tutor/pages/TutorBookings';
import TutorDashboard from './features/tutor/pages/TutorDashboard';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Header />
        <main className="container">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<PublicRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="signin" element={<SignIn />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="verifyaccount" element={<VerifyAccount />} />
              <Route path="forgetpassword" element={<ForgotPassword />} />
              <Route path="resetpassword" element={<ResetPassword />} />
            </Route>
            
            {/* Protected Routes */}
            <Route path="/" element={<PrivateRoute />}>
              <Route path="home" element={<Home />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Tutor Routes */}
              <Route path="tutor" element={<TutorDashboard />} />
              <Route path="tutor/availability" element={<TutorAvailability />} />
              <Route path="tutor/bookings" element={<TutorBookings />} />
              
              {/* Student Routes */}
              <Route path="student" element={<StudentDashboard />} />
              
              {/* Fallback route */}
              <Route path="*" element={<Navigate to="/home" />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;