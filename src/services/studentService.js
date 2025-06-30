import API from "../config/axios"

// =================== FUNCIONES PARA ESTUDIANTES ===================

// Obtener dashboard del estudiante
export const getDashboardData = async () => {
    try {
        const response = await API.get("/student/dashboard")
        return response.data
    } catch (error) {
        console.error("Error obteniendo datos del dashboard:", error)
        throw error
    }
}

// Obtener exámenes disponibles
export const getAvailableExams = async () => {
    try {
        const response = await API.get("/exams/available")
        return response.data
    } catch (error) {
        console.error("Error obteniendo exámenes disponibles:", error)
        throw error
    }
}

// Obtener mis reportes
export const getMyReports = async () => {
    try {
        const response = await API.get("/reports/my/reports")
        return response.data
    } catch (error) {
        console.error("Error obteniendo reportes:", error)
        throw error
    }
}

// Obtener mi último resultado
export const getLastResult = async () => {
    try {
        const response = await API.get("/student/last-result")
        return response.data
    } catch (error) {
        console.error("Error obteniendo último resultado:", error)
        return null
    }
}

// Generar reporte después del examen
export const generateReport = async (examResultId) => {
    try {
        const response = await API.post(`/reports/generate/${examResultId}`)
        return response.data
    } catch (error) {
        console.error("Error generando reporte:", error)
        throw error
    }
}

// Obtener reporte específico
export const getReport = async (reportId) => {
    try {
        const response = await API.get(`/reports/${reportId}`)
        return response.data
    } catch (error) {
        console.error("Error obteniendo reporte:", error)
        throw error
    }
}

// Obtener historial de exámenes
export const getExamHistory = async () => {
    try {
        const response = await API.get("/student/exam-history")
        return response.data
    } catch (error) {
        console.error("Error obteniendo historial:", error)
        throw error
    }
}

// Obtener estadísticas personales
export const getPersonalStats = async () => {
    try {
        const response = await API.get("/student/statistics")
        return response.data
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error)
        throw error
    }
}

// =================== FUNCIONES ADMINISTRATIVAS ===================

// Obtener todos los estudiantes (Admin)
export const getAllStudents = async (params = {}) => {
    try {
        const response = await API.get("/admin/students", { params })
        return response.data
    } catch (error) {
        console.error("Error obteniendo estudiantes:", error)
        throw error
    }
}

// Obtener estudiante por ID (Admin)
export const getStudentById = async (id) => {
    try {
        const response = await API.get(`/admin/students/${id}`)
        return response.data
    } catch (error) {
        console.error("Error obteniendo estudiante:", error)
        throw error
    }
}

// Crear nuevo estudiante (Admin)
export const createStudent = async (studentData) => {
    try {
        const response = await API.post("/admin/students", studentData)
        return response.data
    } catch (error) {
        console.error("Error creando estudiante:", error)
        throw error
    }
}

// Actualizar estudiante (Admin)
export const updateStudent = async (id, studentData) => {
    try {
        const response = await API.put(`/admin/students/${id}`, studentData)
        return response.data
    } catch (error) {
        console.error("Error actualizando estudiante:", error)
        throw error
    }
}

// Eliminar estudiante (Admin)
export const deleteStudent = async (id) => {
    try {
        const response = await API.delete(`/admin/students/${id}`)
        return response.data
    } catch (error) {
        console.error("Error eliminando estudiante:", error)
        throw error
    }
}

// Cambiar estado del estudiante (Admin) - FUNCIÓN CORREGIDA
export const toggleStudentStatus = async (id) => {
    try {
        const response = await API.patch(`/admin/students/${id}/toggle-status`)
        return response.data
    } catch (error) {
        console.error("Error cambiando estado:", error)
        throw error
    }
}

// Resetear contraseña del estudiante (Admin)
export const resetStudentPassword = async (id) => {
    try {
        const response = await API.post(`/admin/students/${id}/reset-password`)
        return response.data
    } catch (error) {
        console.error("Error reseteando contraseña:", error)
        throw error
    }
}

// Obtener estadísticas del estudiante (Admin)
export const getStudentStatistics = async (id) => {
    try {
        const response = await API.get(`/admin/students/${id}/statistics`)
        return response.data
    } catch (error) {
        console.error("Error obteniendo estadísticas:", error)
        throw error
    }
}

// Obtener historial de exámenes del estudiante (Admin)
export const getStudentExamHistory = async (id) => {
    try {
        const response = await API.get(`/admin/students/${id}/exam-history`)
        return response.data
    } catch (error) {
        console.error("Error obteniendo historial:", error)
        throw error
    }
}

// Exportar datos de estudiantes (Admin)
export const exportStudentsData = async (format = "csv") => {
    try {
        const response = await API.get(`/admin/students/export?format=${format}`, {
        responseType: "blob",
        })
        return response.data
    } catch (error) {
        console.error("Error exportando estudiantes:", error)
        throw error
    }
}

// Suspender estudiante (Admin)
export const suspendStudent = async (id, reason) => {
    try {
        const response = await API.patch(`/admin/students/${id}/suspend`, { reason })
        return response.data
    } catch (error) {
        console.error("Error suspendiendo estudiante:", error)
        throw error
    }
}

// Reactivar estudiante suspendido (Admin)
export const reactivateStudent = async (id) => {
    try {
        const response = await API.patch(`/admin/students/${id}/reactivate`)
        return response.data
    } catch (error) {
        console.error("Error reactivando estudiante:", error)
        throw error
    }
}