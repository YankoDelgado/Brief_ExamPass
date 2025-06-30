import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Container, Row, Col, Card, Button, Nav, Tab, Table, Badge, Alert, Spinner, ProgressBar } from "react-bootstrap"
import {getStudentById,getStudentStatistics,getStudentExamHistory,toggleStudentStatus,resetStudentPassword} from "../../../services/studentService"

const StudentsView = () => {
    const { id } = useParams()
    const [student, setStudent] = useState(null)
    const [statistics, setStatistics] = useState(null)
    const [examHistory, setExamHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [activeTab, setActiveTab] = useState("info")

    useEffect(() => {
        loadStudentData()
    }, [id])

    const loadStudentData = async () => {
        try {
            setLoading(true)
            const [studentData, statsData, historyData] = await Promise.all([
                getStudentById(id),
                getStudentStatistics(id),
                getStudentExamHistory(id),
            ])

            setStudent(studentData)
            setStatistics(statsData)
            setExamHistory(historyData)
            setError("")
        } catch (err) {
            setError("Error al cargar datos del estudiante: " + (err.message || "Error desconocido"))
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        try {
            await toggleStudentStatus(id)
            setSuccess(`Estudiante ${student.isActive ? "desactivado" : "activado"} exitosamente`)
            loadStudentData()
        } catch (err) {
            setError("Error al cambiar estado: " + (err.message || "Error desconocido"))
        }
    }

    const handleResetPassword = async () => {
        if (!window.confirm("¿Estás seguro de resetear la contraseña de este estudiante?")) return

        try {
            const result = await resetStudentPassword(id)
            setSuccess(`Contraseña reseteada. Nueva contraseña: ${result.newPassword}`)
        } catch (err) {
            setError("Error al resetear contraseña: " + (err.message || "Error desconocido"))
        }
    }

    const getStatusBadge = (student) => {
        if (student.isSuspended) {
            return <Badge bg="danger">Suspendido</Badge>
        }
        if (student.isActive) {
            return <Badge bg="success">Activo</Badge>
        }
        return <Badge bg="secondary">Inactivo</Badge>
    }

    const getGradeBadge = (score) => {
        if (score >= 90) return <Badge bg="success">{score}%</Badge>
        if (score >= 80) return <Badge bg="info">{score}%</Badge>
        if (score >= 70) return <Badge bg="warning">{score}%</Badge>
        return <Badge bg="danger">{score}%</Badge>
    }

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando...</span>
                </Spinner>
            </Container>
        )
    }

    if (!student) {
        return (
            <Container>
                <Alert variant="danger">No se encontró el estudiante</Alert>
                <Button as={Link} to="/admin/students" variant="primary">
                Volver a la lista
                </Button>
            </Container>
        )
    }

    return (
        <Container fluid>
        <Row className="mb-4">
            <Col>
            <div className="d-flex justify-content-between align-items-center">
                <div>
                <h2>Detalles del Estudiante</h2>
                <p className="text-muted">Información completa y estadísticas</p>
                </div>
                <div>
                <Button as={Link} to="/admin/students" variant="outline-secondary" className="me-2">
                    Volver
                </Button>
                <Button as={Link} to={`/admin/students/edit/${id}`} variant="primary">
                    Editar
                </Button>
                </div>
            </div>
            </Col>
        </Row>

        {error && (
            <Alert variant="danger" dismissible onClose={() => setError("")}>
            {error}
            </Alert>
        )}

        {success && (
            <Alert variant="success" dismissible onClose={() => setSuccess("")}>
            {success}
            </Alert>
        )}

        <Row>
            <Col md={4}>
            <Card className="mb-4">
                <Card.Body className="text-center">
                <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                >
                    {student.name?.charAt(0)}
                </div>
                <h4>{student.name}</h4>
                <p className="text-muted">{student.email}</p>
                <div className="mb-3">{getStatusBadge(student)}</div>
                <div className="d-grid gap-2">
                    <Button variant={student.isActive ? "warning" : "success"} onClick={handleToggleStatus}>
                    {student.isActive ? "Desactivar" : "Activar"}
                    </Button>
                    <Button variant="info" onClick={handleResetPassword}>
                    Resetear Contraseña
                    </Button>
                </div>
                </Card.Body>
            </Card>

            {statistics && (
                <Card>
                <Card.Header>
                    <h5>Estadísticas Rápidas</h5>
                </Card.Header>
                <Card.Body>
                    <div className="mb-3">
                    <div className="d-flex justify-content-between">
                        <span>Exámenes Realizados:</span>
                        <strong>{statistics.totalExams || 0}</strong>
                    </div>
                    </div>
                    <div className="mb-3">
                    <div className="d-flex justify-content-between">
                        <span>Promedio General:</span>
                        <strong>{statistics.averageScore || 0}%</strong>
                    </div>
                    <ProgressBar
                        now={statistics.averageScore || 0}
                        variant={statistics.averageScore >= 70 ? "success" : "danger"}
                        className="mt-1"
                    />
                    </div>
                    <div className="mb-3">
                    <div className="d-flex justify-content-between">
                        <span>Mejor Puntaje:</span>
                        <strong>{statistics.bestScore || 0}%</strong>
                    </div>
                    </div>
                    <div>
                    <div className="d-flex justify-content-between">
                        <span>Último Examen:</span>
                        <small>
                        {statistics.lastExamDate ? new Date(statistics.lastExamDate).toLocaleDateString() : "N/A"}
                        </small>
                    </div>
                    </div>
                </Card.Body>
                </Card>
            )}
            </Col>

            <Col md={8}>
            <Card>
                <Card.Header>
                <Nav variant="tabs" activeKey={activeTab} onSelect={setActiveTab}>
                    <Nav.Item>
                    <Nav.Link eventKey="info">Información Personal</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                    <Nav.Link eventKey="exams">Historial de Exámenes</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                    <Nav.Link eventKey="stats">Estadísticas Detalladas</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                    <Nav.Link eventKey="activity">Actividad Reciente</Nav.Link>
                    </Nav.Item>
                </Nav>
                </Card.Header>

                <Card.Body>
                <Tab.Content>
                    {activeTab === "info" && (
                    <div>
                        <h5>Información Personal</h5>
                        <Row>
                        <Col md={6}>
                            <p>
                            <strong>Código de Estudiante:</strong> {student.studentCode || "N/A"}
                            </p>
                            <p>
                            <strong>Nombre Completo:</strong> {student.name}
                            </p>
                            <p>
                            <strong>Email:</strong> {student.email}
                            </p>
                            <p>
                            <strong>Teléfono:</strong> {student.phone || "No registrado"}
                            </p>
                        </Col>
                        <Col md={6}>
                            <p>
                            <strong>Fecha de Registro:</strong>{" "}
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "N/A"}
                            </p>
                            <p>
                            <strong>Último Acceso:</strong>{" "}
                            {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : "Nunca"}
                            </p>
                            <p>
                            <strong>Carrera:</strong> {student.career || "No especificada"}
                            </p>
                            <p>
                            <strong>Semestre:</strong> {student.semester || "No especificado"}
                            </p>
                        </Col>
                        </Row>
                    </div>
                    )}

                    {activeTab === "exams" && (
                    <div>
                        <h5>Historial de Exámenes</h5>
                        {examHistory.length === 0 ? (
                        <p className="text-muted">No ha realizado exámenes aún</p>
                        ) : (
                        <Table responsive striped hover>
                            <thead>
                            <tr>
                                <th>Examen</th>
                                <th>Fecha</th>
                                <th>Puntaje</th>
                                <th>Tiempo</th>
                                <th>Estado</th>
                            </tr>
                            </thead>
                            <tbody>
                            {examHistory.map((exam, index) => (
                                <tr key={index}>
                                <td>{exam.examTitle}</td>
                                <td>{new Date(exam.completedAt).toLocaleDateString()}</td>
                                <td>{getGradeBadge(exam.score)}</td>
                                <td>{exam.timeSpent || "N/A"}</td>
                                <td>
                                    <Badge bg={exam.passed ? "success" : "danger"}>
                                    {exam.passed ? "Aprobado" : "Reprobado"}
                                    </Badge>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                        )}
                    </div>
                    )}

                    {activeTab === "stats" && statistics && (
                    <div>
                        <h5>Estadísticas Detalladas</h5>
                        <Row>
                        <Col md={6}>
                            <Card className="mb-3">
                            <Card.Body>
                                <h6>Rendimiento por Materia</h6>
                                {statistics.subjectStats?.map((subject, index) => (
                                <div key={index} className="mb-2">
                                    <div className="d-flex justify-content-between">
                                    <span>{subject.name}</span>
                                    <span>{subject.average}%</span>
                                    </div>
                                    <ProgressBar
                                    now={subject.average}
                                    variant={subject.average >= 70 ? "success" : "danger"}
                                    size="sm"
                                    />
                                </div>
                                )) || <p className="text-muted">No hay datos disponibles</p>}
                            </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card>
                            <Card.Body>
                                <h6>Tendencia de Rendimiento</h6>
                                <div className="mb-2">
                                <span>Tendencia: </span>
                                <Badge
                                    bg={
                                    statistics.trend === "improving"
                                        ? "success"
                                        : statistics.trend === "declining"
                                        ? "danger"
                                        : "warning"
                                    }
                                >
                                    {statistics.trend === "improving"
                                    ? "Mejorando"
                                    : statistics.trend === "declining"
                                        ? "Declinando"
                                        : "Estable"}
                                </Badge>
                                </div>
                                <div className="mb-2">
                                <span>Exámenes Aprobados: </span>
                                <strong>
                                    {statistics.passedExams || 0}/{statistics.totalExams || 0}
                                </strong>
                                </div>
                                <div>
                                <span>Tasa de Aprobación: </span>
                                <strong>{statistics.passRate || 0}%</strong>
                                </div>
                            </Card.Body>
                            </Card>
                        </Col>
                        </Row>
                    </div>
                    )}

                    {activeTab === "activity" && (
                    <div>
                        <h5>Actividad Reciente</h5>
                        <div className="timeline">
                        {student.recentActivity?.map((activity, index) => (
                            <div key={index} className="mb-3 p-3 border-start border-primary border-3">
                            <div className="d-flex justify-content-between">
                                <strong>{activity.action}</strong>
                                <small className="text-muted">{new Date(activity.date).toLocaleDateString()}</small>
                            </div>
                            <p className="mb-0 text-muted">{activity.description}</p>
                            </div>
                        )) || <p className="text-muted">No hay actividad reciente registrada</p>}
                        </div>
                    </div>
                    )}
                </Tab.Content>
                </Card.Body>
            </Card>
            </Col>
        </Row>
        </Container>
    )
}

export default StudentsView