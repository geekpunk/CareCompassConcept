import yaml
import os
from cryptography.fernet import Fernet

def load_config(path):
    try:
        with open(path, 'r') as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        print(f"WARNING: Config file not found at {path}")
        return {}

class ConfigManager:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.secrets = load_config(os.path.join(base_dir, '../config/secrets.yaml'))
        self.settings = load_config(os.path.join(base_dir, '../config/settings.yaml'))

    def get_secret(self, key):
        # Check environment variable first (uppercase)
        env_key = key.upper()
        env_val = os.environ.get(env_key)
        if env_val:
            print(f"DEBUG: Loaded secret '{key}' from Environment Variable '{env_key}'")
            return env_val
        
        file_val = self.secrets.get(key)
        if file_val:
            print(f"DEBUG: Loaded secret '{key}' from secrets.yaml")
            return file_val
            
        print(f"WARNING: Secret '{key}' not found in Environment or secrets.yaml")
        return None

    def get_setting(self, key):
        return self.settings.get(key)

class CryptoManager:
    def __init__(self, key):
        self.fernet = Fernet(key)

    def encrypt(self, data):
        if isinstance(data, str):
            return self.fernet.encrypt(data.encode()).decode()
        return data

    def decrypt(self, data):
        if isinstance(data, str):
            try:
                return self.fernet.decrypt(data.encode()).decode()
            except:
                return data # Return original if not encrypted or fails
        return data

    def encrypt_dict(self, data_dict):
        encrypted = {}
        for k, v in data_dict.items():
            if k in ['id', 'createdAt', 'lastUpdate', 'userId']: # Don't encrypt ID, userId or timestamps needed for sorting/querying
                encrypted[k] = v
            elif isinstance(v, (dict, list)):
                 # Simple recursive encryption could be added here, 
                 # but for now let's just encrypt top level strings or JSON dump
                 import json
                 encrypted[k] = self.encrypt(json.dumps(v))
            else:
                encrypted[k] = self.encrypt(str(v))
        return encrypted

    def decrypt_dict(self, data_dict):
        decrypted = {}
        for k, v in data_dict.items():
            if k in ['id', 'createdAt', 'lastUpdate', 'userId']:
                decrypted[k] = v
            else:
                val = self.decrypt(v)
                # Try to parse back to json if possible
                import json
                try:
                    decrypted[k] = json.loads(val)
                except:
                    decrypted[k] = val
        return decrypted
