import firebase_admin
from firebase_admin import credentials, storage
from utils import ConfigManager
import os

# Load Config
config = ConfigManager()
cred_path = config.get_secret('firebase_service_account_path')

if cred_path and os.path.exists(cred_path):
    try:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        
        print("Listing buckets...")
        # We need to use the underlying google-cloud-storage client
        # firebase_admin.storage.bucket() gets a specific bucket. 
        # To list, we might need to use the GCS client directly if available, 
        # or just try to access the default one and print its name if possible.
        
        # Actually, firebase_admin doesn't expose list_buckets directly easily without gcloud lib.
        # But we can try to guess or just print what happens when we try to access the default.
        
        # Let's try to use the google-cloud-storage client if installed (it is a dependency of firebase-admin)
        from google.cloud import storage as gcs
        client = gcs.Client.from_service_account_json(cred_path)
        buckets = list(client.list_buckets())
        print(f"Found {len(buckets)} buckets:")
        for bucket in buckets:
            print(f" - {bucket.name}")
            
    except Exception as e:
        print(f"Error: {e}")
else:
    print("Credential file not found.")
