import axios from "../config/axios"

// Obtener todos los estudiantes (Admin)
export const getAllStudents = async (params = {}) => {
    try {
        const response = await axios.get("/admin/students", { params })
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Obtener estudiante por ID (Admin)
export const getStudentById = async (id) => {
    try {
        const response = await axios.get(`/admin/students/${id}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Crear nuevo estudiante (Admin)
export const createStudent = async (studentData) => {
    try {
        const response = await axios.post("/admin/students", studentData)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Actualizar estudiante (Admin)
export const updateStudent = async (id, studentData) => {
    try {
        const response = await axios.put(`/admin/students/${id}`, studentData)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Eliminar estudiante (Admin)
export const deleteStudent = async (id) => {
    try {
        const response = await axios.delete(`/admin/students/${id}`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Activar/Desactivar estudiante
export const toggleStudentStatus = async (id) => {
    try {
        const response = await axios.patch(`/admin/students/${id}/toggle-status`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
    }

// Resetear contraseña de estudiante
export const resetStudentPassword = async (id) => {
    try {
        const response = await axios.patch(`/admin/students/${id}/reset-password`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Obtener estadísticas de estudiante
export const getStudentStats = async (id) => {
    try {
        const response = await axios.get(`/admin/students/${id}/stats`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Obtener historial de exámenes de estudiante
export const getStudentExamHistory = async (id) => {
    try {
        const response = await axios.get(`/admin/students/${id}/exam-history`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Exportar datos de estudiantes
export const exportStudentsData = async (format = "csv") => {
    try {
        const response = await axios.get(`/admin/students/export?format=${format}`, {
        responseType: "blob",
        })
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Suspender estudiante
export const suspendStudent = async (id, reason) => {
    try {
        const response = await axios.patch(`/admin/students/${id}/suspend`, { reason })
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}

// Reactivar estudiante suspendido
export const reactivateStudent = async (id) => {
    try {
        const response = await axios.patch(`/admin/students/${id}/reactivate`)
        return response.data
    } catch (error) {
        throw error.response?.data || error.message
    }
}