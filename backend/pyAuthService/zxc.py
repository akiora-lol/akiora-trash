from typing import Dict
import hashlib
import os

SERVICE_KEYS = {
    "auth_service": hashlib.sha256(b"your-secret-key-1").hexdigest(),
    "admin_service": hashlib.sha256(b"your-secret-key-2").hexdigest(),
}
print(SERVICE_KEYS)
