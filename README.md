
# Q-Learning Maze Solver Web App

This is a web application that uses **Reinforcement Learning (Q-Learning)** to solve a maze. 
It allows users to upload a maze text file, train an agent in the browser (via backend API), and visualize the solution path.

## Features
- **Upload Maze**: Parses text-based maze definitions.
- **Train Agent**: Runs Q-Learning algorithm on the server.
- **Visualize**: Shows the maze and animates the agent's path.
- **Cloud Ready**: Dockerized for Google Cloud Run.

## Project Structure
- `app/backend`: FastAPI application and Q-Learning logic.
- `app/frontend`: HTML/JS/CSS interface.
- `Dockerfile`: Configuration for container deployment.

## How to Run Locally

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application (this serves both frontend and backend):
   ```bash
   uvicorn app.backend.main:app --reload
   ```
3. Open http://localhost:8000

## Deploy to Google Cloud Run

See [Deployment Guide](deployment.md) for detailed instructions.
