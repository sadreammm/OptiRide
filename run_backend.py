#!/usr/bin/env python
"""
Simple backend runner script that sets up Python path correctly.
This allows absolute imports to work properly.
"""
import sys
import os

# Add the Backend directory to Python path so 'app' can be imported
backend_path = os.path.join(os.path.dirname(__file__), 'Backend')
sys.path.insert(0, backend_path)

# Now import and run the app
from app.main import app
import uvicorn

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
