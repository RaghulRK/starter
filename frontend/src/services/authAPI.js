import apiClient from "./apiClient";

export const handleAuthRequest = async (method, endpoint, data = {}, isFormData = false) => {
    try {
        const config = {
            validateStatus: () => true,
        };

        if (isFormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }
        const response = await apiClient[method](endpoint, data, config);
        return response.data; // success
    } catch (error) {
        // This catch only runs for actual network failures, not 4xx/5xx
        const status = error.response?.status || "Network Error";
        const message = error.response?.data?.message || error.message;
        console.log(`[${method.toUpperCase()} ${endpoint}] Network/Error (${status}): ${message}`);
    }
};

export const loginUser = (data) => handleAuthRequest("post", "/users/login", data);
export const registerUser = (data) => handleAuthRequest("post", "/users/signup", data, true);