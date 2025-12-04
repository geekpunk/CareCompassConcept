from cryptography.fernet import Fernet

key = Fernet.generate_key()
print("Your new encryption key:")
print(key.decode())
print("\nCopy this key to config/secrets.yaml")
