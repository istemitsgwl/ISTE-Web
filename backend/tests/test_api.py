from fastapi.testclient import TestClient
import sys
import os

# Add parent path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configure emulator environment variable before importing app modules to avoid DNS lookup timeouts
os.environ["FIRESTORE_EMULATOR_HOST"] = "127.0.0.1:8080"

from app.main import app

client = TestClient(app)

def test_read_root():
    """Asserts root details status returning code 200."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "active"
    assert "api_documentation" in data

def test_get_events_public():
    """Asserts public access to fetch listed fests returns 200."""
    response = client.get("/api/events")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_profile_unauthorized():
    """Asserts authentication headers requirement checks returning 422 (if authorization header missing)."""
    response = client.get("/api/users/profile")
    # Missing authorization header triggers 422 validation error
    assert response.status_code == 422
