import yaml
from cryptography.fernet import Fernet
import base64

try:
    with open('../config/secrets.yaml', 'r') as f:
        config = yaml.safe_load(f)
        
    key = config.get('encryption_key')
    print(f"Loaded key: '{key}'")
    print(f"Key type: {type(key)}")
    print(f"Key length: {len(key)}")
    
    try:
        # Try to decode to check validity
        decoded = base64.urlsafe_b64decode(key)
        print(f"Decoded length: {len(decoded)} bytes")
        if len(decoded) != 32:
            print("ERROR: Decoded key is not 32 bytes!")
    except Exception as e:
        print(f"Base64 decode error: {e}")

    f = Fernet(key)
    print("Fernet initialized successfully!")
    
except Exception as e:
    print(f"Error: {e}")
