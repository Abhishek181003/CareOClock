// frontend/src/api/alertApi.js
import axios from 'axios';

const API_BASE_URL = '/api/alerts';

export const alertApi = {
    getAlerts: async () => {
        const response = await axios.get(API_BASE_URL);
        return response.data;
    },

    createAlert: async (alertData) => {
        const response = await axios.post(API_BASE_URL, alertData);
        return response.data;
    }
};
