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
operations = [
  'encrypt',
  'decrypt',
  'check-librarie',
  'get-content',
]
states = [
  'pending',
  'complete',
  'error',
]


def checkLibrarie():
  res = os.path.exists(secret)
  printResponse(operations[2], states[1], res)


def printResponse(operation: str, status: str, data:  str | list | bool | float):
  print(json.dumps({'operation': operation, 'status': status, 'data': data}))
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
    if library['path'] == folder_path and library['encrypted']:
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


def send_processed_items(operation: str):
  global processed_items
  processed_items += 1
  percentage = (processed_items / total_items) * 100
  status = states[0]
  if percentage == 100:
    status = states[1]
  printResponse(operation, status, percentage)


def isValidPassword(libraries: list):
  if libraries is None:
    return False
  return True


def shouldNext(libraries: list, folder_path: str, index: int):
  if index not in [0, 1]:
    printResponse(operations[0], states[2], "Invalid process.")
    return False

  if isValidPassword(libraries) is False:
    printResponse(operations[index], states[2], "Wrong password.")
    return False
  if is_encrypted(folder_path, libraries, None) and index == 0:
    printResponse(operations[index], states[2], "Folder already encrypted.")
    return False
  
  return True


def encrypt_folder(folder_path: str, password: str, libraries: list) -> None:

  if shouldNext(libraries, folder_path, 0) is False:
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
          send_processed_items(operations[0])
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

  if shouldNext(libraries, folder_path, 1) is False:
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
          send_processed_items(operations[1])
      decrypt_filename(fernet, folder_name, root, os.path.dirname(root))

  # Remove the folder from the list
  libraries = [librarie for librarie in libraries if librarie['path'] != folder_path]
  save_secret(secret, password, libraries)


# Handle args functions


def handleGetContent(password: str):
  if password is not None:
    libraries = load_secret(secret, password)
    if isValidPassword(libraries) is False:
      printResponse(operations[3], states[2], "Wrong password.")
    else:
      printResponse(operations[3], states[1], libraries)
  else:
    printResponse(operations[3], states[2], "Password is required.")


def handleEncrypt(folder_path: str, password: str):
  if folder_path is None:
    printResponse(operations[0], states[2], "Folder path is required.")
  elif password is None:
    printResponse(operations[0], states[2], "Password is required.")
  elif os.path.exists(folder_path) is False:
    printResponse(operations[0], states[2], "Folder not found.")
  else:
    encrypt_folder(os.path.abspath(folder_path), password, load_secret(secret, password))


def handleDencrypt(folder_path: str, password: str):
  if folder_path is None:
    printResponse(operations[1], states[2], "Folder path is required.")
  elif password is None:
    printResponse(operations[1], states[2], "Password is required.")
  elif os.path.exists(folder_path) is False:
    printResponse(operations[1], states[2], "Folder not found.")
  else:
    decrypt_folder(os.path.abspath(folder_path), password, load_secret(secret, password))


if __name__ == "__main__":
  parser = argparse.ArgumentParser(description='Encrypt or decrypt a folder.')
  parser.add_argument("--function")
  parser.add_argument("--folder_path")
  parser.add_argument("--password")
  args = parser.parse_args()

  if args.function == "encrypt":
    handleEncrypt(args.folder_path, args.password)
  elif args.function == "decrypt":
    handleDencrypt(args.folder_path, args.password)
  elif args.function == "check-librarie":
    checkLibrarie()
  elif args.function == "get-content":
    handleGetContent(args.password)
  else:
    printResponse(operations[0], states[2], "Invalid function.")
