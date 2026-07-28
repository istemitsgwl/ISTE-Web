import vishalImg from "../assets/mentors/vishal-chaudhary.jpg";
import manjreeImg from "../assets/mentors/manjree-pandit.jpg";

import Esummit from "../assets/Events/e-summit-iste.jpg";
import Enigma from "../assets/Events/enigma-2025.webp";
import Xcalibre from "../assets/Events/xcalibire-23.webp";

export const mentors = [
  {
    id: 1,
    name: "Dr. Manjree Pandit",
    designation: "Pro Vice-Chancellor, Faculty of Engineering & Technology & Chairperson, ISTE Chapter MITS-DU",
    description: `Dr. Manjree Pandit provides visionary leadership to ISTE MITS, ensuring that the society aligns with professional standards and industry expectations. Under her Guidance, ISTE continues to thrive.`,
    longDescription: `Dr. Manjree Pandit provides visionary leadership to ISTE MITS, ensuring that the society aligns with professional standards and industry expectations.

Her mentorship inspires students to pursue innovation, ethical practices, and continuous growth while fostering a strong technical culture within the institution. She coordinates major initiatives, bringing decades of academic and administrative experience to shape the engineering leaders of tomorrow.`,
    image: manjreeImg,
  },
  {
    id: 2,
    name: "Dr. Vishal Chaudhary",
    designation: "Proctor & Faculty Advisor, ISTE Student's Chapter MITS-DU",
    description: `Dr. Vishal Chaudhary plays a pivotal role in shaping the academic and technical direction of ISTE MITS. Under his guidance, the chapter encourages technical learning.`,
    longDescription: `Dr. Vishal Chaudhary plays a pivotal role in shaping the academic and technical direction of ISTE MITS. With strong expertise in engineering education and student mentoring, he actively promotes innovation, discipline, and excellence.

Under his guidance, ISTE MITS continues to grow as a platform that encourages technical learning, leadership development, and real-world problem solving. He works closely with the student committees to plan and execute benchmark fests.`,
    image: vishalImg,
  }
];

export const events = [
  {
    id: "x-calibre-2025",
    title: "X-Calibre 2025",
    date: "26th-28th September 2025",
    category: "Mock Placement",
    bannerImage: Xcalibre,
    image: Xcalibre,
    desc: "A preparation event with aptitude tests, group discussions & interviews to boost placement readiness.",
    venue: "Seminar Hall & LABS",
    status: "upcoming",
    speakers: [],
  },
  {
    id: "enigma-2025",
    title: "ENIGMA 2025",
    date: "7th – 9th February 2025",
    category: "Technical Fest",
    bannerImage: Enigma,
    image: Enigma,
    desc: "A multi-day technical event featuring seminars, competitions, gaming & creative activities.",
    venue: "MITS Campus Auditorium",
    status: "completed",
    speakers: [
      {
        name: "Ankit Prasad",
        designation: "Founder, Bobble AI",
        imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200",
      }
    ],
  },
  {
    id: "e-summit-2024",
    title: "E-Summit 2024",
    date: "3rd–5th February 2024",
    category: "Entrepreneurship Fest",
    bannerImage: Esummit,
    image: Esummit,
    desc: "An entrepreneurial festival promoting finance & startup skills with workshops and business competitions.",
    venue: "Main Campus & Online",
    status: "completed",
    speakers: [
      {
        name: "Dr. A.K. Dwivedi",
        designation: "EDII Director",
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      }
    ],
  }
];



export const faqs = [
  {
    question: "What is ISTE MITS?",
    answer: "ISTE (Indian Society for Technical Education) MITS Gwalior is a student-run chapter dedicated to promoting technical education, professional development, and practical engineering skills through expert-led workshops, hackathons, and national fests."
  },
  {
    question: "How can I become a member of ISTE MITS?",
    answer: "You can become an official member by registering during our membership drives, typically held at the beginning of the academic year. You can also visit our Contact section or follow us on our Linktree link for current membership forms."
  },
  {
    question: "Are fests and events open to non-members?",
    answer: "Yes, most of our flagship fests like ENIGMA and X-Calibre are open to all students of MITS Gwalior as well as students from other colleges, though members often get exclusive discounts on paid events."
  },
  {
    question: "Will I receive a certificate for attending workshops?",
    answer: "Yes, authorized digital certificates are issued to all registered participants who complete workshops or secure positions in our contests."
  },
  {
    question: "How do I register for an event?",
    answer: "Simply navigate to the Events page, click on any active/upcoming event, and click the Register button. Fill out the required details and complete the secure payment if it is a paid event."
  }
];
