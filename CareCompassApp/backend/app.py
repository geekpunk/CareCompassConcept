from flask import Flask, request, jsonify, g, Response, stream_with_context
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import FieldFilter
import google.generativeai as genai
from utils import ConfigManager, CryptoManager
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Load Config
config = ConfigManager()

@app.route('/')
def health_check():
    return "CareCompass Backend is Running!", 200

# Setup Crypto
encryption_key = config.get_secret('encryption_key')
if not encryption_key or encryption_key == "YOUR_ENCRYPTION_KEY_HERE":
    print("WARNING: Using a dummy encryption key for this session.")
    from cryptography.fernet import Fernet
    encryption_key = Fernet.generate_key()
    
crypto = CryptoManager(encryption_key)

# Setup Firebase
cred_json = config.get_secret('firebase_service_account_json')
cred = None

if cred_json:
    try:
        print("DEBUG: Loading Firebase creds from JSON environment variable")
        # Try parsing as direct JSON first
        try:
            cred_dict = json.loads(cred_json)
        except json.JSONDecodeError:
            # If that fails, try decoding from Base64
            import base64
            print("DEBUG: JSON parse failed, attempting Base64 decode...")
            decoded_json = base64.b64decode(cred_json).decode('utf-8')
            cred_dict = json.loads(decoded_json)
            
        cred = credentials.Certificate(cred_dict)
    except Exception as e:
        print(f"Error parsing FIREBASE_SERVICE_ACCOUNT_JSON: {e}")

if not cred:
    cred_path = config.get_secret('firebase_service_account_path')
    if cred_path:
        # Resolve relative path
        if not os.path.isabs(cred_path):
            base_dir = os.path.dirname(os.path.abspath(__file__))
            cred_path = os.path.join(base_dir, cred_path)

        print(f"DEBUG: Attempting to load Firebase creds from: {cred_path}")
        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
        else:
            print(f"WARNING: Firebase credentials file not found at {cred_path}")

db = None
if cred:
    try:
        # Initialize with storage bucket
        # Initialize with storage bucket
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'carecompass-76a6a.firebasestorage.app'
        })
        db = firestore.client()
        from firebase_admin import storage
        bucket = storage.bucket()
        print("Firebase initialized successfully with Storage.")
    except Exception as e:
        print(f"Error initializing Firebase: {e}")
else:
    print(f"WARNING: Firebase credentials not found at {cred_path}. Using in-memory store.")
    in_memory_store = {}

# ... (rest of file) ...



# Setup Gemini
api_key = config.get_secret('gemini_api_key')
if api_key and api_key != "YOUR_GEMINI_API_KEY_HERE":
    genai.configure(api_key=api_key)
else:
    print("WARNING: Gemini API Key not set.")

from functools import wraps
from firebase_admin import auth

def verify_token(id_token):
    # Check if Firebase is initialized
    if not firebase_admin._apps:
        # Fallback for dev without service account: Decode without verification
        # WARNING: This is insecure and should only be used for local dev/testing
        try:
            parts = id_token.split('.')
            if len(parts) == 3:
                import base64
                import json
                payload = parts[1]
                # Fix padding
                padded = payload + '=' * (4 - len(payload) % 4)
                decoded = base64.urlsafe_b64decode(padded)
                data = json.loads(decoded)
                print(f"WARNING: Using unverified token for user {data.get('sub')}")
                return {'uid': data['sub'], 'email': data.get('email', 'unknown')}
        except Exception as e:
            print(f"Manual token decode failed: {e}")
        return None

    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        print(f"Token verification failed: {e}")
        return None

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized'}), 401
        
        token = auth_header.split(' ')[1]
        user = verify_token(token)
        if not user:
            return jsonify({'error': 'Invalid token'}), 401
            
        g.user = user
        print(f"Request by User: {g.user.get('uid')} ({g.user.get('email')})")
        return f(*args, **kwargs)
    return decorated_function

@app.route('/api/chat', methods=['POST'])
@login_required
def chat():
    data = request.json
    prompt = data.get('prompt')
    history = data.get('history', [])
    context = data.get('context', '')
    image_base64 = data.get('image') # Optional
    mime_type = data.get('mimeType', 'image/jpeg')
    
    # Handle fileId reference (avoids frontend CORS issues)
    file_id = data.get('fileId')
    patient_id = data.get('patientId')
    
    if file_id and patient_id and db:
        try:
            print(f"Fetching file {file_id} for patient {patient_id} from storage...")
            # Fetch file metadata to get path
            # Note: We need to decrypt metadata if it was encrypted
            f_doc = db.collection('patients').document(patient_id).collection('files').document(file_id).get()
            if f_doc.exists:
                f_data = crypto.decrypt_dict(f_doc.to_dict())
                blob = bucket.blob(f_data['path'])
                content = blob.download_as_bytes()
                import base64
                image_base64 = base64.b64encode(content).decode('utf-8')
                mime_type = f_data.get('type', 'image/jpeg')
                print(f"Successfully loaded file from storage. Type: {mime_type}, Size: {len(content)}")
            else:
                print(f"File document {file_id} not found.")
        except Exception as e:
            print(f"Error fetching file from storage: {e}")
            # Fallback or error? We'll continue and let Gemini fail if image is missing but expected


    from prompts import SYSTEM_PROMPT_TEMPLATE
    
    system_instruction = SYSTEM_PROMPT_TEMPLATE.format(
        context=context if context else "No specific patient details provided yet."
    )

    print("\n--- LLM REQUEST START ---")
    print(f"System Instruction:\n{system_instruction}")
    print(f"User Prompt: {prompt}")
    print(f"Context Provided: {context}")
    print(f"History Length: {len(history)} messages")
    print("--- LLM REQUEST END ---\n")

    model_name = config.get_setting('gemini_model')
    model = genai.GenerativeModel(
        model_name=model_name,
        system_instruction=system_instruction
    )

    chat_history = []
    # Convert history format
    for msg in history:
        role = "user" if msg.get('sender') == 'user' else "model"
        chat_history.append({
            "role": role,
            "parts": [{"text": msg.get('text', '')}]
        })

    # Add the new message
    parts = [{"text": prompt}]
    if image_base64:
        mime_type = data.get('mimeType', 'image/jpeg')
        parts.append({
            "mime_type": mime_type,
            "data": image_base64
        })
    
    try:
        # We use start_chat for history context, but if there's an image we might need generate_content
        # with the history manually appended or just use generate_content for single turn with context if the lib is tricky.
        # The python lib's ChatSession doesn't easily support images in the middle of history in all versions, 
        # but let's try the standard chat.send_message.
        
        chat = model.start_chat(history=chat_history)
        response = chat.send_message(parts, stream=True)

        def generate():
            for chunk in response:
                if chunk.text:
                    yield chunk.text

        return Response(stream_with_context(generate()), mimetype='text/plain')
    except Exception as e:
        print(f"Gemini Error: {e}")
        return jsonify({"text": "I'm having trouble connecting to the service right now. Please check your API key and connection."}), 500

@app.route('/api/patients', methods=['GET'])
@login_required
def get_patients():
    import time
    start_time = time.time()
    print(f"DEBUG: get_patients called for User ID: {g.user['uid']}")
    if db:
        try:
            print("DEBUG: Querying Firestore for patients...")
            query_start = time.time()
            # Add a timeout to the stream to prevent hanging indefinitely
            docs = db.collection('patients').where(filter=FieldFilter('userId', '==', g.user['uid'])).stream(timeout=5)
            
            patients = []
            print("DEBUG: Starting iteration over stream...")
            for doc in docs:
                p_data = doc.to_dict()
                print(f"DEBUG: Found patient doc {doc.id}")
                try:
                    decrypted = crypto.decrypt_dict(p_data)
                    patients.append(decrypted)
                except Exception as e:
                    print(f"Error decrypting patient {doc.id}: {e}")
            
            query_end = time.time()
            duration = query_end - query_start
            print(f"DEBUG: Firestore query and iteration took {duration:.4f} seconds.")
            print(f"DEBUG: Found {len(patients)} patients in Firestore for this user.")
            
            # Log response summary
            print(f"DEBUG: Returning {len(patients)} patients. IDs: {[p.get('id') for p in patients]}")
            
            return jsonify(patients)
        except Exception as e:
            print(f"ERROR in get_patients: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        print("DEBUG: Using in-memory store for patients")
        # Filter in-memory by user
        user_patients = [p for p in in_memory_store.values() if p.get('userId') == g.user['uid']]
        print(f"DEBUG: Found {len(user_patients)} patients in memory.")
        return jsonify(user_patients)

@app.route('/api/patients', methods=['POST'])
@login_required
def save_patient():
    patient = request.json
    if not patient.get('id'):
        return jsonify({"error": "Patient ID required"}), 400

    print(f"Saving patient {patient.get('id')} with keys: {list(patient.keys())}")
    if 'doctors' in patient:
        print(f" - Doctors count: {len(patient['doctors'])}")
    if 'medicationsList' in patient:
        print(f" - Meds count: {len(patient['medicationsList'])}")

    if db:
        print(">> SAVING TO FIREBASE (PERSISTENT)")
        import time
        start_time = time.time()
        try:
            # Don't save messages in the main patient doc anymore to keep it light
            # But we might want to keep the 'last message' or something for preview if we wanted
            # Check if exists and verify ownership
            doc_ref = db.collection('patients').document(patient['id'])
            doc = doc_ref.get()
            if doc.exists:
                if doc.to_dict().get('userId') != g.user['uid']:
                    return jsonify({"error": "Unauthorized"}), 403

            # For now, let's just encrypt what's passed.
            patient['userId'] = g.user['uid']
            print(f"Attaching User ID {patient['userId']} to patient {patient['id']}")
            encrypted_patient = crypto.encrypt_dict(patient)
            
            print(f"DEBUG: Writing to document path: patients/{patient['id']}")
            write_start = time.time()
            try:
                doc_ref.set(encrypted_patient)
                print("DEBUG: doc_ref.set() completed successfully.")
            except Exception as write_err:
                print(f"ERROR: Failed to write to Firestore: {write_err}")
                raise write_err
            write_end = time.time()
            
            print(f"DEBUG: Firestore write took {write_end - write_start:.4f} seconds.")
            print(f"DEBUG: Total save_patient operation took {write_end - start_time:.4f} seconds.")
            
            return jsonify({"status": "success"})
        except Exception as e:
            print(f"ERROR in save_patient: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        print(">> SAVING TO MEMORY (NOT PERSISTENT - RESTART WILL WIPE)")
        patient['userId'] = g.user['uid']
        # Initialize chats list if not present
        if 'chats' not in patient:
            patient['chats'] = {}
        in_memory_store[patient['id']] = patient
        return jsonify({"status": "success", "note": "Saved to in-memory store"})

@app.route('/api/patients/<patient_id>/chats', methods=['GET'])
@login_required
def get_patient_chats(patient_id):
    if db:
        import time
        start_time = time.time()
        try:
            # Verify ownership
            p_doc = db.collection('patients').document(patient_id).get()
            if not p_doc.exists:
                 return jsonify({"error": "Patient not found"}), 404
            if p_doc.to_dict().get('userId') != g.user['uid']:
                 return jsonify({"error": "Unauthorized"}), 403

            print(f"DEBUG: Fetching chats for patient {patient_id}...")
            query_start = time.time()
            docs = db.collection('patients').document(patient_id).collection('chats').order_by('createdAt', direction=firestore.Query.DESCENDING).stream()
            chats = []
            for doc in docs:
                c_data = doc.to_dict()
                try:
                    decrypted = crypto.decrypt_dict(c_data)
                    chats.append(decrypted)
                except Exception as e:
                    print(f"Error decrypting chat {doc.id}: {e}")
            
            query_end = time.time()
            print(f"DEBUG: Firestore chat query took {query_end - query_start:.4f} seconds.")
            print(f"DEBUG: Found {len(chats)} chats.")
            
            return jsonify(chats)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        # Mock support for in-memory
        if patient_id in in_memory_store:
            p = in_memory_store[patient_id]
            if p.get('userId') != g.user['uid']:
                 return jsonify({"error": "Unauthorized"}), 403
            chats = list(p.get('chats', {}).values())
            # Sort by createdAt desc
            chats.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
            return jsonify(chats)
        return jsonify([])

@app.route('/api/patients/<patient_id>/chats', methods=['POST'])
@login_required
def save_patient_chat(patient_id):
    chat_data = request.json
    if not chat_data.get('id'):
        return jsonify({"error": "Chat ID required"}), 400

    print(f"Saving chat {chat_data.get('id')} for patient {patient_id}. Message count: {len(chat_data.get('messages', []))}")

    if db:
        print(">> SAVING CHAT TO FIREBASE (PERSISTENT)")
        try:
            # Verify ownership
            p_doc = db.collection('patients').document(patient_id).get()
            if not p_doc.exists:
                 return jsonify({"error": "Patient not found"}), 404
            if p_doc.to_dict().get('userId') != g.user['uid']:
                 return jsonify({"error": "Unauthorized"}), 403

            encrypted_chat = crypto.encrypt_dict(chat_data)
            db.collection('patients').document(patient_id).collection('chats').document(chat_data['id']).set(encrypted_chat)
            return jsonify({"status": "success"})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        print(">> SAVING CHAT TO MEMORY (NOT PERSISTENT)")
        if patient_id in in_memory_store:
            p = in_memory_store[patient_id]
            if p.get('userId') != g.user['uid']:
                 return jsonify({"error": "Unauthorized"}), 403
            if 'chats' not in p:
                p['chats'] = {}
            p['chats'][chat_data['id']] = chat_data
            return jsonify({"status": "success", "note": "Saved to in-memory store"})
        return jsonify({"error": "Patient not found"}), 404

@app.route('/api/patients/<patient_id>/export', methods=['GET'])
@login_required
def export_patient(patient_id):
    # 1. Fetch Patient
    patient_data = None
    if db:
        doc = db.collection('patients').document(patient_id).get()
        if doc.exists:
            p_raw = doc.to_dict()
            if p_raw.get('userId') != g.user['uid']:
                return jsonify({"error": "Unauthorized"}), 403
            patient_data = crypto.decrypt_dict(p_raw)
    else:
        if patient_id in in_memory_store:
            p_raw = in_memory_store[patient_id]
            if p_raw.get('userId') != g.user['uid']:
                return jsonify({"error": "Unauthorized"}), 403
            patient_data = p_raw
    
    if not patient_data:
        return jsonify({"error": "Patient not found"}), 404

    # 2. Fetch Chats
    chats = []
    if db:
        chat_docs = db.collection('patients').document(patient_id).collection('chats').stream()
        for c_doc in chat_docs:
            c_raw = c_doc.to_dict()
            chats.append(crypto.decrypt_dict(c_raw))
    else:
        # In memory chats
        if 'chats' in patient_data:
            chats = list(patient_data['chats'].values())

    # 3. Construct Export
    export_data = {
        "version": 1,
        "exportedAt": str(os.times()), 
        "patient": patient_data,
        "chats": chats
    }
    
    return jsonify(export_data)

@app.route('/api/patients/import', methods=['POST'])
@login_required
def import_patient():
    data = request.json
    if not data or 'patient' not in data:
        return jsonify({"error": "Invalid import data structure"}), 400
    
    patient = data['patient']
    chats = data.get('chats', [])
    
    # Force User ID to current user
    patient['userId'] = g.user['uid']
    
    if db:
        try:
            # 1. Save Patient (Overwrite)
            encrypted_patient = crypto.encrypt_dict(patient)
            db.collection('patients').document(patient['id']).set(encrypted_patient)
            
            # 2. Save Chats
            batch = db.batch()
            chat_ref = db.collection('patients').document(patient['id']).collection('chats')
            
            for chat in chats:
                c_doc_ref = chat_ref.document(chat['id'])
                encrypted_chat = crypto.encrypt_dict(chat)
                batch.set(c_doc_ref, encrypted_chat)
            
            batch.commit()
            
            return jsonify({"status": "success", "message": f"Imported patient and {len(chats)} chats"})
        except Exception as e:
            print(f"Import Error: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        # In-memory import
        in_memory_store[patient['id']] = patient
        if 'chats' not in patient:
            patient['chats'] = {}
        for chat in chats:
            patient['chats'][chat['id']] = chat
        return jsonify({"status": "success", "message": "Imported to memory"})

@app.route('/api/patients/<patient_id>/files', methods=['POST'])
@login_required
def upload_file(patient_id):
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if db:
        try:
            # Verify ownership
            p_doc = db.collection('patients').document(patient_id).get()
            if not p_doc.exists:
                 return jsonify({"error": "Patient not found"}), 404
            if p_doc.to_dict().get('userId') != g.user['uid']:
                 return jsonify({"error": "Unauthorized"}), 403

            # Upload to Firebase Storage
            blob = bucket.blob(f"patients/{patient_id}/{file.filename}")
            blob.upload_from_file(file)
            
            # Save metadata to Firestore
            file_id = str(int(os.times().elapsed * 1000)) # Simple ID
            file_data = {
                "id": file_id,
                "name": file.filename,
                "type": file.content_type,
                "size": 0, # Could get from blob
                "path": blob.name,
                "uploadedAt": str(os.times().elapsed)
            }
            
            # Encrypt metadata
            encrypted_file = crypto.encrypt_dict(file_data)
            db.collection('patients').document(patient_id).collection('files').document(file_id).set(encrypted_file)
            
            return jsonify({"status": "success", "file": file_data})
        except Exception as e:
            print(f"Upload Error: {e}")
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Storage not supported in memory mode"}), 501

@app.route('/api/patients/<patient_id>/files', methods=['GET'])
@login_required
def list_files(patient_id):
    if db:
        try:
            # Verify ownership
            p_doc = db.collection('patients').document(patient_id).get()
            if not p_doc.exists:
                 return jsonify({"error": "Patient not found"}), 404
            if p_doc.to_dict().get('userId') != g.user['uid']:
                 return jsonify({"error": "Unauthorized"}), 403

            docs = db.collection('patients').document(patient_id).collection('files').stream()
            files = []
            for doc in docs:
                f_data = doc.to_dict()
                try:
                    decrypted = crypto.decrypt_dict(f_data)
                    files.append(decrypted)
                except Exception as e:
                    print(f"Error decrypting file {doc.id}: {e}")
            return jsonify(files)
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify([])

@app.route('/api/files/<patient_id>/<file_id>/download', methods=['GET'])
@login_required
def download_file_url(patient_id, file_id):
    if db:
        try:
            # Verify ownership
            p_doc = db.collection('patients').document(patient_id).get()
            if not p_doc.exists:
                 return jsonify({"error": "Patient not found"}), 404
            if p_doc.to_dict().get('userId') != g.user['uid']:
                 return jsonify({"error": "Unauthorized"}), 403

            # Get file metadata
            f_doc = db.collection('patients').document(patient_id).collection('files').document(file_id).get()
            if not f_doc.exists:
                return jsonify({"error": "File not found"}), 404
            
            f_data = crypto.decrypt_dict(f_doc.to_dict())
            blob = bucket.blob(f_data['path'])
            
            # Generate signed URL
            import datetime
            url = blob.generate_signed_url(expiration=datetime.timedelta(minutes=15))
            return jsonify({"url": url})
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Not supported"}), 501

@app.route('/api/patients/<patient_id>/files/<file_id>', methods=['DELETE'])
@login_required
def delete_file(patient_id, file_id):
    if not db:
        return jsonify({"error": "Database not configured"}), 500

    try:
        # Verify patient ownership
        p_doc = db.collection('patients').document(patient_id).get()
        if not p_doc.exists or p_doc.to_dict().get('userId') != g.user['uid']:
            return jsonify({"error": "Unauthorized"}), 403

        # Get file doc
        f_ref = db.collection('patients').document(patient_id).collection('files').document(file_id)
        f_doc = f_ref.get()
        
        if not f_doc.exists:
            return jsonify({"error": "File not found"}), 404

        f_data = crypto.decrypt_dict(f_doc.to_dict())
        storage_path = f_data.get('path')

        # Delete from Storage
        if storage_path:
            try:
                # Assuming 'bucket' is already initialized globally or via firebase_admin.storage
                # If not, it would need to be initialized here or passed in.
                # The existing code uses 'bucket' directly, so we'll assume it's available.
                blob = bucket.blob(storage_path)
                blob.delete()
                print(f"Deleted blob: {storage_path}")
            except Exception as e:
                print(f"Error deleting blob (might not exist): {e}")

        # Delete from Firestore
        f_ref.delete()
        print(f"Deleted file document: {file_id}")

        return jsonify({"success": True})

    except Exception as e:
        print(f"Error deleting file: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=config.get_setting('app_port'), debug=config.get_setting('debug_mode'))
