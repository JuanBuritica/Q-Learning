# Q-Learning Maze Solver (Client-Side)

This is a web application that uses **Reinforcement Learning (Q-Learning)** to solve a maze. 
The entire logic runs directly in your browser using JavaScript. No backend server is required.

## Features
- **Pure Client-Side**: No installation needed, runs in any modern browser.
- **Upload Maze**: Parses text-based maze definitions.
- **Train Agent**: Runs Q-Learning algorithm in JavaScript.
- **Visualize**: Shows the maze and animates the agent's path.

## Project Structure
- `index.html`: Main interface.
- `maze_env.js`: Maze environment logic (JS port).
- `agent.js`: Q-Learning agent logic (JS port).
- `script.js`: Main controller and visualization.
- `style.css`: Styling.
- `laberinto.txt`: Original maze sample.


## How to Run

1. Open `app/frontend/index.html` in any web browser.
2. Or serve it using a simple server:
   ```bash
   python -m http.server 8000 --directory app/frontend
   ```
3. Open http://localhost:8000

## Credits
Adapted from a university Q-Learning project into a modern, self-service web tool.
