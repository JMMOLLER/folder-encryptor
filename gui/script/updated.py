import argparse
import os
import base64
import sys
import time

from cryptography.fernet import Fernet
import hashlib
import json

secret = ".ext"
processed_items = 0
total_items = 0
excludes_files = [
  "desktop.ini",
  "secret.ext",
  "main.py",
]


def checkLibrarie():
  print(os.path.exists(secret))
  clearBuffer()


def clearBuffer():
  sys.stdout.flush() # important - otherwise the output will be buffered


def load_or_generate_key(password):
  password = password.encode()
  salt = b'\x8c\x12\xa9\x08\xea\x06\x1a\x19'
  key = hashlib.pbkdf2_hmac('sha256', password, salt, 100000)
  return base64.urlsafe_b64encode(key)


def load_secret(filename: str, password: str) -> list | None:
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


def save_secret(filename: str, password: str, libraries: list):
  # Create Fernet object
  fernet = Fernet(load_or_generate_key(password))
  data = json.dumps(libraries).encode()
  encrypted_data = fernet.encrypt(data)
  with open(filename, 'wb') as f:
    f.write(encrypted_data)


def is_encrypted(folder_path, libraries, index):
  # Check if the folder is already encrypted
  for library in libraries:
    if library['dir'] == folder_path and library['encrypted']:
      return True
    if index is not None:
      index += 1

  return False


def count_files(folder_path):
  global total_items
  global processed_items
  for root, dirs, files in os.walk(folder_path):
    folder_name = os.path.basename(root)  # Get the folder name
    if folder_name.startswith('.'):
      dirs[:] = []
      continue
    for file in files:
      if file.lower() not in excludes_files and file.lower().startswith('.') is False:
        total_items += 1
  return total_items


def get_folders(folder_path: str):
  folders = []
  for root, dirs, files in os.walk(folder_path):
    folder_name = os.path.basename(root)  # Get the folder name
    if folder_name.startswith('.'):
      dirs[:] = []
      continue
    for file in files:
      if file.lower() not in excludes_files and file.lower().startswith('.') is False and root not in folders:
        folders.append(root)

  # revertir el orden de la lista
  folders.reverse()

  return folders


def encrypt_filename(fernet: Fernet, filename: str, file_path: str, root: str):
  encrypted_name = fernet.encrypt(filename.encode())
  os.rename(file_path, os.path.join(root, encrypted_name.decode()))
  return encrypted_name.decode()


def decrypt_filename(fernet: Fernet, filename: str, file_path: str, root: str):
  decrypted_name = fernet.decrypt(filename.encode())
  os.rename(file_path, os.path.join(root, decrypted_name.decode()))


def send_processed_items():
  global processed_items
  processed_items += 1
  percentage = (processed_items / total_items) * 100
  print(f"\r{percentage:.2f}")
  clearBuffer()


def encrypt_folder(folder_path: str, password: str, libraries: list) -> None:

  if libraries is None:
    print("Wrong password.")
    return
  if is_encrypted(folder_path, libraries, None):
    print("Folder already encrypted.")
    return
  
  count_files(folder_path)

  global processed_items
  # Load the key
  key = load_or_generate_key(password)
  # Create Fernet object
  fernet = Fernet(key)

  folder_base_name = os.path.basename(folder_path)

  folders = get_folders(folder_path)
  folders_excluded = []

  # Encrypt the files in the folder
  for current_root in folders:
    for root, dirs, files in os.walk(current_root):
      current_folder = os.path.basename(root)  # Get the folder name
      if current_folder.startswith('.') or current_folder in folders_excluded:
        dirs[:] = []
        continue
      for file in files:
        if file.lower() not in excludes_files and file.lower().startswith('.') is False:
          file_path = os.path.join(root, file)
          with open(file_path, 'rb') as f:
            data = f.read()
          encrypted_data = fernet.encrypt(data)
          with open(file_path, 'wb') as f:
            f.write(encrypted_data)
          encrypt_filename(fernet, file, file_path, root)
          send_processed_items()
      if current_folder != folder_base_name:
        new_folder_name = encrypt_filename(fernet, current_folder, root, os.path.dirname(root))
        folders_excluded.append(new_folder_name)

  folder_path = folder_path.replace(
    folder_base_name,
    encrypt_filename(
        fernet,
        folder_base_name,
        folder_path, os.path.dirname(folder_path)
    )
  )

  # Add the folder to the list
  libraries.append({
    'path': folder_path,
    'encrypted': True,
    'timestamp': time.time(),
    'currentName': os.path.basename(folder_path),
    'originalName': folder_base_name
    })
  save_secret(secret, password, libraries)


def decrypt_folder(folder_path: str, password: str, libraries: list):

  if libraries is None:
    print("Wrong password.")
    return
  if is_encrypted(folder_path, libraries, 0) is False:
    print("Folder not encrypted.")
    return
  
  count_files(folder_path)

  global processed_items
  # Load the key
  key = load_or_generate_key(password)
  # Create Fernet object
  fernet = Fernet(key)

  folders = get_folders(folder_path)

  for current_root in folders:
    for root, dirs, files in os.walk(current_root):
      folder_name = os.path.basename(root)  # Get the folder name
      if folder_name.startswith('.'):
        dirs[:] = []
        continue
      for file in files:
        if file.lower() not in excludes_files and file.lower().startswith('.') is False:
          file_path = os.path.join(root, file)
          with open(file_path, 'rb') as f:
            data = f.read()
          decrypted_data = fernet.decrypt(data)
          with open(file_path, 'wb') as f:
            f.write(decrypted_data)
          decrypt_filename(fernet, file, file_path, root)
          send_processed_items()
      decrypt_filename(fernet, folder_name, root, os.path.dirname(root))

  # Remove the folder from the list
  libraries.remove({'dir': folder_path, 'encrypted': True})
  save_secret(secret, password, libraries)

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description='Encrypt or decrypt a folder.')
  parser.add_argument("--function")
  parser.add_argument("--folder_path")
  parser.add_argument("--password")
  args = parser.parse_args()

  if args.function == "encrypt":
    encrypt_folder(os.path.abspath(args.folder_path), args.password, load_secret(secret, args.password))
  elif args.function == "decrypt":
    decrypt_folder(os.path.abspath(args.folder_path), args.password, load_secret(secret, args.password))
  elif args.function == "check-librarie":
    checkLibrarie()
  elif args.function == "get-content":
    if args.password is not None:
      libraries = load_secret(secret, args.password)
      if libraries is None:
        print("Wrong password.")
      else:
        print(libraries)
    else:
      print("Password is required.")
  else:
    print("Invalid function.")

  # folder_path = "E:/folder-encryptor/test"

  # encrypt_path = "gAAAAABljkZ8OLXfzChUToFO7cDSwL52TdF1FFURsk2y7Z-L7ZnOXA11MjA8WazxYy2FQYywBpxfaIM7FPOdcRLw1RukDgUg4w=="

  # libraries = load_secret(".ext", "admin")
  # if libraries is None:
  #   print("Wrong password.")
  # else:
  #   count_files(folder_path)

  #   encrypt_folder(folder_path, "admin", libraries)

  #   # decrypt_folder(folder_path.replace("test", "")+encrypt_path, "admin", libraries)
