import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert, Nav, Tab, Table } from "react-bootstrap"
import {getStudentById,getStudentExamHistory,getStudentStatistics,toggleStudentStatus,resetStudentPassword,deleteStudent} from "../../../services/studentService"

const StudentsView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [student, setStudent] = useState(null)
    const [examHistory, setExamHistory] = useState([])
    const [statistics, setStatistics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [activeTab, setActiveTab] = useState("info")
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        loadStudentData()
    }, [id])

    const loadStudentData = async () => {
        try {
            setLoading(true)
            const [studentData, historyData, statsData] = await Promise.all([
                getStudentById(id),
                getStudentExamHistory(id),
                getStudentStatistics(id),
            ])

            setStudent(studentData)
            setExamHistory(historyData.exams || [])
            setStatistics(statsData)
            setError("")
        } catch (err) {
            setError(err.message || "Error al cargar datos del estudiante")
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async () => {
        try {
            setActionLoading(true)
            await toggleStudentStatus(id)
            loadStudentData()
        } catch (err) {
            setError(err.message || "Error al cambiar estado del estudiante")
        } finally {
            setActionLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (!window.confirm("¿Estás seguro de que quieres resetear la contraseña de este estudiante?")) {
            return
        }

        try {
            setActionLoading(true)
            const response = await resetStudentPassword(id)
            alert(`Nueva contraseña: ${response.newPassword}`)
        } catch (err) {
            setError(err.message || "Error al resetear contraseña")
        } finally {
            setActionLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar este estudiante? Esta acción no se puede deshacer.")) {
            return
        }

        try {
            setActionLoading(true)
            await deleteStudent(id)
            navigate("/admin/students")
        } catch (err) {
            setError(err.message || "Error al eliminar estudiante")
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

    const getScoreVariant = (score) => {
        if (score >= 90) return "success"
        if (score >= 70) return "primary"
        if (score >= 60) return "warning"
        return "danger"
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
            <Container>
                <Alert variant="danger">{error}</Alert>
            </Container>
        )
    }

    return (
        <Container fluid>
        {/* Header */}
        <Row className="mb-4">
            <Col>
            <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center">
                <Button as={Link} to="/admin/students" variant="outline-secondary" className="me-3">
                    ← Volver
                </Button>
                <div>
                    <h2 className="mb-1">
                    {student?.firstName} {student?.lastName}
                    </h2>
                    <p className="text-muted mb-0">ID: {student?.studentCode || student?.id}</p>
                </div>
                </div>
                <div className="d-flex gap-2">
                <Button
                    variant={student?.status === "active" ? "warning" : "success"}
                    onClick={handleToggleStatus}
                    disabled={actionLoading}
                >
                    {student?.status === "active" ? "⏸️ Desactivar" : "▶️ Activar"}
                </Button>
                <Button variant="info" onClick={handleResetPassword} disabled={actionLoading}>
                    🔑 Resetear Contraseña
                </Button>
                <Button as={Link} to={`/admin/students/${id}/edit`} variant="primary">
                    ✏️ Editar
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={actionLoading}>
                    🗑️ Eliminar
                </Button>
                </div>
            </div>
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

        {/* Información básica */}
        <Row className="mb-4">
            <Col>
            <Card>
                <Card.Body>
                <div className="d-flex align-items-center">
                    <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-4"
                    style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                    >
                    <strong>
                        {student?.firstName?.charAt(0)}
                        {student?.lastName?.charAt(0)}
                    </strong>
                    </div>
                    <div className="flex-grow-1">
                    <Row>
                        <Col md={4}>
                        <p className="text-muted mb-1">Email</p>
                        <p className="fw-bold mb-3">{student?.email}</p>
                        </Col>
                        <Col md={4}>
                        <p className="text-muted mb-1">Teléfono</p>
                        <p className="fw-bold mb-3">{student?.phone || "No registrado"}</p>
                        </Col>
                        <Col md={4}>
                        <p className="text-muted mb-1">Estado</p>
                        <Badge bg={getStatusVariant(student?.status)} className="fs-6">
                            {getStatusText(student?.status)}
                        </Badge>
                        </Col>
                    </Row>
                    </div>
                </div>
                </Card.Body>
            </Card>
            </Col>
        </Row>

        {/* Estadísticas rápidas */}
        {statistics && (
            <Row className="mb-4">
            <Col md={3}>
                <Card className="text-center">
                <Card.Body>
                    <div className="display-4 text-primary mb-2">📚</div>
                    <h3 className="mb-1">{statistics.totalExams || 0}</h3>
                    <p className="text-muted mb-0">Exámenes Realizados</p>
                </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="text-center">
                <Card.Body>
                    <div className="display-4 text-success mb-2">📊</div>
                    <h3 className="mb-1">{(statistics.averageScore || 0).toFixed(1)}%</h3>
                    <p className="text-muted mb-0">Promedio General</p>
                </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="text-center">
                <Card.Body>
                    <div className="display-4 text-warning mb-2">🏆</div>
                    <h3 className="mb-1">{(statistics.bestScore || 0).toFixed(1)}%</h3>
                    <p className="text-muted mb-0">Mejor Puntaje</p>
                </Card.Body>
                </Card>
            </Col>
            <Col md={3}>
                <Card className="text-center">
                <Card.Body>
                    <div className="display-4 text-info mb-2">📅</div>
                    <p className="fw-bold mb-1">
                    {statistics.lastExamDate ? new Date(statistics.lastExamDate).toLocaleDateString() : "Nunca"}
                    </p>
                    <p className="text-muted mb-0">Último Examen</p>
                </Card.Body>
                </Card>
            </Col>
            </Row>
        )}

        {/* Tabs */}
        <Row>
            <Col>
            <Card>
                <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Card.Header>
                    <Nav variant="tabs">
                    <Nav.Item>
                        <Nav.Link eventKey="info">📋 Información Personal</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="exams">📚 Historial de Exámenes</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="stats">📊 Estadísticas Detalladas</Nav.Link>
                    </Nav.Item>
                    </Nav>
                </Card.Header>
                <Card.Body>
                    <Tab.Content>
                    {/* Tab: Información Personal */}
                    <Tab.Pane eventKey="info">
                        <Row>
                        <Col md={6}>
                            <h5 className="mb-3">Datos Personales</h5>
                            <div className="mb-3">
                            <strong>Nombre completo:</strong>
                            <p className="mb-2">
                                {student?.firstName} {student?.lastName}
                            </p>
                            </div>
                            <div className="mb-3">
                            <strong>Email:</strong>
                            <p className="mb-2">{student?.email}</p>
                            </div>
                            <div className="mb-3">
                            <strong>Teléfono:</strong>
                            <p className="mb-2">{student?.phone || "No registrado"}</p>
                            </div>
                            <div className="mb-3">
                            <strong>Fecha de nacimiento:</strong>
                            <p className="mb-2">
                                {student?.birthDate ? new Date(student.birthDate).toLocaleDateString() : "No registrada"}
                            </p>
                            </div>
                        </Col>
                        <Col md={6}>
                            <h5 className="mb-3">Información Académica</h5>
                            <div className="mb-3">
                            <strong>Código de estudiante:</strong>
                            <p className="mb-2">{student?.studentCode || student?.id}</p>
                            </div>
                            <div className="mb-3">
                            <strong>Carrera:</strong>
                            <p className="mb-2">{student?.career || "No especificada"}</p>
                            </div>
                            <div className="mb-3">
                            <strong>Semestre:</strong>
                            <p className="mb-2">{student?.semester || "No especificado"}</p>
                            </div>
                            <div className="mb-3">
                            <strong>Fecha de registro:</strong>
                            <p className="mb-2">{new Date(student?.createdAt).toLocaleDateString()}</p>
                            </div>
                        </Col>
                        </Row>
                    </Tab.Pane>

                    {/* Tab: Historial de Exámenes */}
                    <Tab.Pane eventKey="exams">
                        <h5 className="mb-3">Historial de Exámenes</h5>
                        {examHistory.length === 0 ? (
                        <div className="text-center py-5">
                            <div style={{ fontSize: "4rem" }}>📚</div>
                            <h4>No hay exámenes realizados</h4>
                            <p className="text-muted">Este estudiante no ha realizado exámenes aún</p>
                        </div>
                        ) : (
                        <Table responsive hover>
                            <thead>
                            <tr>
                                <th>Examen</th>
                                <th>Fecha</th>
                                <th>Puntaje</th>
                                <th>Estado</th>
                                <th>Tiempo</th>
                            </tr>
                            </thead>
                            <tbody>
                            {examHistory.map((exam) => (
                                <tr key={exam.id}>
                                <td>
                                    <div className="fw-bold">{exam.title}</div>
                                    <small className="text-muted">{exam.subject}</small>
                                </td>
                                <td>{new Date(exam.completedAt).toLocaleDateString()}</td>
                                <td>
                                    <Badge bg={getScoreVariant(exam.score)}>{exam.score.toFixed(1)}%</Badge>
                                </td>
                                <td>
                                    <Badge bg={exam.passed ? "success" : "danger"}>
                                    {exam.passed ? "Aprobado" : "Reprobado"}
                                    </Badge>
                                </td>
                                <td>{exam.timeSpent} min</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                        )}
                    </Tab.Pane>

                    {/* Tab: Estadísticas Detalladas */}
                    <Tab.Pane eventKey="stats">
                        {statistics && (
                        <Row>
                            <Col md={6}>
                            <Card className="mb-4">
                                <Card.Header>
                                <h6 className="mb-0">Rendimiento por Materia</h6>
                                </Card.Header>
                                <Card.Body>
                                {statistics.subjectStats && statistics.subjectStats.length > 0 ? (
                                    statistics.subjectStats.map((subject, index) => (
                                    <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                        <span>{subject.name}</span>
                                        <Badge bg={getScoreVariant(subject.average)}>{subject.average.toFixed(1)}%</Badge>
                                    </div>
                                    ))
                                ) : (
                                    <p className="text-muted">No hay datos disponibles</p>
                                )}
                                </Card.Body>
                            </Card>
                            </Col>
                            <Col md={6}>
                            <Card className="mb-4">
                                <Card.Header>
                                <h6 className="mb-0">Análisis de Rendimiento</h6>
                                </Card.Header>
                                <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tendencia general:</span>
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
                                        ? "📈 Mejorando"
                                        : statistics.trend === "declining"
                                        ? "📉 Descendente"
                                        : "➡️ Estable"}
                                    </Badge>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Exámenes aprobados:</span>
                                    <span>
                                    {statistics.passedExams || 0} / {statistics.totalExams || 0}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Tasa de aprobación:</span>
                                    <span>
                                    {statistics.totalExams > 0
                                        ? ((statistics.passedExams / statistics.totalExams) * 100).toFixed(1)
                                        : 0}
                                    %
                                    </span>
                                </div>
                                </Card.Body>
                            </Card>
                            </Col>
                        </Row>
                        )}

                        {statistics?.recommendations && (
                        <Card>
                            <Card.Header>
                            <h6 className="mb-0">Recomendaciones</h6>
                            </Card.Header>
                            <Card.Body>
                            {statistics.recommendations.length > 0 ? (
                                statistics.recommendations.map((rec, index) => (
                                <div key={index} className="d-flex align-items-start mb-2">
                                    <span className="text-primary me-2">💡</span>
                                    <span>{rec}</span>
                                </div>
                                ))
                            ) : (
                                <p className="text-muted">No hay recomendaciones disponibles</p>
                            )}
                            </Card.Body>
                        </Card>
                        )}
                    </Tab.Pane>
                    </Tab.Content>
                </Card.Body>
                </Tab.Container>
            </Card>
            </Col>
        </Row>
        </Container>
    )
}

export default StudentsView
