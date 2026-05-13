import axios from 'axios';

const api = axios.create({
    baseURL: 'http://ximbapp.com:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;