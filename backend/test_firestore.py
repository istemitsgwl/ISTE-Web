import sys
import os

# Set gRPC environment variables BEFORE importing gRPC / google / firebase
os.environ["GRPC_DNS_RESOLVER"] = "native"

import traceback
import firebase_admin
from firebase_admin import credentials, firestore

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test():
    print("=" * 60)
    print("STANDALONE FIRESTORE CONNECTIVITY DIAGNOSTIC TOOL")
    print("=" * 60)

    emulator_env = os.environ.get("FIRESTORE_EMULATOR_HOST")
    key_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "app", "serviceAccountKey.json")
    
    print(f"• FIRESTORE_EMULATOR_HOST env var: {emulator_env if emulator_env else 'Not set (Cloud mode active)'}")
    print(f"• GRPC_DNS_RESOLVER: {os.environ.get('GRPC_DNS_RESOLVER')}")
    print(f"• Service Account Key Path: {key_path}")

    cred = credentials.Certificate(key_path)
    print(f"✓ Service Account Key loaded.")
    print(f"✓ Firebase Project ID: '{cred.project_id}'")

    if not firebase_admin._apps:
        app = firebase_admin.initialize_app(cred, {'projectId': cred.project_id})
        print(f"✓ Firebase Admin App initialized: '{app.name}'")
    else:
        app = firebase_admin.get_app()

    db = firestore.client(app=app)
    print(f"✓ Firestore Client created. Target Database ID: '(default)'")

    print("\nExecuting direct read test: db.collection('events').limit(1).get()...")
    
    try:
        docs = db.collection("events").limit(1).get()
        print("\n" + "=" * 60)
        print(f"🎉 SUCCESS! Cloud Firestore connection verified.")
        print(f"Retrieved {len(docs)} documents from project '{cred.project_id}'.")
        for d in docs:
            print(f"   • Document ID: {d.id} | Data keys: {list(d.to_dict().keys())}")
        print("=" * 60)
    except Exception as e:
        print("\n" + "!" * 60)
        print("❌ FIRESTORE READ EXCEPTION:")
        print("!" * 60)
        traceback.print_exc()
        print("!" * 60)

if __name__ == "__main__":
    test()
