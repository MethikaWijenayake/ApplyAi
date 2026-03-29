"""
Resume text extraction.
Handles PDF (via pdfplumber) and DOCX (via python-docx).
"""

import io
import re
from typing import Optional


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    import pdfplumber

    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract all text from a DOCX file."""
    from docx import Document

    doc = Document(io.BytesIO(file_bytes))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
    return "\n".join(paragraphs)


def extract_text(file_bytes: bytes, content_type: str, filename: str) -> str:
    """Route to correct extractor based on file type."""
    filename_lower = filename.lower()
    if content_type == "application/pdf" or filename_lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif content_type in (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
    ) or filename_lower.endswith(".docx"):
        return extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {content_type}")


# ── Heuristic field extractors ────────────────────────────────────────────────

def extract_email(text: str) -> Optional[str]:
    match = re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    match = re.search(
        r"(\+?1?\s?)?(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})", text
    )
    return match.group(0).strip() if match else None


def extract_name(text: str) -> Optional[str]:
    """
    Naive heuristic: assume the first non-empty line of the resume is the name,
    as long as it looks like a name (no digits, not too long).
    """
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if len(line) > 60:
            continue
        if re.search(r"\d", line):
            continue
        if "@" in line or "http" in line.lower():
            continue
        # Looks like a name — at least two words, title-cased or all-caps
        words = line.split()
        if len(words) >= 2:
            return line
    return None


_SKILL_KEYWORDS = [
    # Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "ruby", "php", "swift", "kotlin", "scala", "r", "matlab",
    # Web
    "react", "next.js", "nextjs", "vue", "angular", "svelte", "html", "css",
    "tailwind", "sass", "webpack", "vite",
    # Backend
    "node.js", "nodejs", "fastapi", "django", "flask", "express", "spring",
    "graphql", "rest", "grpc",
    # Data / ML
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "keras",
    # Cloud / DevOps
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd",
    "github actions", "jenkins", "linux",
    # Tools
    "git", "jira", "figma", "postman", "supabase", "firebase",
]


def extract_skills(text: str) -> list[str]:
    """Find skill keywords mentioned anywhere in the text."""
    text_lower = text.lower()
    found = []
    for skill in _SKILL_KEYWORDS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            # Return in display-friendly form
            found.append(skill.title() if skill.islower() else skill)
    return found


def extract_sections(text: str) -> dict:
    """
    Split the resume text into named sections using common headings.
    Returns a dict of section_name → section_text.
    """
    section_headers = [
        r"work experience", r"experience", r"employment",
        r"education", r"academic",
        r"skills", r"technical skills", r"core competencies",
        r"projects", r"certifications", r"summary", r"objective",
        r"publications", r"awards", r"languages",
    ]
    pattern = re.compile(
        r"^(" + "|".join(section_headers) + r")\s*$",
        re.IGNORECASE | re.MULTILINE,
    )

    sections: dict[str, str] = {}
    matches = list(pattern.finditer(text))

    for i, match in enumerate(matches):
        heading = match.group(0).strip().lower()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        sections[heading] = text[start:end].strip()

    return sections


def parse_experience_section(section_text: str) -> list[dict]:
    """
    Heuristic parser for work experience blocks.
    Returns a list of {company, title, dates, description}.
    """
    entries = []
    # Split on lines that look like company/title headers (non-indented, contain a year)
    blocks = re.split(r"\n(?=[A-Z][^\n]{0,80}\b(19|20)\d{2}\b)", section_text)

    for block in blocks:
        block = block.strip()
        if not block:
            continue
        lines = [l.strip() for l in block.splitlines() if l.strip()]
        if not lines:
            continue

        # First line: try to extract company + date range
        first = lines[0]
        date_match = re.search(
            r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\.?\s*\d{4}"
            r"\s*[-–]\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\.?\s*"
            r"(?:\d{4}|Present|Current|Now))",
            first,
            re.IGNORECASE,
        )
        dates = date_match.group(0).strip() if date_match else ""
        company = re.sub(r"\s*" + re.escape(dates) + r"\s*", "", first).strip(" |·–-")

        title = lines[1] if len(lines) > 1 else ""
        description = "\n".join(lines[2:]) if len(lines) > 2 else ""

        entries.append(
            {
                "company": company,
                "title": title,
                "dates": dates,
                "description": description,
            }
        )

    return entries


def parse_education_section(section_text: str) -> list[dict]:
    """
    Heuristic parser for education blocks.
    Returns a list of {institution, degree, year}.
    """
    entries = []
    lines = [l.strip() for l in section_text.splitlines() if l.strip()]

    i = 0
    while i < len(lines):
        line = lines[i]
        year_match = re.search(r"\b(19|20)\d{2}\b", line)
        year = year_match.group(0) if year_match else ""

        degree = ""
        if re.search(
            r"\b(bachelor|master|phd|doctorate|b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?b\.?a\.?|associate)\b",
            line,
            re.IGNORECASE,
        ):
            degree = line
            institution = lines[i + 1] if i + 1 < len(lines) else ""
            i += 2
        else:
            institution = line
            if i + 1 < len(lines):
                degree = lines[i + 1]
            i += 2

        entries.append({"institution": institution, "degree": degree, "year": year})

    return entries
