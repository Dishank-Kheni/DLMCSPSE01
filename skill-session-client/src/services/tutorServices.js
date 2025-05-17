import api from './api';

const TutorService = {
  // Save tutor availability
  saveAvailability: async (availabilityData) => {
    const response = await api.post('/save-availability', availabilityData);
    return response.data;
  },
  
  // Get tutor availability
  getAvailability: async (tutorId) => {
    const response = await api.get(`/get-availability?id=${tutorId}`);
    return response.data;
  },
  
  // Get tutor bookings
  getBookings: async (tutorId) => {
    const response = await api.post('/get-tutor-bookings', null, {
      params: { id: tutorId }
    });
    
    // Parse and transform booking data
    const bookings = response.data.Bookings || [];
    return bookings.map(booking => ({
      bookingId: booking.bookingId?.S,
      tutorId: booking.tutorId?.S,
      bookingStatus: booking.bookingstatus?.S,
      slotId: booking.slotId?.S,
      slotDate: booking.slotDate?.S,
      studentId: booking.studentId?.S,
      reqMadeOn: booking.reqMadeOn?.S,
      date: booking.slotDate?.S,
      startTime: booking.startTime?.S || "N/A",
      endTime: booking.endTime?.S || "N/A"
    }));
  },
  
  // Update booking status (confirm or reject)
  updateBookingStatus: async (bookingData) => {
    const response = await api.post('/updaterequest', bookingData);
    return response.data;
  },
  
  // Get all tutors or search by skills
  getTutors: async (skills = '') => {
    const data = skills ? { skills } : {};
    const response = await api.post('/get-user-details', data);
    return response.data.tutors || [];
  },
  
  // Get tutor slots
  getTutorSlots: async (tutorId) => {
    const response = await api.post('/getslotdetails', { userid: tutorId });
    return response.data;
  }
};

export default TutorService;