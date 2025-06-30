import API from "../config/axios"

// =================== FUNCIONES PARA ESTUDIANTES ===================

// Obtener todos los estudiantes (Admin)
export const getAllStudents = async (params = {}) => {
    try {
        const response = await API.get("/admin/students", { params })
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al obtener estudiantes")
    }
}

// Obtener estudiante por ID
export const getStudentById = async (id) => {
    try {
        const response = await API.get(`/admin/students/${id}`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al obtener estudiante")
    }
}

// Crear nuevo estudiante
export const createStudent = async (studentData) => {
    try {
        const response = await API.post("/admin/students", studentData)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al crear estudiante")
    }
}

// Actualizar estudiante
export const updateStudent = async (id, studentData) => {
    try {
        const response = await API.put(`/admin/students/${id}`, studentData)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al actualizar estudiante")
    }
}

// Eliminar estudiante
export const deleteStudent = async (id) => {
    try {
        const response = await API.delete(`/admin/students/${id}`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al eliminar estudiante")
    }
}

// Cambiar estado del estudiante
export const toggleStudentStatus = async (id) => {
    try {
        const response = await API.patch(`/admin/students/${id}/toggle-status`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al cambiar estado")
    }
}

// Resetear contraseña del estudiante
export const resetStudentPassword = async (id) => {
    try {
        const response = await API.post(`/admin/students/${id}/reset-password`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al resetear contraseña")
    }
}

// Obtener historial de exámenes del estudiante
export const getStudentExamHistory = async (id) => {
    try {
        const response = await API.get(`/admin/students/${id}/exam-history`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al obtener historial")
    }
}

// Obtener estadísticas del estudiante
export const getStudentStatistics = async (id) => {
    try {
        const response = await API.get(`/admin/students/${id}/statistics`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al obtener estadísticas")
    }
}

// Exportar datos de estudiantes
export const exportStudentsData = async (format = "csv") => {
    try {
        const response = await API.get(`/admin/students/export?format=${format}`, {
        responseType: "blob",
        })
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al exportar datos")
    }
    }

// =================== FUNCIONES PARA ESTUDIANTE (LADO CLIENTE) ===================

// Obtener perfil del estudiante actual
export const getStudentProfile = async () => {
    try {
        const response = await API.get("/student/profile")
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al obtener perfil")
    }
    }

// Actualizar perfil del estudiante
export const updateStudentProfile = async (profileData) => {
    try {
        const response = await API.put("/student/profile", profileData)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al actualizar perfil")
    }
}

// Obtener exámenes disponibles para el estudiante
export const getAvailableExams = async () => {
    try {
        const response = await API.get("/student/exams/available")
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al obtener exámenes")
    }
}

// Obtener reportes del estudiante
export const getStudentReports = async () => {
    try {
        const response = await API.get("/student/reports")
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al obtener reportes")
    }
}

// Obtener reporte específico del estudiante
export const getStudentReport = async (reportId) => {
    try {
        const response = await API.get(`/student/reports/${reportId}`)
        return response.data
    } catch (error) {
        throw new Error(error.response?.data?.error || "Error al obtener reporte")
    }
}
