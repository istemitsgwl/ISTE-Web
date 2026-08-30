import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from app.dependencies import require_admin, get_mongo_db
from app.cloudinary_service import upload_image_to_cloudinary_unified, delete_image_from_cloudinary

logger = logging.getLogger("uvicorn")
router = APIRouter(prefix="/content", tags=["Public Content Engine"])

STATIC_MENTORS = [
    {
        "id": 1,
        "name": "Dr. Manjree Pandit",
        "designation": "Pro-Vice-Chancellor, MITS Deemed University & Chairperson, ISTE Chapter MITS-DU",
        "description": "Dr. Manjree Pandit provides visionary leadership to ISTE MITS, ensuring that the society aligns with professional standards and industry expectations.",
        "longDescription": "Dr. Manjree Pandit provides visionary leadership to ISTE MITS, ensuring that the society aligns with professional standards and industry expectations.\n\nHer mentorship inspires students to pursue innovation, ethical practices, and continuous growth.",
        "image": "/assets/mentors/manjree-pandit.jpg",
        "quote": "Engineering education must empower students to innovate with integrity, purpose, and impact.",
        "email": "manjree.pandit@mitsgwalior.in",
        "linkedin": "https://linkedin.com"
    },
    {
        "id": 2,
        "name": "Dr. Vishal Chaudhary",
        "designation": "Proctor & Faculty Advisor, ISTE Student's Chapter MITS-DU",
        "description": "Dr. Vishal Chaudhary plays a pivotal role in shaping the academic and technical direction of ISTE MITS.",
        "longDescription": "Dr. Vishal Chaudhary plays a pivotal role in shaping the academic and technical direction of ISTE MITS. With strong expertise in engineering education and student mentoring, he actively promotes innovation, discipline, and excellence.",
        "image": "/assets/mentors/vishal-chaudhary.jpg",
        "quote": "Technical excellence is achieved when theoretical knowledge is put into practice through hands-on innovation.",
        "email": "vishal.chaudhary@mitsgwalior.in",
        "linkedin": "https://linkedin.com"
    }
]

@router.get("/mentors")
async def get_mentors(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """Fetches list of faculty mentors from MongoDB with static fallback."""
    try:
        cursor = db.mentors.find()
        res = []
        async for doc in cursor:
            doc["id"] = doc.get("id") or str(doc["_id"])
            doc.pop("_id", None)
            if doc.get("id") == 1 or doc.get("name") == "Dr. Manjree Pandit" or "manjree" in str(doc.get("name", "")).lower():
                doc["designation"] = "Pro-Vice-Chancellor, MITS Deemed University & Chairperson, ISTE Chapter MITS-DU"
            res.append(doc)
        if res:
            return sorted(res, key=lambda x: x.get("id", 0))
    except Exception as e:
        logger.exception("MongoDB mentors query failed:")
    
    return STATIC_MENTORS
    return STATIC_MENTORS

@router.get("/committees")
async def get_committees(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """Fetches steering student committees from MongoDB."""
    try:
        cursor = db.team.find()
        all_members = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            all_members.append(doc)

        if all_members:
            committee_order = [
                "Executive Steering Committee",
                "Technical Committee",
                "Management Committee",
                "Marketing Committee",
                "Graphics Committee",
                "Accounts Committee",
                "Public Relation Committee",
                "Logistics Committee",
                "Content Committee"
            ]
            grouped = []
            seen_committees = set()
            for title in committee_order:
                members = [m for m in all_members if m.get("committee") == title]
                if members:
                    grouped.append({
                        "title": title,
                        "members": members
                    })
                    seen_committees.add(title)

            # Catch any custom committee names added by admin
            custom_committees = set(m.get("committee") for m in all_members if m.get("committee")) - seen_committees
            for title in custom_committees:
                members = [m for m in all_members if m.get("committee") == title]
                if members:
                    grouped.append({
                        "title": title,
                        "members": members
                    })
            return grouped
    except Exception as e:
        logger.exception("MongoDB committees query failed:")
    return []

@router.get("/team")
async def get_team_members(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """Fetches flat list of all team members from MongoDB for CMS admin panel."""
    try:
        cursor = db.team.find()
        members = []
        async for doc in cursor:
            doc["id"] = doc.get("id") or str(doc["_id"])
            doc.pop("_id", None)
            members.append(doc)
        return members
    except Exception as e:
        logger.exception("MongoDB team query failed:")
        return []

@router.post("/team", status_code=status.HTTP_201_CREATED)
async def save_team_member(
    id: str = Form(None),
    name: str = Form(...),
    role: str = Form(...),
    committee: str = Form(...),
    email: str = Form(""),
    linkedin: str = Form(""),
    imageUrl: str = Form(""),
    file: UploadFile = File(None),
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Creates or updates a steering committee member (Admin only)."""
    # Determine if any new image resource was provided
    has_new_file = file and getattr(file, "filename", None)
    has_new_url = imageUrl and imageUrl.strip()
    
    img_url = ""
    cloudinary_public_id = ""

    if has_new_file or has_new_url:
        try:
            res = upload_image_to_cloudinary_unified(image_url=imageUrl, file=file, folder="team")
            img_url = res.get("url", "")
            cloudinary_public_id = res.get("public_id", "")
        except Exception as e:
            logger.error(f"Unified upload failed for team member: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload profile image."
            )

    member_doc = {
        "name": name.strip(),
        "role": role.strip(),
        "committee": committee.strip(),
        "email": email.strip(),
        "linkedin": linkedin.strip(),
        "image": img_url,
        "cloudinaryPublicId": cloudinary_public_id,
        "updatedAt": datetime.utcnow()
    }

    if id:
        oid = None
        try:
            oid = ObjectId(id)
        except Exception:
            pass
            
        if oid:
            old_doc = await db.team.find_one({"$or": [{"_id": oid}, {"id": id}]})
        else:
            old_doc = await db.team.find_one({"id": id})

        if old_doc:
            if not has_new_file and not has_new_url:
                # Keep old image
                member_doc["image"] = old_doc.get("image", "")
                member_doc["cloudinaryPublicId"] = old_doc.get("cloudinaryPublicId", "")
            else:
                # Delete the old Cloudinary asset if a new one was uploaded and is different
                old_pub_id = old_doc.get("cloudinaryPublicId")
                if old_pub_id and old_pub_id != cloudinary_public_id:
                    delete_image_from_cloudinary(old_pub_id)
                
        if oid:
            await db.team.update_one({"$or": [{"_id": oid}, {"id": id}]}, {"$set": member_doc})
        else:
            await db.team.update_one({"id": id}, {"$set": member_doc})

        member_doc["id"] = id
        if "_id" in member_doc:
            member_doc.pop("_id", None)
        return member_doc
    else:
        # Require image when creating a member
        if not member_doc["image"]:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Profile photo is required")
        member_doc["createdAt"] = datetime.utcnow()
        res = await db.team.insert_one(member_doc)
        member_doc["id"] = str(res.inserted_id)
        if "_id" in member_doc:
            member_doc.pop("_id", None)
        return member_doc

@router.delete("/team/{memberId}")
async def delete_team_member(
    memberId: str,
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Deletes a steering committee member and their Cloudinary image (Admin only)."""
    oid = None
    try:
        oid = ObjectId(memberId)
    except Exception:
        pass

    if oid:
        doc = await db.team.find_one({"$or": [{"_id": oid}, {"id": memberId}]})
    else:
        doc = await db.team.find_one({"id": memberId})

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team member not found")

    if doc.get("cloudinaryPublicId"):
        delete_image_from_cloudinary(doc.get("cloudinaryPublicId"))

    if oid:
        await db.team.delete_one({"$or": [{"_id": oid}, {"id": memberId}]})
    else:
        await db.team.delete_one({"id": memberId})

    return {"message": "Team member deleted successfully", "id": memberId}

def parse_gallery_timestamp(doc: dict) -> float:
    raw = doc.get("createdAt") or doc.get("updatedAt")
    if isinstance(raw, datetime):
        return raw.timestamp()
    if isinstance(raw, (int, float)):
        return float(raw)
    if isinstance(raw, str):
        try:
            return datetime.fromisoformat(raw.replace("Z", "+00:00")).timestamp()
        except Exception:
            pass
    obj_id = doc.get("_id") or doc.get("id")
    if isinstance(obj_id, ObjectId):
        return obj_id.generation_time.timestamp()
    if isinstance(obj_id, str) and ObjectId.is_valid(obj_id):
        return ObjectId(obj_id).generation_time.timestamp()
    return 0.0

@router.get("/gallery")
async def get_gallery(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """Fetches visual gallery assets from MongoDB sorted descending by creation date (newest first)."""
    try:
        cursor = db.gallery.find().sort([("createdAt", -1), ("_id", -1)])
        res = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            doc.pop("_id", None)
            if doc.get("image"):
                res.append(doc)
        
        # Sort in Python using parse_gallery_timestamp to guarantee reverse chronological order (newest first)
        res.sort(key=parse_gallery_timestamp, reverse=True)
        return res
    except Exception as e:
        logger.exception("MongoDB gallery query failed:")
        return []

@router.post("/gallery", status_code=status.HTTP_201_CREATED)
async def upload_gallery_image(
    title: str = Form(...),
    category: str = Form("Events"),
    file: UploadFile = File(None),
    imageUrl: str = Form(None),
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Uploads a gallery image (Cloudinary / Direct URL) and stores document in MongoDB with creation timestamp."""
    try:
        res = upload_image_to_cloudinary_unified(image_url=imageUrl, file=file, folder="gallery")
        image_url = res.get("url", "")
        cloudinary_public_id = res.get("public_id", "")
    except Exception as e:
        logger.error(f"Unified upload failed for gallery: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload gallery image."
        )

    if not image_url:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Image file or valid image URL required")

    now = datetime.utcnow()
    doc = {
        "title": title.strip(),
        "category": category,
        "image": image_url,
        "cloudinaryPublicId": cloudinary_public_id,
        "createdAt": now,
        "updatedAt": now
    }

    res = await db.gallery.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc

@router.put("/gallery/{imageId}")
async def update_gallery_image(
    imageId: str,
    title: str = Form(None),
    category: str = Form(None),
    file: UploadFile = File(None),
    imageUrl: str = Form(None),
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Updates an existing gallery item while preserving creation timestamp."""
    oid = None
    try:
        oid = ObjectId(imageId)
    except Exception:
        pass

    query_filter = {"$or": [{"_id": oid}, {"id": imageId}]} if oid else {"id": imageId}
    existing = await db.gallery.find_one(query_filter)
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")

    update_fields = {"updatedAt": datetime.utcnow()}
    if title is not None and title.strip():
        update_fields["title"] = title.strip()
    if category is not None and category.strip():
        update_fields["category"] = category.strip()

    has_new_file = file and getattr(file, "filename", None)
    has_new_url = imageUrl and imageUrl.strip()

    if has_new_file or has_new_url:
        try:
            res = upload_image_to_cloudinary_unified(image_url=imageUrl, file=file, folder="gallery")
            new_url = res.get("url", "")
            new_public_id = res.get("public_id", "")
            
            # Delete old image if a new one was uploaded and is different
            old_pub_id = existing.get("cloudinaryPublicId")
            if old_pub_id and old_pub_id != new_public_id:
                delete_image_from_cloudinary(old_pub_id)
                
            update_fields["image"] = new_url
            update_fields["cloudinaryPublicId"] = new_public_id
        except Exception as e:
            logger.error(f"Unified upload failed for gallery update: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload updated gallery image."
            )

    await db.gallery.update_one(query_filter, {"$set": update_fields})
    updated_doc = await db.gallery.find_one(query_filter)
    updated_doc["id"] = str(updated_doc["_id"])
    updated_doc.pop("_id", None)
    return updated_doc

@router.delete("/gallery/{imageId}")
async def delete_gallery_image(
    imageId: str,
    admin_user: dict = Depends(require_admin),
    db: AsyncIOMotorDatabase = Depends(get_mongo_db)
):
    """Deletes a gallery image from Cloudinary and MongoDB."""
    oid = None
    try:
        oid = ObjectId(imageId)
    except Exception:
        pass

    query_filter = {"$or": [{"_id": oid}, {"id": imageId}, {"_id": imageId}]} if oid else {"$or": [{"id": imageId}, {"_id": imageId}]}
    doc = await db.gallery.find_one(query_filter)

    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Gallery item not found")

    if doc.get("cloudinaryPublicId"):
        try:
            delete_image_from_cloudinary(doc.get("cloudinaryPublicId"))
        except Exception as e:
            logger.warning(f"Failed to delete Cloudinary asset for gallery item {imageId}: {e}")

    await db.gallery.delete_one(query_filter)
    return {"message": "Gallery item deleted successfully", "id": imageId}

@router.get("/faqs")
async def get_faqs():
    """Fetches collapsible frequently asked questions (Static Module)."""
    return [
        {"id": "faq1", "question": "What is ISTE MITS?", "answer": "ISTE (Indian Society for Technical Education) MITS Gwalior is a student chapter dedicated to promoting technical education, professional development, and practical engineering skills."},
        {"id": "faq2", "question": "How can I become a member of ISTE MITS?", "answer": "You can become an official member by registering during our membership drives, typically held at the beginning of the academic year."},
        {"id": "faq3", "question": "Are fests and events open to non-members?", "answer": "Yes, fests like ENIGMA and X-Calibre are open to all students of MITS Gwalior."},
        {"id": "faq4", "question": "Will I receive a certificate for attending workshops?", "answer": "Yes, authorized digital certificates are issued to all registered participants who complete workshops or secure positions in our contests."},
        {"id": "faq5", "question": "How do I register for an event?", "answer": "Simply navigate to the Events page, click on any active/upcoming event, and click the Register button. Fill out the required details and complete the registration."}
    ]

@router.get("/contact")
async def get_contact(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """Fetches official contact details from MongoDB settings collection."""
    try:
        doc = await db.settings.find_one({"_id": "contact"})
        if doc:
            doc.pop("_id", None)
            return doc
    except Exception as e:
        logger.exception("MongoDB contact query failed:")
    
    return {
        "email": "iste.mits.gwl@gmail.com",
        "phone": "9926245805",
        "address": "MITS Gwalior, Madhya Pradesh, India"
    }
