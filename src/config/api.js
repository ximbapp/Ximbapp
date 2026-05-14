import axios from 'axios';

const api = axios.create({
    baseURL: 'https://ximbapp.com/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;