// frontend/src/api/medicineApi.js
import axios from 'axios';

const API_BASE_URL = '/api/medicines';

export const medicineApi = {
    getMedicines: async (userId = null) => {
        const url = userId ? `${API_BASE_URL}/${userId}` : API_BASE_URL;
        const response = await axios.get(url);
        return response.data;
    },

    createMedicine: async (medicineData, userId = null) => {
        const url = userId ? `${API_BASE_URL}/${userId}` : API_BASE_URL;
        const response = await axios.post(url, medicineData);
        return response.data;
    },

    updateMedicine: async (medicineId, medicineData) => {
        const response = await axios.patch(`${API_BASE_URL}/${medicineId}`, medicineData);
        return response.data;
    },

    deleteMedicine: async (medicineId) => {
        const response = await axios.delete(`${API_BASE_URL}/${medicineId}`);
        return response.data;
    },

    getLowStockMedicines: async (userId = null) => {
        const url = userId ? `${API_BASE_URL}/low-stock/${userId}` : `${API_BASE_URL}/low-stock`;
        const response = await axios.get(url);
        return response.data;
    }
};
