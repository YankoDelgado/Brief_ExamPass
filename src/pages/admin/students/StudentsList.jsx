import { useState, useEffect } from "react"
import {Container,Row,Col,Card,Table,Button,Form,InputGroup,Badge,Spinner,Alert,Modal} from "react-bootstrap"
import { Link } from "react-router-dom"
import {getAllStudents,changeStudentStatus,resetStudentPassword,deleteStudent,exportStudents} from "../../../services/studentService"

const StudentsList = () => {
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)
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
        } catch (error) {
            setError("Error al cargar estudiantes")
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (studentId, newStatus) => {
        try {
            setActionLoading(true)
            await changeStudentStatus(studentId, newStatus)
            await loadStudents()
            setError("")
        } catch (error) {
            setError("Error al cambiar estado del estudiante")
        } finally {
            setActionLoading(false)
        }
    }

    const handleResetPassword = async (studentId) => {
        if (!window.confirm("¿Estás seguro de resetear la contraseña de este estudiante?")) {
            return
        }

        try {
            setActionLoading(true)
            const response = await resetStudentPassword(studentId)
            alert(`Nueva contraseña: ${response.newPassword}`)
            setError("")
        } catch (error) {
            setError("Error al resetear contraseña")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDeleteStudent = async () => {
        try {
            setActionLoading(true)
            await deleteStudent(selectedStudent.id)
            await loadStudents()
            setShowDeleteModal(false)
            setSelectedStudent(null)
            setError("")
        } catch (error) {
            setError("Error al eliminar estudiante")
        } finally {
            setActionLoading(false)
        }
    }

    const handleExport = async (format) => {
        try {
            const blob = await exportStudents(format)
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `estudiantes.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            setError("Error al exportar estudiantes")
        }
    }

    const getStatusBadge = (status) => {
        const variants = {
            ACTIVE: "success",
            INACTIVE: "secondary",
            SUSPENDED: "danger",
        }
        return <Badge bg={variants[status] || "secondary"}>{status}</Badge>
    }

    const filteredStudents = students.filter((student) => {
        const matchesSearch =
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesSearch
    })

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
        <Container fluid className="py-4">
        <Row className="mb-4">
            <Col>
            <div className="d-flex justify-content-between align-items-center">
                <h2 className="text-primary fw-bold">Gestión de Estudiantes</h2>
                <div className="d-flex gap-2">
                <Button variant="outline-success" onClick={() => handleExport("csv")}>
                    Exportar CSV
                </Button>
                <Button variant="outline-danger" onClick={() => handleExport("pdf")}>
                    Exportar PDF
                </Button>
                <Button as={Link} to="/admin/students/create" variant="primary">
                    Nuevo Estudiante
                </Button>
                </div>
            </div>
            </Col>
        </Row>

        {error && (
            <Row className="mb-3">
            <Col>
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                {error}
                </Alert>
            </Col>
            </Row>
        )}

        <Row className="mb-4">
            <Col md={6}>
            <InputGroup>
                <Form.Control
                type="text"
                placeholder="Buscar por nombre, email o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </InputGroup>
            </Col>
            <Col md={3}>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">Todos los estados</option>
                <option value="ACTIVE">Activos</option>
                <option value="INACTIVE">Inactivos</option>
                <option value="SUSPENDED">Suspendidos</option>
            </Form.Select>
            </Col>
        </Row>

        <Row>
            <Col>
            <Card>
                <Card.Body>
                <Table responsive hover>
                    <thead>
                    <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Estado</th>
                        <th>Fecha Registro</th>
                        <th>Último Acceso</th>
                        <th>Acciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredStudents.length === 0 ? (
                        <tr>
                        <td colSpan="7" className="text-center py-4">
                            No se encontraron estudiantes
                        </td>
                        </tr>
                    ) : (
                        filteredStudents.map((student) => (
                        <tr key={student.id}>
                            <td>
                            <code>{student.studentCode}</code>
                            </td>
                            <td>
                            <div>
                                <strong>{student.name}</strong>
                                {student.career && <div className="text-muted small">{student.career}</div>}
                            </div>
                            </td>
                            <td>{student.email}</td>
                            <td>{getStatusBadge(student.status)}</td>
                            <td>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}</td>
                            <td>{student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : "Nunca"}</td>
                            <td>
                            <div className="d-flex gap-1">
                                <Button as={Link} to={`/admin/students/${student.id}`} variant="outline-primary" size="sm">
                                Ver
                                </Button>
                                <Button
                                variant="outline-warning"
                                size="sm"
                                onClick={() => handleResetPassword(student.id)}
                                disabled={actionLoading}
                                >
                                Reset
                                </Button>
                                <Button
                                variant={student.status === "ACTIVE" ? "outline-secondary" : "outline-success"}
                                size="sm"
                                onClick={() =>
                                    handleStatusChange(student.id, student.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")
                                }
                                disabled={actionLoading}
                                >
                                {student.status === "ACTIVE" ? "Desactivar" : "Activar"}
                                </Button>
                                <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => {
                                    setSelectedStudent(student)
                                    setShowDeleteModal(true)
                                }}
                                disabled={actionLoading}
                                >
                                Eliminar
                                </Button>
                            </div>
                            </td>
                        </tr>
                        ))
                    )}
                    </tbody>
                </Table>

                {totalPages > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                    <Button
                        variant="outline-primary"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="me-2"
                    >
                        Anterior
                    </Button>
                    <span className="align-self-center mx-3">
                        Página {currentPage} de {totalPages}
                    </span>
                    <Button
                        variant="outline-primary"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Siguiente
                    </Button>
                    </div>
                )}
                </Card.Body>
            </Card>
            </Col>
        </Row>

        {/* Modal de confirmación para eliminar */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
            <Modal.Title>Confirmar Eliminación</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            ¿Estás seguro de que deseas eliminar al estudiante <strong>{selectedStudent?.name}</strong>? Esta acción no se
            puede deshacer.
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteStudent} disabled={actionLoading}>
                {actionLoading ? "Eliminando..." : "Eliminar"}
            </Button>
            </Modal.Footer>
        </Modal>
        </Container>
    )
}

export default StudentsList