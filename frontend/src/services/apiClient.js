import axios from "axios";

const apiClient = axios.create({
    baseURL : process.env.REACT_APP_AUTH_URL,
    withCredentials: true,
    headers: {
        'Content-Type' : 'application/json'
    }
})

apiClient.interceptors.request.use((config)=>{
    const token = localStorage.getItem("jwt");
    if(token){
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
})

export default apiClient;