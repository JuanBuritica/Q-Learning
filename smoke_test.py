
import sys
import os

# Add the project root to python path
sys.path.append(os.getcwd())

try:
    from app.backend.maze_env import MazeEnv
    from app.backend.agent import QLearningAgent
    from app.backend.main import app
    print("Imports successful!")
except Exception as e:
    print(f"Import Error: {e}")
    sys.exit(1)
