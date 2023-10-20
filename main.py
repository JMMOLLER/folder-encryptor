import os
import base64
import sys
import threading
import time

from cryptography.fernet import Fernet
import hashlib
import json

loadingText = None

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


def isEncrypted(folder_path, libraries, index):
    # Check if the folder is already encrypted
    for library in libraries:
        if library['dir'] == folder_path and library['encrypted']:
            return True
        if index is not None:
            index += 1

    return False


def save(filename, password, libraries):
    # Create Fernet object
    fernet = Fernet(load_or_generate_key(password))
    data = json.dumps(libraries).encode()
    encrypted_data = fernet.encrypt(data)
    with open(filename, 'wb') as f:
        f.write(encrypted_data)


def decrypt_folder(folder_path, password, libraries, index):
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
    libraries.remove({'dir': folder_path, 'encrypted': True}) # Here exists a problem


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

def show_loading_animation(event: threading.Event) -> None:
    animation = [
        "[        ]",
        "[=       ]",
        "[===     ]",
        "[====    ]",
        "[=====   ]",
        "[======  ]",
        "[======= ]",
        "[========]",
        "[ =======]",
        "[  ======]",
        "[   =====]",
        "[    ====]",
        "[     ===]",
        "[      ==]",
        "[       =]",
        "[        ]",
        "[        ]"
    ]

    while True:
        for char in animation:
            sys.stdout.write(f"\r{loadingText} {char}")
            sys.stdout.flush()
            time.sleep(0.1)
            if event.is_set():
                return


def stop_loading_animation(event):
    event.set()
    sys.stdout.write("\rDone.\n")
    sys.stdout.flush()


def main():
    global loadingText
    action = None

    while action not in ["e", "d"]:
        action = input("Encrypt or Decrypt? (E/D): ").lower()

    folder_path = "D:/Nueva/test"
    secret = "secret.ext"
    attempt = 0
    password = None
    libraries = None
    event = threading.Event()

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
        if isEncrypted(folder_path, libraries, None):
            print(f"Folder {folder_path} already encrypted.")
        else:
            loadingText = "Encrypting "
            loading_thread = threading.Thread(target=show_loading_animation, args=(event,))
            loading_thread.start()
            encrypt_folder(folder_path, password, libraries)
            save(secret, password, libraries)
            stop_loading_animation(event)
    elif action == "d":
        index = 0
        if isEncrypted(folder_path, libraries, index):
            loadingText = "Decrypting "
            loading_thread = threading.Thread(target=show_loading_animation, args=(event,))
            loading_thread.start()
            decrypt_folder(folder_path, password, libraries, index)
            stop_loading_animation(event)
        else:
            print(f"Folder {folder_path} isn't encrypted.")


if __name__ == "__main__":
    main()
