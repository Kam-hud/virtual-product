import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api', // 确保端口与后端一致
    timeout: 10000,
});

export default api;