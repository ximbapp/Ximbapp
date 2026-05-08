import axios from 'axios';

const api = axios.create({
    baseURL: 'http://157.230.63.10:3000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

export default api;