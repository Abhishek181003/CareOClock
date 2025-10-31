// frontend/src/api/appointmentApi.js
import axios from 'axios';

const API_BASE_URL = '/api/appointments';

export const appointmentApi = {
    getAppointments: async (upcoming = true, days = 30) => {
        const response = await axios.get(API_BASE_URL, {
            params: { upcoming, days }
        });
        return response.data;
    },

    createAppointment: async (appointmentData) => {
        const response = await axios.post(API_BASE_URL, appointmentData);
        return response.data;
    },

    updateAppointment: async (appointmentId, appointmentData) => {
        const response = await axios.patch(`${API_BASE_URL}/${appointmentId}`, appointmentData);
        return response.data;
    },

    deleteAppointment: async (appointmentId) => {
        const response = await axios.delete(`${API_BASE_URL}/${appointmentId}`);
        return response.data;
    }
};
