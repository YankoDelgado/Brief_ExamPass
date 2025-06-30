import {Navbar, Nav, Container, Dropdown} from "react-bootstrap"
import {useAuth} from "../context/AuthContext"
import {useNavigate} from "react-router-dom"

const Layout = ({children}) => {
    const {user, logout} = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <>
        <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
            <Container>
            <Navbar.Brand href="#home">
                <strong>ExamPass</strong>
            </Navbar.Brand>

            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto">
                {user?.role === "ADMIN" && (
                    <>
                    <Nav.Link onClick={() => navigate("/admin/dashboard")}>Dashboard</Nav.Link>
                    <Nav.Link onClick={() => navigate("/admin/professors")}>Profesores</Nav.Link>
                    <Nav.Link onClick={() => navigate("/admin/questions")}>Preguntas</Nav.Link>
                    <Nav.Link onClick={() => navigate("/admin/exams")}>Exámenes</Nav.Link>
                    <Nav.Link onClick={() => navigate("/admin/reports")}>Reportes</Nav.Link>
                    </>
                )}

                {user?.role === "STUDENT" && (
                    <>
                    <Nav.Link onClick={() => navigate("/student/dashboard")}>Dashboard</Nav.Link>
                    <Nav.Link onClick={() => navigate("/student/exam")}>Examen</Nav.Link>
                    <Nav.Link onClick={() => navigate("/student/reports")}>Mis Reportes</Nav.Link>
                    </>
                )}
                </Nav>

                <Nav>
                <Dropdown align="end">
                    <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                    {user?.name || user?.email}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                    <Dropdown.Item onClick={() => navigate("/profile")}>Mi Perfil</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Cerrar Sesión</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                </Nav>
            </Navbar.Collapse>
            </Container>
        </Navbar>

        <Container>{children}</Container>
        </>
    )
}

export default Layout