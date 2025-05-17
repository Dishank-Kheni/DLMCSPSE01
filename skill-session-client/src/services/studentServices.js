import api from './api';

const StudentService = {
  // Get pending booking slots
  getPendingBookingSlots: async (tutorId, studentId) => {
    const data = {
      tutorid: tutorId,
      studentid: studentId
    };
    
    const response = await api.post('/getbookingslotinpending', data);
    return response.data;
  },
  
  // Book a slot
  bookSlot: async (bookingData) => {
    const response = await api.post('/saveslot-booking', bookingData);
    return response.data;
  }
};

export default StudentService;