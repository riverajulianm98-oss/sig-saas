"""Static ISO checklist template seed definitions."""

from typing import Any, TypedDict


class QuestionSeed(TypedDict):
    clause_code: str
    question_text: str
    compliance_criteria: str
    weight: int
    criticality: str
    response_type: str
    is_required: bool
    evidence_required: bool
    sort_order: int
    guidance_text: str | None


class SectionSeed(TypedDict):
    chapter_code: str
    clause_code: str
    title: str
    description: str | None
    process_area: str | None
    sort_order: int
    questions: list[QuestionSeed]


class TemplateSeed(TypedDict):
    code: str
    iso_standard: str
    title: str
    description: str
    sections: list[SectionSeed]


def _q(
    clause: str,
    question: str,
    criteria: str,
    *,
    weight: int = 1,
    criticality: str = "media",
    response_type: str = "cumple",
    evidence: bool = False,
    sort_order: int = 1,
) -> QuestionSeed:
    return {
        "clause_code": clause,
        "question_text": question,
        "compliance_criteria": criteria,
        "weight": weight,
        "criticality": criticality,
        "response_type": response_type,
        "is_required": True,
        "evidence_required": evidence,
        "sort_order": sort_order,
        "guidance_text": None,
    }


def _section(
    chapter: str,
    clause: str,
    title: str,
    process: str,
    sort: int,
    questions: list[QuestionSeed],
    description: str | None = None,
) -> SectionSeed:
    return {
        "chapter_code": chapter,
        "clause_code": clause,
        "title": title,
        "description": description,
        "process_area": process,
        "sort_order": sort,
        "questions": questions,
    }


ISO_9001_SECTIONS: list[SectionSeed] = [
    _section(
        "4",
        "4.1",
        "Contexto de la organización",
        "Estrategia",
        1,
        [
            _q(
                "4.1",
                "¿Se determinan las cuestiones internas y externas pertinentes al SGC?",
                "La organización debe determinar cuestiones internas y externas que afectan el SGC.",
                criticality="alta",
                evidence=True,
            ),
            _q(
                "4.2",
                "¿Se identifican las partes interesadas y sus requisitos?",
                "Deben identificarse partes interesadas y requisitos aplicables.",
                sort_order=2,
            ),
        ],
    ),
    _section(
        "5",
        "5.1",
        "Liderazgo y compromiso",
        "Dirección",
        2,
        [
            _q(
                "5.1",
                "¿La alta dirección demuestra liderazgo y compromiso con el SGC?",
                "La alta dirección debe asumir responsabilidad y promover el enfoque basado en procesos.",
                criticality="critica",
            ),
        ],
    ),
    _section(
        "6",
        "6.1",
        "Acciones para abordar riesgos y oportunidades",
        "Planificación",
        3,
        [
            _q(
                "6.1",
                "¿Existen acciones planificadas para riesgos y oportunidades?",
                "La organización debe planificar acciones para riesgos y oportunidades.",
                criticality="alta",
            ),
        ],
    ),
    _section(
        "7",
        "7.1.5",
        "Recursos de seguimiento y medición",
        "Recursos",
        4,
        [
            _q(
                "7.1.5",
                "¿Los equipos de medición están calibrados o verificados?",
                "Los recursos de seguimiento deben ser adecuados y calibrados cuando aplique.",
                evidence=True,
            ),
        ],
    ),
    _section(
        "8",
        "8.5.1",
        "Control de la producción y prestación del servicio",
        "Operación",
        5,
        [
            _q(
                "8.5.1",
                "¿La producción se realiza bajo condiciones controladas?",
                "La producción debe realizarse en condiciones controladas documentadas.",
                criticality="alta",
                evidence=True,
            ),
        ],
    ),
    _section(
        "9",
        "9.2",
        "Auditoría interna",
        "Evaluación",
        6,
        [
            _q(
                "9.2",
                "¿Se realizan auditorías internas planificadas?",
                "Debe existir un programa de auditoría interna con resultados documentados.",
                criticality="critica",
                evidence=True,
            ),
        ],
    ),
    _section(
        "10",
        "10.2",
        "No conformidad y acción correctiva",
        "Mejora",
        7,
        [
            _q(
                "10.2",
                "¿Se tratan las no conformidades y se implementan acciones correctivas?",
                "Ante NC se debe controlar, corregir y tomar acción correctiva con eficacia verificada.",
                criticality="critica",
            ),
        ],
    ),
]

ISO_14001_SECTIONS: list[SectionSeed] = [
    _section(
        "4",
        "4.1",
        "Comprensión de la organización y su contexto",
        "Contexto",
        1,
        [
            _q(
                "4.1",
                "¿Se consideran cuestiones ambientales internas y externas?",
                "Determinar cuestiones ambientales que afectan el propósito de la organización.",
                criticality="alta",
            ),
        ],
    ),
    _section(
        "6",
        "6.1.2",
        "Aspectos ambientales",
        "Planificación",
        2,
        [
            _q(
                "6.1.2",
                "¿Se identifican aspectos ambientales significativos?",
                "Determinar aspectos ambientales de actividades y evaluar su significancia.",
                criticality="critica",
                evidence=True,
            ),
        ],
    ),
    _section(
        "6",
        "6.1.3",
        "Requisitos legales y otros requisitos",
        "Cumplimiento",
        3,
        [
            _q(
                "6.1.3",
                "¿Se determina y cumple la legislación ambiental aplicable?",
                "Identificar y acceder a requisitos legales y otros requisitos.",
                criticality="critica",
            ),
        ],
    ),
    _section(
        "8",
        "8.1",
        "Planificación y control operacional",
        "Operación",
        4,
        [
            _q(
                "8.1",
                "¿Existen controles operacionales para aspectos significativos?",
                "Establecer, implementar y mantener controles operacionales.",
                criticality="alta",
            ),
        ],
    ),
    _section(
        "9",
        "9.1",
        "Seguimiento, medición, análisis y evaluación",
        "Monitoreo",
        5,
        [
            _q(
                "9.1",
                "¿Se monitorean indicadores ambientales clave?",
                "Determinar qué necesita seguimiento y medición ambiental.",
                evidence=True,
            ),
        ],
    ),
    _section(
        "10",
        "10.2",
        "No conformidad y acción correctiva",
        "Mejora",
        6,
        [
            _q(
                "10.2",
                "¿Se gestionan incidentes ambientales y NC?",
                "Reaccionar ante NC/incidentes y evaluar eficacia de acciones correctivas.",
                criticality="critica",
            ),
        ],
    ),
]

ISO_45001_SECTIONS: list[SectionSeed] = [
    _section(
        "4",
        "4.1",
        "Comprensión de la organización y su contexto",
        "Contexto SST",
        1,
        [
            _q(
                "4.1",
                "¿Se consideran cuestiones internas y externas de SST?",
                "Determinar cuestiones que afectan la capacidad de lograr resultados del SGSST.",
                criticality="alta",
            ),
        ],
    ),
    _section(
        "5",
        "5.4",
        "Consulta y participación de los trabajadores",
        "Participación",
        2,
        [
            _q(
                "5.4",
                "¿Existen mecanismos de consulta y participación de trabajadores?",
                "Establecer procesos de consulta y participación en todas las etapas.",
                criticality="critica",
            ),
        ],
    ),
    _section(
        "6",
        "6.1.2",
        "Identificación de peligros",
        "Riesgos",
        3,
        [
            _q(
                "6.1.2",
                "¿Se identifican peligros y se evalúan riesgos de SST?",
                "Proceso continuo de identificación de peligros y evaluación de riesgos.",
                criticality="critica",
                evidence=True,
            ),
        ],
    ),
    _section(
        "8",
        "8.1.2",
        "Eliminación de peligros y reducción de riesgos",
        "Control operacional",
        4,
        [
            _q(
                "8.1.2",
                "¿Se aplican controles según jerarquía de controles?",
                "Implementar controles usando la jerarquía: eliminación, sustitución, ingeniería, etc.",
                criticality="critica",
            ),
        ],
    ),
    _section(
        "9",
        "9.2",
        "Auditoría interna del SGSST",
        "Evaluación",
        5,
        [
            _q(
                "9.2",
                "¿Se realizan auditorías internas del SGSST?",
                "Programa de auditoría interna con competencia e independencia.",
                criticality="alta",
                evidence=True,
            ),
        ],
    ),
    _section(
        "10",
        "10.2",
        "Incidentes, no conformidades y acciones correctivas",
        "Mejora SST",
        6,
        [
            _q(
                "10.2",
                "¿Se reportan e investigan incidentes y casi incidentes?",
                "Establecer proceso para reporte, investigación y acciones correctivas.",
                criticality="critica",
            ),
        ],
    ),
]

SYSTEM_TEMPLATES: list[TemplateSeed] = [
    {
        "code": "SYS-ISO9001",
        "iso_standard": "iso_9001",
        "title": "Plantilla base ISO 9001:2015",
        "description": "Checklist de auditoría interna para Sistema de Gestión de la Calidad.",
        "sections": ISO_9001_SECTIONS,
    },
    {
        "code": "SYS-ISO14001",
        "iso_standard": "iso_14001",
        "title": "Plantilla base ISO 14001:2015",
        "description": "Checklist de auditoría interna para Sistema de Gestión Ambiental.",
        "sections": ISO_14001_SECTIONS,
    },
    {
        "code": "SYS-ISO45001",
        "iso_standard": "iso_45001",
        "title": "Plantilla base ISO 45001:2018",
        "description": "Checklist de auditoría interna para Sistema de Gestión de SST.",
        "sections": ISO_45001_SECTIONS,
    },
]
