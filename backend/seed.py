import os
import sys

# Force gRPC native DNS resolver on macOS to avoid c-ares 503 DNS timeouts
os.environ.setdefault("GRPC_DNS_RESOLVER", "native")

import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta

# Add current dir to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.config import settings

def write_seeding_data(db):
    # 1. Seed Mentors
    print("Writing mentors to Firestore...")
    mentors = [
        {
            "id": 1,
            "name": "Dr. Manjree Pandit",
            "designation": "Pro Vice-Chancellor, Faculty of Engineering & Technology & Chairperson, ISTE Chapter MITS-DU",
            "description": "Dr. Manjree Pandit provides visionary leadership to ISTE MITS, ensuring that the society aligns with professional standards and industry expectations. Under her Guidance, ISTE continues to thrive.",
            "longDescription": "Dr. Manjree Pandit provides visionary leadership to ISTE MITS, ensuring that the society aligns with professional standards and industry expectations.\n\nHer mentorship inspires students to pursue innovation, ethical practices, and continuous growth while fostering a strong technical culture within the institution. She coordinates major initiatives, bringing decades of academic and administrative experience to shape the engineering leaders of tomorrow.",
            "image": "/src/assets/mentors/manjree-pandit.jpg"
        },
        {
            "id": 2,
            "name": "Dr. Vishal Chaudhary",
            "designation": "Proctor & Faculty Advisor, ISTE Student's Chapter MITS-DU",
            "description": "Dr. Vishal Chaudhary plays a pivotal role in shaping the academic and technical direction of ISTE MITS. Under his guidance, the chapter encourages technical learning.",
            "longDescription": "Dr. Vishal Chaudhary plays a pivotal role in shaping the academic and technical direction of ISTE MITS. With strong expertise in engineering education and student mentoring, he actively promotes innovation, discipline, and excellence.\n\nUnder his guidance, ISTE MITS continues to grow as a platform that encourages technical learning, leadership development, and real-world problem solving. He works closely with the student committees to plan and execute benchmark fests.",
            "image": "/src/assets/mentors/vishal-chaudhary.jpg"
        }
    ]
    for mentor in mentors:
        db.collection("mentors").document(str(mentor["id"])).set(mentor)
        
    # 2. Seed Team
    print("Writing team members to Firestore...")
    team_members = [
        {
            "id": "team-static-vidushi-tiwari",
            "name": "Ms. Vidushi Tiwari",
            "role": "Head",
            "committee": "Accounts Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/vidushi-tiwari-43ba331bb",
            "email": "tvidushi1234@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-akshat-jain",
            "name": "Mr. Akshat Jain",
            "role": "Head",
            "committee": "Accounts Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/its-akshat-jain",
            "email": "akshat.jain.contact@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-jatin-guru",
            "name": "Mr. Jatin Guru",
            "role": "Head",
            "committee": "Accounts Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/jatin-guru-643875198",
            "email": "jatinguru3002@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-anurag-mishra",
            "name": "Mr. Anurag Mishra",
            "role": "Head",
            "committee": "Technical Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/anurag-mishra-28b3b6251/",
            "email": "am20anuragmishra@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-anushka-thapa",
            "name": "Ms. Anushka Thapa",
            "role": "Head",
            "committee": "Technical Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/anushkathapa",
            "email": "thapaanushka101@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-abhay-singh-chauhan",
            "name": "Mr. Abhay Singh Chauhan",
            "role": "Head",
            "committee": "Public Relation Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/abhay-singh-chauhan-1173861b9/",
            "email": "abhaysc.26@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-eshita-bhawsar",
            "name": "Ms. Eshita Bhawsar",
            "role": "Head",
            "committee": "Public Relation Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/eshita-bhawsar-552a82255",
            "email": "eshitabhawsar@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-mansa-gupta",
            "name": "Ms. Mansa Gupta",
            "role": "Head",
            "committee": "Marketing Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/mansa-gupta/",
            "email": "mansagupta2004@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-kalindi-mishra",
            "name": "Ms. Kalindi Mishra",
            "role": "Head",
            "committee": "Marketing Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/kalindi-mishra-04193525b",
            "email": "kalindimishra2626@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-priyanka-sikarwar",
            "name": "Ms. Priyanka Sikarwar",
            "role": "Head",
            "committee": "Management Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/priyanka-sikarwar-11340b289",
            "email": "sikarwarpriyanka9304@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-aman-bhadoria",
            "name": "Mr. Aman Bhadoria",
            "role": "Head",
            "committee": "Management Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/aman-bhadoria-239138217",
            "email": "amanbhadoria.304@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-ishita-sharma",
            "name": "Ms. Ishita Sharma",
            "role": "Head",
            "committee": "Logistics Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/ishita-sharma-19363b277",
            "email": "ishitasharma282004@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-shreyank-choudhary",
            "name": "Mr. Shreyank Choudhary",
            "role": "Head",
            "committee": "Logistics Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/shreyank-choudhary",
            "email": "shreyankchoudhary@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-tanmay-sawankar",
            "name": "Mr. Tanmay Sawankar",
            "role": "Head",
            "committee": "Content Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/tanmay-sawankar-57a945223",
            "email": "tanmaysawankar4441@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        },
        {
            "id": "team-static-ayushi-ranjan",
            "name": "Ms. Ayushi Ranjan",
            "role": "Head",
            "committee": "Content Committee",
            "img": "",
            "linkedin": "https://www.linkedin.com/in/ayushi2910",
            "email": "itsayushiranjan@gmail.com",
            "storagePath": "",
            "createdAt": datetime.utcnow().isoformat()
        }
    ]
    for member in team_members:
        db.collection("team").document(member["id"]).set(member)

    # 3. Seed Events
    print("Writing events to Firestore...")
    events = [
        {
            "id": "enigma-2025",
            "title": "ENIGMA 2025",
            "description": "A multi-day flagship technical fest featuring state-of-the-art seminars, coding hackathons, creative visual design competitions, and tech gaming arenas.",
            "category": "Technical Fest",
            "date": "12th-15th February 2025",
            "venue": "MITS Campus Auditorium",
            "status": "completed",
            "bannerImage": "/src/assets/Events/enigma-2025.jpg",
            "image": "/src/assets/Events/enigma-2025.jpg",
            "speakers": [
                {"name": "Ankit Prasad", "designation": "Founder, Bobble AI", "imageUrl": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200"}
            ],
            "customFieldsSchema": [
                {"fieldName": "Full Name", "fieldType": "text", "required": True},
                {"fieldName": "Enrollment Number", "fieldType": "text", "required": True},
                {"fieldName": "Branch", "fieldType": "text", "required": True},
                {"fieldName": "Year", "fieldType": "select", "options": ["1st Year", "2nd Year", "3rd Year", "4th Year"], "required": True},
                {"fieldName": "College Name", "fieldType": "text", "required": True},
                {"fieldName": "Phone Number", "fieldType": "text", "required": True}
            ]
        },
        {
            "id": "x-calibre-2025",
            "title": "X-Calibre 2025",
            "description": "The flagship mock placement event organized by ISTE. Featuring real-world aptitude screening tests, rigorous group discussions, and technical mock interviews conducted by industry tech heads.",
            "category": "Mock Placement",
            "date": "26th-28th September 2025",
            "venue": "Seminar Hall & LABS",
            "status": "upcoming",
            "bannerImage": "/src/assets/Events/xcalibire-23.jpg",
            "image": "/src/assets/Events/xcalibire-23.jpg",
            "speakers": [],
            "customFieldsSchema": [
                {"fieldName": "Full Name", "fieldType": "text", "required": True},
                {"fieldName": "Enrollment Number", "fieldType": "text", "required": True},
                {"fieldName": "Branch", "fieldType": "text", "required": True},
                {"fieldName": "Year", "fieldType": "select", "options": ["1st Year", "2nd Year", "3rd Year", "4th Year"], "required": True},
                {"fieldName": "College Name", "fieldType": "text", "required": True},
                {"fieldName": "Phone Number", "fieldType": "text", "required": True}
            ]
        },
        {
            "id": "e-summit-2024",
            "title": "E-Summit 2024",
            "description": "An entrepreneurial festival promoting finance & startup skills with workshops, expert panels, and business pitch competitions.",
            "category": "Entrepreneurship Fest",
            "date": "3rd-5th February 2024",
            "venue": "Main Campus & Online",
            "status": "completed",
            "bannerImage": "/src/assets/Events/e-summit-iste.jpg",
            "image": "/src/assets/Events/e-summit-iste.jpg",
            "speakers": [
                {"name": "Dr. A.K. Dwivedi", "designation": "EDII Director", "imageUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
            ],
            "customFieldsSchema": [
                {"fieldName": "Full Name", "fieldType": "text", "required": True},
                {"fieldName": "Enrollment Number", "fieldType": "text", "required": True},
                {"fieldName": "Branch", "fieldType": "text", "required": True},
                {"fieldName": "Year", "fieldType": "select", "options": ["1st Year", "2nd Year", "3rd Year", "4th Year"], "required": True},
                {"fieldName": "College Name", "fieldType": "text", "required": True},
                {"fieldName": "Phone Number", "fieldType": "text", "required": True}
            ]
        }
    ]
    for event in events:
        event_id = event["id"]
        event["createdAt"] = datetime.utcnow().isoformat()
        event["updatedAt"] = datetime.utcnow().isoformat()
        db.collection("events").document(event_id).set(event)

    # 4. Seed FAQs
    print("Writing FAQs to Firestore...")
    faqs = [
        {"id": "faq1", "question": "What is ISTE MITS?", "answer": "ISTE (Indian Society for Technical Education) MITS Gwalior is a student chapter dedicated to promoting technical education, professional development, and practical engineering skills."},
        {"id": "faq2", "question": "How can I become a member of ISTE MITS?", "answer": "You can become an official member by registering during our membership drives, typically held at the beginning of the academic year."},
        {"id": "faq3", "question": "Are fests and events open to non-members?", "answer": "Yes, fests like ENIGMA and X-Calibre are open to all students of MITS Gwalior, though members often get exclusive discounts."}
    ]
    for faq in faqs:
        db.collection("faqs").document(faq["id"]).set(faq)

    # 5. Seed Settings
    print("Writing Contact settings to Firestore...")
    db.collection("settings").document("contact").set({
        "email": "iste.mits.gwl@gmail.com",
        "phone_faizan": "7697827864",
        "phone_prerna": "6260842973",
        "address": "MITS Gwalior, Madhya Pradesh, India"
    })

def seed_db():
    print("Initializing Firebase Admin for seeding...")
    
    # Initialize Firebase
    if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
        print(f"Loading credentials from: {settings.FIREBASE_CREDENTIALS_PATH}")
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
    else:
        try:
            firebase_admin.initialize_app()
        except ValueError:
            pass
            
    db = firestore.client()
    
    try:
        write_seeding_data(db)
        print("Firestore database seeding successfully completed in the Cloud!")
    except Exception as e:
        error_msg = str(e)
        if "firestore.googleapis.com" in error_msg or "DNS" in error_msg or "unavailable" in error_msg.lower() or "timeout" in error_msg.lower():
            print("\n⚠️  [NETWORK ERROR] Could not connect to Google Cloud Firestore (DNS lookup failed or offline).")
            print("🔄  [SELF-HEALING] Re-routing database writes to local offline Emulator (127.0.0.1:8080)...")
            
            # Re-route to emulator host
            os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"
            db = firestore.client()
            
            try:
                write_seeding_data(db)
                print("✅  [SUCCESS] Database seeded successfully in your local offline Emulator!")
            except Exception as retry_err:
                print(f"❌  [ERROR] Offline emulator database write failed: {retry_err}")
                print("💡  Please start the offline emulator suite first: npm run dev:emulator")
        else:
            print(f"❌  [ERROR] Database seeding failed: {e}")

if __name__ == "__main__":
    seed_db()
