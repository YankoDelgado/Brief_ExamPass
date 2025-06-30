import axios from "axios"

//Configuración base de Axios
const API = axios.create({
    baseURL: "http://localhost:3000/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
})

//Interceptor para agregar el token automáticamente
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if(token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)

//Interceptor para manejar respuestas y errores
API.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        //Si el token expiró, redirigir al login
        if (error.response?.status === 401) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        window.location.href = "/login"
        }
        return Promise.reject(error)
    },
)

export default API