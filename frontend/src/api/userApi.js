import axios from 'axios';

const API_BASE_URL = '/api/users';

export const userApi = {
    getUserProfile: async (userId = null) => {
        const url = userId ? `${API_BASE_URL}/user-profile/${userId}` : `${API_BASE_URL}/user-profile`;
        const response = await axios.get(url);
        return response.data;
    },

};
