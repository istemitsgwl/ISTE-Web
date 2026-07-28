import logging
from fastapi import APIRouter, Depends
from app.firebase import get_db

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/content", tags=["Public Content Engine"])

STATIC_MENTORS = [
    {
        "id": 1,
        "name": "Dr. Manjree Pandit",
        "designation": "Pro Vice-Chancellor, Faculty of Engineering & Technology & Chairperson, ISTE Chapter MITS-DU",
        "description": "Dr. Manjree Pandit provides visionary leadership to ISTE MITS, ensuring that the society aligns with professional standards and industry expectations. Under her Guidance, ISTE continues to thrive.",
        "longDescription": "Dr. Manjree Pandit provides visionary leadership to ISTE MITS, ensuring that the society aligns with professional standards and industry expectations.\n\nHer mentorship inspires students to pursue innovation, ethical practices, and continuous growth while fostering a strong technical culture within the institution. She coordinates major initiatives, bringing decades of academic and administrative experience to shape the engineering leaders of tomorrow.",
        "image": "/src/assets/mentors/manjree-pandit.jpg",
        "quote": "Engineering education must empower students to innovate with integrity, purpose, and impact.",
        "email": "manjree.pandit@mitsgwalior.in",
        "linkedin": "https://linkedin.com"
    },
    {
        "id": 2,
        "name": "Dr. Vishal Chaudhary",
        "designation": "Proctor & Faculty Advisor, ISTE Student's Chapter MITS-DU",
        "description": "Dr. Vishal Chaudhary plays a pivotal role in shaping the academic and technical direction of ISTE MITS. Under his guidance, the chapter encourages technical learning.",
        "longDescription": "Dr. Vishal Chaudhary plays a pivotal role in shaping the academic and technical direction of ISTE MITS. With strong expertise in engineering education and student mentoring, he actively promotes innovation, discipline, and excellence.\n\nUnder his guidance, ISTE MITS continues to grow as a platform that encourages technical learning, leadership development, and real-world problem solving. He works closely with the student committees to plan and execute benchmark fests.",
        "image": "/src/assets/mentors/vishal-chaudhary.jpg",
        "quote": "Technical excellence is achieved when theoretical knowledge is put into practice through hands-on innovation.",
        "email": "vishal.chaudhary@mitsgwalior.in",
        "linkedin": "https://linkedin.com"
    }
]

@router.get("/mentors")
def get_mentors(db=Depends(get_db)):
    """Fetches list of faculty mentors from Firestore with static fallback."""
    try:
        docs = db.collection("mentors").stream()
        res = [doc.to_dict() for doc in docs if doc.to_dict()]
        if res:
            return sorted(res, key=lambda x: x.get("id", 0))
    except Exception as e:
        logger.exception("Firestore mentors query failed:")
    return STATIC_MENTORS

@router.get("/committees")
def get_committees(db=Depends(get_db)):
    """Fetches steering student committees from Firestore."""
    try:
        docs = db.collection("team").stream()
        all_members = [doc.to_dict() for doc in docs if doc.to_dict()]
        if all_members:
            committee_order = [
                "Accounts Committee",
                "Technical Committee",
                "Public Relation Committee",
                "Marketing Committee",
                "Graphics Committee",
                "Management Committee",
                "Logistics Committee",
                "Content Committee"
            ]
            grouped = []
            for title in committee_order:
                members = [
                    {
                        "name": m.get("name"),
                        "role": m.get("role"),
                        "linkedin": m.get("linkedin"),
                        "email": m.get("email"),
                        "img": m.get("img")
                    }
                    for m in all_members if m.get("committee") == title
                ]
                if members:
                    grouped.append({
                        "title": title,
                        "members": members
                    })
            return grouped
    except Exception as e:
        logger.exception("Firestore committees query failed:")
    return []

@router.get("/gallery")
def get_gallery(db=Depends(get_db)):
    """Fetches visual gallery assets from Firestore."""
    try:
        docs = db.collection("gallery").stream()
        res = []
        for doc in docs:
            item = doc.to_dict()
            if item and item.get("image") and "unsplash.com" not in item.get("image"):
                res.append(item)
        return res
    except Exception as e:
        logger.exception("Firestore gallery query failed:")
        return []

@router.get("/faqs")
def get_faqs(db=Depends(get_db)):
    """Fetches collapsible frequently asked questions from Firestore."""
    try:
        docs = db.collection("faqs").stream()
        res = [doc.to_dict() for doc in docs]
        if res:
            return res
    except Exception as e:
        logger.exception("Firestore faqs query failed:")
    return [
        {"id": "faq1", "question": "What is ISTE MITS?", "answer": "ISTE (Indian Society for Technical Education) MITS Gwalior is a student chapter dedicated to promoting technical education, professional development, and practical engineering skills."},
        {"id": "faq2", "question": "How can I become a member of ISTE MITS?", "answer": "You can become an official member by registering during our membership drives, typically held at the beginning of the academic year."},
        {"id": "faq3", "question": "Are fests and events open to non-members?", "answer": "Yes, fests like ENIGMA and X-Calibre are open to all students of MITS Gwalior, though members often get exclusive discounts."}
    ]

@router.get("/contact")
def get_contact(db=Depends(get_db)):
    """Fetches official email, phone contacts, and campus coordinates from Firestore settings."""
    try:
        doc = db.collection("settings").document("contact").get()
        if doc.exists:
            return doc.to_dict()
    except Exception as e:
        logger.exception("Firestore contact query failed:")
    
    return {
        "email": "iste.mits.gwl@gmail.com",
        "phone_faizan": "7697827864",
        "phone_prerna": "6260842973",
        "address": "MITS Gwalior, Madhya Pradesh, India"
    }
