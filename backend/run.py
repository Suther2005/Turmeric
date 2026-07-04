import os
from dotenv import load_dotenv

# Load environment variables before anything else
load_dotenv()

from app import create_app

config_name = os.environ.get('FLASK_ENV', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    print(f'Starting TurmeriCare backend on {host}:{port} (debug={debug})')
    app.run(host=host, port=port, debug=debug)
