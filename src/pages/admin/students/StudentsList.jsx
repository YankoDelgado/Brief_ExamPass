import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Container, Row, Col, Card, Table, Button, Form, Badge, Spinner, Alert, Modal } from "react-bootstrap"
import {getAllStudents,deleteStudent,toggleStudentStatus,exportStudentsData,resetStudentPassword} from "../../../services/studentService"

const StudentsList = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [studentToDelete, setStudentToDelete] = useState(null)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {loadStudents()}, [currentPage, searchTerm, statusFilter])

    const loadStudents = async () => {
        try {
            setLoading(true)
            const params = {
                page: currentPage,
                limit: 10,
                search: searchTerm,
                status: statusFilter !== "all" ? statusFilter : undefined,
            }

            const response = await getAllStudents(params)
            setStudents(response.students || [])
            setTotalPages(response.totalPages || 1)
            setError("")
        } catch (err) {
            setError(err.message || "Error al cargar estudiantes")
            setStudents([])
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleStatusFilter = (e) => {
        setStatusFilter(e.target.value)
        setCurrentPage(1)
    }

    const handleDeleteClick = (student) => {
        setStudentToDelete(student)
        setShowDeleteModal(true)
    }

    const handleDeleteConfirm = async () => {
        if (!studentToDelete) return

        try {
            setActionLoading(true)
            await deleteStudent(studentToDelete.id)
            setShowDeleteModal(false)
            setStudentToDelete(null)
            loadStudents()
        } catch (err) {
            setError(err.message || "Error al eliminar estudiante")
        } finally {
            setActionLoading(false)
        }
    }

    const handleToggleStatus = async (studentId) => {
        try {
            setActionLoading(true)
            await toggleStudentStatus(studentId)
            loadStudents()
        } catch (err) {
            setError(err.message || "Error al cambiar estado del estudiante")
        } finally {
            setActionLoading(false)
        }
    }

    const handleResetPassword = async (studentId) => {
        if (!window.confirm("¿Estás seguro de que quieres resetear la contraseña de este estudiante?")) {
            return
        }

        try {
            setActionLoading(true)
            const response = await resetStudentPassword(studentId)
            alert(`Nueva contraseña: ${response.newPassword}`)
        } catch (err) {
            setError(err.message || "Error al resetear contraseña")
        } finally {
            setActionLoading(false)
        }
    }

    const handleExport = async (format) => {
        try {
            setActionLoading(true)
            const blob = await exportStudentsData(format)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `estudiantes.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (err) {
            setError(err.message || "Error al exportar datos")
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusVariant = (status) => {
        switch (status) {
            case "active":
                return "success"
            case "inactive":
                return "secondary"
            case "suspended":
                return "warning"
            default:
                return "secondary"
        }
    }

    const getStatusText = (status) => {
        switch (status) {
            case "active":
                return "Activo"
            case "inactive":
                return "Inactivo"
            case "suspended":
                return "Suspendido"
            default:
                return "Desconocido"
        }
    }

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
                <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </Container>
        )
    }

    return (
        <Container fluid>
        <Row className="mb-4">
            <Col>
            <div className="d-flex justify-content-between align-items-center">
                <div>
                <h2 className="mb-1">Gestión de Estudiantes</h2>
                <p className="text-muted">Administra todos los estudiantes del sistema</p>
                </div>
                <div className="d-flex gap-2">
                <Button variant="success" onClick={() => handleExport("csv")} disabled={actionLoading}>
                    📊 Exportar CSV
                </Button>
                <Button variant="info" onClick={() => handleExport("pdf")} disabled={actionLoading}>
                    📄 Exportar PDF
                </Button>
                <Button as={Link} to="/admin/students/create" variant="primary">
                    ➕ Nuevo Estudiante
                </Button>
                </div>
            </div>
            </Col>
        </Row>

        {/* Filtros */}
        <Row className="mb-4">
            <Col md={6}>
            <Form.Group>
                <Form.Label>Buscar estudiante</Form.Label>
                <Form.Control
                type="text"
                placeholder="Nombre, email o código..."
                value={searchTerm}
                onChange={handleSearch}
                />
            </Form.Group>
            </Col>
            <Col md={4}>
            <Form.Group>
                <Form.Label>Estado</Form.Label>
                <Form.Select value={statusFilter} onChange={handleStatusFilter}>
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
                <option value="suspended">Suspendidos</option>
                </Form.Select>
            </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
            <Button
                variant="outline-secondary"
                onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setCurrentPage(1)
                }}
            >
                🔄 Limpiar
            </Button>
            </Col>
        </Row>

        {/* Error Message */}
        {error && (
            <Row className="mb-4">
            <Col>
                <Alert variant="danger">{error}</Alert>
            </Col>
            </Row>
        )}

        {/* Tabla de estudiantes */}
        <Row>
            <Col>
            <Card>
                <Card.Body>
                {students.length === 0 ? (
                    <div className="text-center py-5">
                    <div style={{ fontSize: "4rem" }}>👥</div>
                    <h4>No se encontraron estudiantes</h4>
                    <p className="text-muted">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                ) : (
                    <Table responsive hover>
                    <thead>
                        <tr>
                        <th>Estudiante</th>
                        <th>Contacto</th>
                        <th>Estado</th>
                        <th>Estadísticas</th>
                        <th>Registro</th>
                        <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                        <tr key={student.id}>
                            <td>
                            <div className="d-flex align-items-center">
                                <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                                style={{ width: "40px", height: "40px" }}
                                >
                                <strong>
                                    {student.firstName?.charAt(0)}
                                    {student.lastName?.charAt(0)}
                                </strong>
                                </div>
                                <div>
                                <div className="fw-bold">
                                    {student.firstName} {student.lastName}
                                </div>
                                <small className="text-muted">ID: {student.studentCode || student.id}</small>
                                </div>
                            </div>
                            </td>
                            <td>
                            <div>{student.email}</div>
                            <small className="text-muted">{student.phone || "Sin teléfono"}</small>
                            </td>
                            <td>
                            <Badge bg={getStatusVariant(student.status)}>{getStatusText(student.status)}</Badge>
                            </td>
                            <td>
                            <div>Exámenes: {student.totalExams || 0}</div>
                            <small className="text-muted">Promedio: {student.averageScore || 0}%</small>
                            </td>
                            <td>
                            <small>{new Date(student.createdAt).toLocaleDateString()}</small>
                            </td>
                            <td>
                            <div className="d-flex justify-content-center gap-1">
                                <Button
                                as={Link}
                                to={`/admin/students/${student.id}`}
                                variant="outline-primary"
                                size="sm"
                                title="Ver detalles"
                                >
                                👁️
                                </Button>
                                <Button
                                as={Link}
                                to={`/admin/students/${student.id}/edit`}
                                variant="outline-success"
                                size="sm"
                                title="Editar"
                                >
                                ✏️
                                </Button>
                                <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleToggleStatus(student.id)}
                                title={student.status === "active" ? "Desactivar" : "Activar"}
                                disabled={actionLoading}
                                >
                                {student.status === "active" ? "⏸️" : "▶️"}
                                </Button>
                                <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => handleResetPassword(student.id)}
                                title="Resetear contraseña"
                                disabled={actionLoading}
                                >
                                🔑
                                </Button>
                                <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(student)}
                                title="Eliminar"
                                disabled={actionLoading}
                                >
                                🗑️
                                </Button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </Table>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-4">
                    <Button
                        variant="outline-primary"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="me-2"
                    >
                        ← Anterior
                    </Button>
                    <span className="align-self-center mx-3">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline-primary"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente →
                    </Button>
                    </div>
                )}
                </Card.Body>
            </Card>
            </Col>
        </Row>

        {/* Modal de confirmación de eliminación */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
            <Modal.Title>Confirmar eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            ¿Estás seguro de que quieres eliminar al estudiante{" "}
            <strong>
                {studentToDelete?.firstName} {studentToDelete?.lastName}
            </strong>
            ? Esta acción no se puede deshacer.
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={actionLoading}>
                Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={actionLoading}>
                {actionLoading ? "Eliminando..." : "Eliminar"}
            </Button>
            </Modal.Footer>
        </Modal>
        </Container>
    )
}

export default StudentsList
