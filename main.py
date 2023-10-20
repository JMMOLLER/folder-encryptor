import os
import base64
import sys

from cryptography.fernet import Fernet
import hashlib
import json


def load_secret(filename, password):
    if os.path.exists(filename):
        with open(filename, 'rb') as f:
            data = f.read()
        try:
            fernet = Fernet(load_or_generate_key(password))
            decrypted_data = fernet.decrypt(data)
        except:
            return None
        return json.loads(decrypted_data)
    return []


def load_or_generate_key(password):
    password = password.encode()
    salt = b'\x8c\x12\xa9\x08\xea\x06\x1a\x19'
    key = hashlib.pbkdf2_hmac('sha256', password, salt, 100000)
    return base64.urlsafe_b64encode(key)


def isEncrypted(folder_path, libraries):
    # Check if the folder is already encrypted
    for library in libraries:
        if library['dir'] == folder_path and library['encrypted']:
            return True

    return False


def save(filename, password, libraries):
    # Create Fernet object
    fernet = Fernet(load_or_generate_key(password))
    data = json.dumps(libraries).encode()
    encrypted_data = fernet.encrypt(data)
    with open(filename, 'wb') as f:
        f.write(encrypted_data)


def decrypt_folder(folder_path, password, libraries):
    # Load the key
    key = load_or_generate_key(password)
    # Crear objeto Fernet
    fernet = Fernet(key)

    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower() != "desktop.ini":
                file_path = os.path.join(root, file)
                with open(file_path, 'rb') as f:
                    data = f.read()
                decrypted_data = fernet.decrypt(data)
                with open(file_path, 'wb') as f:
                    f.write(decrypted_data)
    libraries.remove({'dir': folder_path, 'encrypted': True})


def encrypt_folder(folder_path, password, libraries):
    # Load the key
    key = load_or_generate_key(password)
    # Create Fernet object
    fernet = Fernet(key)

    # Encrypt the files in the folder
    for root, dirs, files in os.walk(folder_path):
        for file in files:
            if file.lower() != "desktop.ini":
                file_path = os.path.join(root, file)
                with open(file_path, 'rb') as f:
                    data = f.read()
                encrypted_data = fernet.encrypt(data)
                with open(file_path, 'wb') as f:
                    f.write(encrypted_data)

    # Add the folder to the list
    libraries.append({'dir': folder_path, 'encrypted': True})


def main():
    action = None

    while action not in ["e", "d"]:
        action = input("Encrypt or Decrypt? (E/D): ").lower()

    folder_path = "D:/Nueva/test"
    secret = "secret.ext"
    attempt = 0
    password = None
    libraries = None

    while libraries is None:
        password = input("Password: ")
        libraries = load_secret(secret, password)
        if libraries is None:
            print("Wrong password.")
        if attempt > 2:
            print("Many attempts.")
            return sys.exit(0)
        attempt += 1

    if action == "e":
        if isEncrypted(folder_path, libraries):
            print(f"Folder {folder_path} already encrypted.")
        else:
            encrypt_folder(folder_path, password, libraries)
            save(secret, password, libraries)
    elif action == "d":
        if isEncrypted(folder_path, libraries):
            decrypt_folder(folder_path, password, libraries)
        else:
            print(f"Folder {folder_path} isn't encrypted.")


if __name__ == "__main__":
    main()
