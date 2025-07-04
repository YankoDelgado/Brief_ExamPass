import express from "express"
import {prisma} from "../lib/prisma.js"
import { authenticateToken, requireAdmin, requireStudent } from "../middleware/auth.js"

const router = express.Router()

//Obtener todos los exámenes (solo admins)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const exams = await prisma.exam.findMany({
            include: {
                examQuestions: {
                    include: {
                        question: {
                            include: {
                                professor: {
                                    select: {
                                        name: true,
                                        subject: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: "asc"
                    }
                },
                examResults: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        examResults: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        res.json({exams,total: exams.length})
    } catch (error) {
        console.error("Error obteniendo exámenes:", error)
        res.status(500).json({error: "Error interno del servidor"})
    }
})

//Generar nuevo examen (solo admins)
router.post("/generate", authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title = "Examen de Conocimientos", description, totalQuestions = 5 } = req.body

        console.log("Generando nuevo examen:", { title, totalQuestions })

        //Obtener preguntas activas aleatorias
        const availableQuestions = await prisma.question.findMany({
            where: {
                isActive: true
            },
            include: {
                professor: {
                    select: {
                        name: true,
                        subject: true
                    }
                }
            }
        })

        if(availableQuestions.length < totalQuestions) {
            return res.status(400).json({
                error: `No hay suficientes preguntas activas. Se necesitan ${totalQuestions}, disponibles: ${availableQuestions.length}`,
            })
        }

        //Seleccionar preguntas aleatorias
        const shuffled = availableQuestions.sort(() => 0.5 - Math.random())
        const selectedQuestions = shuffled.slice(0, totalQuestions)

        //Crear examen
        const exam = await prisma.exam.create({
            data: {
                title,
                description,
                totalQuestions,
                status: "ACTIVE" //Por Default
            }
        })

        //Crear relaciones pregunta-examen
        const examQuestions = await Promise.all(
            selectedQuestions.map((question, index) =>
                prisma.examQuestion.create({
                    data: {
                        examId: exam.id,
                        questionId: question.id,
                        order: index + 1,
                    }
                })
            )
        )

        console.log("Examen generado:", {id: exam.id, title: exam.title, questions: examQuestions.length})

        //Obtener examen completo
        const fullExam = await prisma.exam.findUnique({
            where: {id: exam.id},
            include: {
                examQuestions: {
                    include: {
                        question: {
                            include: {
                                professor: {
                                    select: {
                                        name: true,
                                        subject: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: "asc"
                    }
                }
            }
        })

        res.status(201).json({message: "Examen generado exitosamente", exam: fullExam})
    } catch (error) {
        console.error("Error generando examen:", error)
        res.status(500).json({
            error: "Error interno del servidor",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        })
    }
})

//Obtener examen disponible para estudiante
router.get("/available", authenticateToken, requireStudent, async (req, res) => {
    try {
        //Buscar examen activo que el estudiante no haya tomado
        const availableExam = await prisma.exam.findFirst({
            where: {
                status: "ACTIVE",
                examResults: {
                    none: {
                        userId: req.user.id
                    }
                }
            },
            include: {
                examQuestions: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                header: true,
                                alternatives: true,
                                educationalIndicator: true,
                                //NO incluir correctAnswer para estudiantes
                                professor: {
                                    select: {
                                        name: true,
                                        subject: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        order: "asc"
                    }
                }
            }
        })

        if(!availableExam) {
            return res.status(404).json({error: "No hay exámenes disponibles o ya has completado todos los exámenes"})
        }

        res.json({exam: availableExam, message: "Examen disponible encontrado"})
    } catch (error) {
        console.error("Error obteniendo examen disponible:", error)
        res.status(500).json({error:"Error interno del servidor"})
    }
})

//Iniciar examen (estudiantes)
router.post("/:examId/start", authenticateToken, requireStudent, async (req, res) => {
    try {
        const {examId} = req.params

        console.log("Iniciando examen:", {examId, userId: req.user.id})

        //Verificar que el examen existe y está activo
        const exam = await prisma.exam.findUnique({
            where: {id: examId},
            include: {
                examQuestions: {
                    include: {
                        question: true
                    }
                }
            }
        })

        if(!exam) {
            return res.status(404).json({error: "Examen no encontrado"})
        }

        if(exam.status !== "ACTIVE") {
            return res.status(400).json({error: "El examen no está disponible"})
        }

        //Verificar que el estudiante no haya tomado ya este examen
        const existingResult = await prisma.examResult.findFirst({
            where: {
                userId: req.user.id,
                examId: examId
            }
        })

        if(existingResult) {
            return res.status(400).json({error:"Ya has tomado este examen"})
        }

        //Crear resultado de examen
        const examResult = await prisma.examResult.create({
            data: {
                userId: req.user.id,
                examId: examId,
                totalQuestions: exam.totalQuestions,
                totalScore: 0,
                percentage: 0,
                status: "IN_PROGRESS",
                startedAt: new Date()
            }
        })

        console.log("Examen iniciado:", {resultId: examResult.id})

        res.status(201).json({
            message: "Examen iniciado exitosamente",
            examResult: {
                id: examResult.id,
                examId: examResult.examId,
                status: examResult.status,
                startedAt: examResult.startedAt,
                totalQuestions: examResult.totalQuestions
            }
        })
    } catch (error) {
        console.error("Error iniciando examen:", error)
        res.status(500).json({error:"Error interno del servidor"})
    }
})

//Responder pregunta
router.post("/results/:resultId/answer", authenticateToken, requireStudent, async (req, res) => {
    try {
        const {resultId} = req.params
        const {questionId, selectedAnswer, timeSpent} = req.body

        console.log("Respondiendo pregunta:", {resultId, questionId, selectedAnswer})

        //Verificar que el resultado existe y pertenece al usuario
        const examResult = await prisma.examResult.findFirst({
            where: {
                id: resultId,
                userId: req.user.id,
                status: "IN_PROGRESS",
            },
        })

        if(!examResult) {
            return res.status(404).json({error:"Resultado de examen no encontrado o ya completado"})
        }

        //Obtener la pregunta con la respuesta correcta
        const question = await prisma.question.findUnique({where: {id:questionId}})

        if(!question) {
            return res.status(404).json({error:"Pregunta no encontrada"})
        }

        //Verificar si ya respondió esta pregunta y si es correcta
        const existingAnswer = await prisma.examAnswer.findFirst({
            where: {
                examResultId: resultId,
                questionId: questionId
            }
        })

        if(existingAnswer) {
            return res.status(400).json({error:"Ya has respondido esta pregunta"})
        }

        const isCorrect = selectedAnswer === question.correctAnswer

        //Crear respuesta
        const answer = await prisma.examAnswer.create({
            data: {
                examResultId: resultId,
                questionId: questionId,
                selectedAnswer: selectedAnswer,
                isCorrect: isCorrect,
                timeSpent: timeSpent || null
            }
        })

        console.log("Respuesta guardada:", {answerId: answer.id, isCorrect})

        res.status(201).json({
            message: "Respuesta guardada exitosamente",
            answer: {
                id: answer.id,
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: answer.isCorrect
            }
        })
    } catch (error) {
        console.error("Error guardando respuesta:", error)
        res.status(500).json({error:"Error interno del servidor"})
    }
})

//Finalizar examen
router.post("/results/:resultId/finish", authenticateToken, requireStudent, async (req, res) => {
    try {
        const {resultId} = req.params

        console.log("Finalizando examen:", {resultId})

        //Verificar que el resultado existe y pertenece al usuario
        const examResult = await prisma.examResult.findFirst({
            where: {
                id: resultId,
                userId: req.user.id,
                status: "IN_PROGRESS"
            },
            include: {
                answers: {
                    include: {
                        question: {
                            include: {
                                professor: {
                                    select: {
                                        name: true,
                                        subject: true
                                    }
                                }
                            }
                        }
                    }
                },
                exam: true
            }
        })

        if(!examResult) {
            return res.status(404).json({error:"Resultado de examen no encontrado o ya completado"})
        }

        //Calcular puntaje
        const correctAnswers = examResult.answers.filter((answer) => answer.isCorrect).length
        const totalQuestions = examResult.totalQuestions
        const percentage = (correctAnswers / totalQuestions) * 100

        //Actualizar resultado
        const updatedResult = await prisma.examResult.update({
            where: {id: resultId},
                data: {
                    totalScore: correctAnswers,
                    percentage: percentage,
                    status: "COMPLETED",
                    completedAt: new Date()
                },
            include: {
                answers: {
                    include: {
                        question: {
                        include: {
                            professor: {
                                select: {
                                    name: true,
                                    subject: true,
                                },
                            },
                        },
                        },
                    },
                },
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                exam: true
            }
        })

        console.log("Examen finalizado:", {
            resultId,
            score: `${correctAnswers}/${totalQuestions}`,
            percentage: `${percentage.toFixed(1)}%`
        })

        res.json({
            message: "Examen finalizado exitosamente",
            result: {
                id: updatedResult.id,
                totalScore: updatedResult.totalScore,
                totalQuestions: updatedResult.totalQuestions,
                percentage: updatedResult.percentage,
                status: updatedResult.status,
                startedAt: updatedResult.startedAt,
                completedAt: updatedResult.completedAt,
                answers: updatedResult.answers,
                exam: updatedResult.exam,
                user: updatedResult.user
            }
        })
    } catch (error) {
        console.error("Error finalizando examen:", error)
        res.status(500).json({error:"Error interno del servidor"})
    }
})

//Obtener resultados del usuario actual
router.get("/my-results", authenticateToken, requireStudent, async (req, res) => {
    try {
        const results = await prisma.examResult.findMany({
            where: {userId: req.user.id},
            include: {
                exam: {
                    select: {
                        title: true,
                        description: true
                    }
                },
                reportData: true
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        res.json({results, total: results.length})
    } catch (error) {
        console.error("Error obteniendo resultados:", error)
        res.status(500).json({error:"Error interno del servidor"})
    }
})

export default router