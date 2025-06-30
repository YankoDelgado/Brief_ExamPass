import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Card, Badge, Button, Nav, Tab, Table, Alert, Spinner } from "react-bootstrap"
import {getStudentById,getStudentStats,changeStudentStatus,resetStudentPassword} from "../../../services/studentService"

const StudentsView = () => {
    const { id } = useParams()
    const [student, setStudent] = useState(null)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [actionLoading, setActionLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("info")

    useEffect(() => {loadStudentData()}, [id])

    const loadStudentData = async () => {
        try {
            setLoading(true)
            const [studentData, statsData] = await Promise.all([getStudentById(id), getStudentStats(id)])
            setStudent(studentData)
            setStats(statsData)
            setError("")
        } catch (error) {
            setError("Error al cargar datos del estudiante")
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (newStatus) => {
        try {
            setActionLoading(true)
            await changeStudentStatus(id, newStatus)
            await loadStudentData()
            setError("")
        } catch (error) {
            setError("Error al cambiar estado del estudiante")
        } finally {
            setActionLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!window.confirm("¿Estás seguro de resetear la contraseña de este estudiante?")) {
            return
        }

        try {
            setActionLoading(true)
            const response = await resetStudentPassword(id)
            alert(`Nueva contraseña: ${response.newPassword}`)
            setError("")
        } catch (error) {
            setError("Error al resetear contraseña")
        } finally {
            setActionLoading(false)
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

    const getPerformanceBadge = (score) => {
        if (score >= 90) return <Badge bg="success">Excelente</Badge>
        if (score >= 80) return <Badge bg="primary">Muy Bueno</Badge>
        if (score >= 70) return <Badge bg="warning">Bueno</Badge>
        if (score >= 60) return <Badge bg="secondary">Regular</Badge>
        return <Badge bg="danger">Necesita Mejora</Badge>
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

    if (error && !student) {
        return (
            <Container className="py-4">
                <Alert variant="danger">{error}</Alert>
                <Button as={Link} to="/admin/students" variant="primary">
                Volver a la Lista
                </Button>
            </Container>
        )
    }

    return (
        <Container fluid className="py-4">
        <Row className="mb-4">
            <Col>
            <div className="d-flex justify-content-between align-items-center">
                <div>
                <Button as={Link} to="/admin/students" variant="outline-secondary" className="me-3">
                    ← Volver
                </Button>
                <h2 className="text-primary fw-bold d-inline">{student?.name || "Estudiante"}</h2>
                <div className="mt-1">
                    {getStatusBadge(student?.status)}
                    <Badge bg="info" className="ms-2">
                    {student?.studentCode}
                    </Badge>
                </div>
                </div>
                <div className="d-flex gap-2">
                <Button variant="outline-warning" onClick={handleResetPassword} disabled={actionLoading}>
                    Reset Contraseña
                </Button>
                <Button
                    variant={student?.status === "ACTIVE" ? "outline-secondary" : "outline-success"}
                    onClick={() => handleStatusChange(student?.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                    disabled={actionLoading}
                >
                    {student?.status === "ACTIVE" ? "Desactivar" : "Activar"}
                </Button>
                <Button as={Link} to={`/admin/students/edit/${id}`} variant="primary">
                    Editar
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

        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Row>
            <Col>
                <Nav variant="tabs" className="mb-4">
                <Nav.Item>
                    <Nav.Link eventKey="info">Información Personal</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="stats">Estadísticas</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="exams">Historial de Exámenes</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="reports">Reportes</Nav.Link>
                </Nav.Item>
                </Nav>

                <Tab.Content>
                {/* Información Personal */}
                <Tab.Pane eventKey="info">
                    <Row>
                    <Col md={6}>
                        <Card>
                        <Card.Header>
                            <h5 className="mb-0">Datos Personales</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                            <strong>Nombre Completo:</strong>
                            <div>{student?.name || "N/A"}</div>
                            </div>
                            <div className="mb-3">
                            <strong>Email:</strong>
                            <div>{student?.email || "N/A"}</div>
                            </div>
                            <div className="mb-3">
                            <strong>Código de Estudiante:</strong>
                            <div>
                                <code>{student?.studentCode || "N/A"}</code>
                            </div>
                            </div>
                            <div className="mb-3">
                            <strong>Carrera:</strong>
                            <div>{student?.career || "N/A"}</div>
                            </div>
                            <div className="mb-3">
                            <strong>Semestre:</strong>
                            <div>{student?.semester || "N/A"}</div>
                            </div>
                            <div className="mb-3">
                            <strong>Teléfono:</strong>
                            <div>{student?.phone || "N/A"}</div>
                            </div>
                        </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card>
                        <Card.Header>
                            <h5 className="mb-0">Información del Sistema</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                            <strong>Estado:</strong>
                            <div>{getStatusBadge(student?.status)}</div>
                            </div>
                            <div className="mb-3">
                            <strong>Fecha de Registro:</strong>
                            <div>{student?.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}</div>
                            </div>
                            <div className="mb-3">
                            <strong>Último Acceso:</strong>
                            <div>{student?.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : "Nunca"}</div>
                            </div>
                            <div className="mb-3">
                            <strong>Exámenes Realizados:</strong>
                            <div>{stats?.totalExams || 0}</div>
                            </div>
                            <div className="mb-3">
                            <strong>Promedio General:</strong>
                            <div>
                                {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : "N/A"}
                                {stats?.averageScore && (
                                <div className="mt-1">{getPerformanceBadge(stats.averageScore)}</div>
                                )}
                            </div>
                            </div>
                        </Card.Body>
                        </Card>
                    </Col>
                    </Row>
                </Tab.Pane>

                {/* Estadísticas */}
                <Tab.Pane eventKey="stats">
                    <Row>
                    <Col md={3}>
                        <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-primary">{stats?.totalExams || 0}</h3>
                            <p className="mb-0">Exámenes Realizados</p>
                        </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-success">
                            {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : "N/A"}
                            </h3>
                            <p className="mb-0">Promedio General</p>
                        </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-info">{stats?.bestScore || 0}%</h3>
                            <p className="mb-0">Mejor Puntaje</p>
                        </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="text-center">
                        <Card.Body>
                            <h3 className="text-warning">{stats?.passedExams || 0}</h3>
                            <p className="mb-0">Exámenes Aprobados</p>
                        </Card.Body>
                        </Card>
                    </Col>
                    </Row>

                    {stats?.subjectStats && (
                    <Row className="mt-4">
                        <Col>
                        <Card>
                            <Card.Header>
                            <h5 className="mb-0">Rendimiento por Materia</h5>
                            </Card.Header>
                            <Card.Body>
                            <Table responsive>
                                <thead>
                                <tr>
                                    <th>Materia</th>
                                    <th>Exámenes</th>
                                    <th>Promedio</th>
                                    <th>Mejor Puntaje</th>
                                    <th>Rendimiento</th>
                                </tr>
                                </thead>
                                <tbody>
                                {stats.subjectStats.map((subject, index) => (
                                    <tr key={index}>
                                    <td>{subject.name}</td>
                                    <td>{subject.totalExams}</td>
                                    <td>{subject.average.toFixed(1)}%</td>
                                    <td>{subject.bestScore}%</td>
                                    <td>{getPerformanceBadge(subject.average)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </Table>
                            </Card.Body>
                        </Card>
                        </Col>
                    </Row>
                    )}
                </Tab.Pane>

                {/* Historial de Exámenes */}
                <Tab.Pane eventKey="exams">
                    <Card>
                    <Card.Header>
                        <h5 className="mb-0">Historial de Exámenes</h5>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive hover>
                        <thead>
                            <tr>
                            <th>Examen</th>
                            <th>Materia</th>
                            <th>Fecha</th>
                            <th>Puntaje</th>
                            <th>Estado</th>
                            <th>Tiempo</th>
                            <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.examHistory?.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-4">
                                No hay exámenes realizados
                                </td>
                            </tr>
                            ) : (
                            stats?.examHistory?.map((exam, index) => (
                                <tr key={index}>
                                <td>{exam.title}</td>
                                <td>{exam.subject}</td>
                                <td>{new Date(exam.completedAt).toLocaleDateString()}</td>
                                <td>
                                    <strong>{exam.score}%</strong>
                                </td>
                                <td>
                                    <Badge bg={exam.score >= 60 ? "success" : "danger"}>
                                    {exam.score >= 60 ? "Aprobado" : "Reprobado"}
                                    </Badge>
                                </td>
                                <td>{exam.timeSpent} min</td>
                                <td>
                                    <Button
                                    as={Link}
                                    to={`/admin/exams/${exam.examId}/results`}
                                    variant="outline-primary"
                                    size="sm"
                                    >
                                    Ver Detalles
                                    </Button>
                                </td>
                                </tr>
                            ))
                            )}
                        </tbody>
                        </Table>
                    </Card.Body>
                    </Card>
                </Tab.Pane>

                {/* Reportes */}
                <Tab.Pane eventKey="reports">
                    <Card>
                    <Card.Header>
                        <h5 className="mb-0">Reportes Generados</h5>
                    </Card.Header>
                    <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                        <p className="mb-0">Generar reportes detallados del estudiante</p>
                        <div className="d-flex gap-2">
                            <Button as={Link} to={`/admin/reports/student/${id}`} variant="primary">
                            Ver Reporte Completo
                            </Button>
                            <Button variant="outline-success">Exportar PDF</Button>
                        </div>
                        </div>
                        <Alert variant="info">
                        <strong>Información:</strong> Los reportes incluyen análisis detallado del rendimiento, tendencias
                        de aprendizaje y recomendaciones personalizadas.
                        </Alert>
                    </Card.Body>
                    </Card>
                </Tab.Pane>
                </Tab.Content>
            </Col>
            </Row>
        </Tab.Container>
        </Container>
    )
}

export default StudentsView
