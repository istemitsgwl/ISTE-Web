import logging
import cloudinary
import cloudinary.uploader
import cloudinary.api
from app.config import settings

import os

logger = logging.getLogger("uvicorn")

# Configure Cloudinary credentials
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_image_to_cloudinary(file_bytes: bytes, folder: str = "iste_mits") -> dict:
    """
    Uploads raw image bytes to Cloudinary CDN under specified folder.
    Returns dict with HTTPS secure_url and public_id.
    """
    try:
        response = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type="auto"
        )
        return {
            "url": response.get("secure_url"),
            "public_id": response.get("public_id")
        }
    except Exception as e:
        logger.error(f"Cloudinary upload failed: {e}")
        raise RuntimeError(f"Media asset upload failed: {e}")

def upload_base64_to_cloudinary(base64_str: str, folder: str = "events") -> dict:
    """
    Uploads base64 encoded image string to Cloudinary CDN.
    Returns dict with HTTPS secure_url and public_id.
    """
    try:
        response = cloudinary.uploader.upload(
            base64_str,
            folder=folder,
            resource_type="auto"
        )
        return {
            "url": response.get("secure_url"),
            "public_id": response.get("public_id")
        }
    except Exception as e:
        logger.error(f"Cloudinary base64 upload failed: {e}")
        raise RuntimeError(f"Media asset upload failed: {e}")

def upload_image_to_cloudinary_unified(image_url: str = None, file: any = None, folder: str = "iste_mits") -> dict:
    """
    Unified upload helper for Cloudinary.
    Accepts raw file (UploadFile) or image_url (Base64 string, external URL, or Cloudinary URL).
    Returns a dict with 'url' and 'public_id'.
    """
    # 1. Handle file upload if present
    if file and getattr(file, "filename", None):
        try:
            file.file.seek(0)
            file_bytes = file.file.read()
            response = cloudinary.uploader.upload(
                file_bytes,
                folder=folder,
                resource_type="auto"
            )
            return {
                "url": response.get("secure_url"),
                "public_id": response.get("public_id")
            }
        except Exception as e:
            logger.error(f"Cloudinary file upload failed in unified helper: {e}")
            raise RuntimeError(f"Failed to upload image file to Cloudinary: {e}")

    # 2. Handle image URL / Base64 string
    if image_url and image_url.strip():
        url_str = image_url.strip()
        
        # If it's already a Cloudinary URL from our own cloud, return it
        if "res.cloudinary.com" in url_str:
            public_id = ""
            if "/upload/" in url_str:
                parts = url_str.split("/upload/")
                if len(parts) > 1:
                    # Remove version (starts with v followed by digits, e.g. v17839393/)
                    subparts = parts[1].split("/", 1)
                    if len(subparts) > 1 and subparts[0].startswith("v") and subparts[0][1:].isdigit():
                        path = subparts[1]
                    else:
                        path = parts[1]
                    public_id = path.rsplit(".", 1)[0]
            return {
                "url": url_str,
                "public_id": public_id
            }
            
        # Upload remote URL, base64 data URI, or localhost reference to Cloudinary
        try:
            response = cloudinary.uploader.upload(
                url_str,
                folder=folder,
                resource_type="auto"
            )
            return {
                "url": response.get("secure_url"),
                "public_id": response.get("public_id")
            }
        except Exception as e:
            logger.error(f"Cloudinary upload from URL/Base64 failed in unified helper: {e}")
            if url_str.startswith("data:image/") or url_str.startswith("http") or url_str.startswith("/"):
                return {"url": url_str, "public_id": ""}
            raise RuntimeError(f"Failed to upload image URL/Base64 to Cloudinary: {e}")

    return {"url": "", "public_id": ""}

def delete_image_from_cloudinary(public_id: str) -> bool:
    """
    Deletes an asset from Cloudinary by its public ID.
    """
    try:
        if not public_id:
            return False

        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        logger.error(f"Cloudinary deletion failed for '{public_id}': {e}")
        return False
