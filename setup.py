#!/usr/bin/env python3
"""
TurmeriCare Quick Setup Script
Run this script to set up and start both the backend and frontend.
Usage: python setup.py
"""

import os
import sys
import subprocess
import shutil


def run(cmd, cwd=None, check=True):
    """Run a shell command."""
    print(f"  → {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd, check=check,
                            capture_output=False, text=True)
    return result


def check_prereqs():
    print("\n🔍 Checking prerequisites...")
    errors = []

    # Python
    python_ver = sys.version_info
    if python_ver < (3, 10):
        errors.append(f"Python 3.10+ required, got {python_ver.major}.{python_ver.minor}")
    else:
        print(f"  ✅ Python {python_ver.major}.{python_ver.minor}.{python_ver.micro}")

    # Node.js
    node = shutil.which("node")
    if not node:
        errors.append("Node.js not found. Install from https://nodejs.org")
    else:
        result = subprocess.run("node --version", shell=True, capture_output=True, text=True)
        print(f"  ✅ Node.js {result.stdout.strip()}")

    # MySQL
    mysql = shutil.which("mysql")
    if not mysql:
        print("  ⚠️  MySQL client not found in PATH (server might still be running)")
    else:
        print(f"  ✅ MySQL client found")

    if errors:
        print("\n❌ Prerequisite errors:")
        for e in errors:
            print(f"  • {e}")
        sys.exit(1)


def setup_backend():
    print("\n🐍 Setting up backend...")
    backend_dir = os.path.join(os.path.dirname(__file__), "backend")

    # Create venv
    venv_dir = os.path.join(backend_dir, "venv")
    if not os.path.exists(venv_dir):
        run(f'python -m venv "{venv_dir}"', check=False)

    # Install packages
    pip = os.path.join(venv_dir, "Scripts", "pip") if os.name == "nt" else os.path.join(venv_dir, "bin", "pip")
    run(f'"{pip}" install -r requirements.txt', cwd=backend_dir, check=False)

    # Create .env if missing
    env_file = os.path.join(backend_dir, ".env")
    env_example = os.path.join(backend_dir, ".env.example")
    if not os.path.exists(env_file) and os.path.exists(env_example):
        shutil.copy(env_example, env_file)
        print(f"  📝 Created .env from .env.example — please update DB credentials!")

    # Create directories
    for d in ["uploads", "uploads/heatmaps", "uploads/reports", "app/ai/models"]:
        os.makedirs(os.path.join(backend_dir, d), exist_ok=True)

    print("  ✅ Backend ready")


def setup_frontend():
    print("\n⚛️  Setting up frontend...")
    frontend_dir = os.path.join(os.path.dirname(__file__), "frontend")
    node_modules = os.path.join(frontend_dir, "node_modules")

    if not os.path.exists(node_modules):
        run("npm install", cwd=frontend_dir)
    else:
        print("  ✅ node_modules already exists")


def print_instructions():
    print("""
╔══════════════════════════════════════════════════════════════╗
║           🌿 TurmeriCare — Setup Complete!                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. Edit backend/.env with your MySQL credentials            ║
║                                                              ║
║  2. Import the database schema:                              ║
║     mysql -u root -p < database/schema.sql                   ║
║                                                              ║
║  3. Start the backend:                                       ║
║     cd backend                                               ║
║     venv\\Scripts\\activate                                    ║
║     python run.py                                            ║
║                                                              ║
║  4. Start the frontend (new terminal):                       ║
║     cd frontend                                              ║
║     npm run dev                                              ║
║                                                              ║
║  5. Open: http://localhost:5173                              ║
║                                                              ║
║  Admin login: admin@turmericare.com / Admin@123              ║
╚══════════════════════════════════════════════════════════════╝
""")


if __name__ == "__main__":
    print("🌿 TurmeriCare Setup Script")
    print("=" * 50)
    check_prereqs()
    setup_backend()
    setup_frontend()
    print_instructions()
