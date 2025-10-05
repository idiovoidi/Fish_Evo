# Fish Evo Simulation - Debugging Guide

## Debugging with VS Code (F5)

This project includes VS Code launch configurations that allow you to debug the application with the F5 key.

### Prerequisites

1. Google Chrome or Microsoft Edge browser installed
2. Node.js installed (for the http-server)

### Debug Configurations

There are two debug configurations available:

1. **Launch Fish Evo Simulation** - Uses Google Chrome
2. **Launch Fish Evo Simulation (Edge)** - Uses Microsoft Edge

### How to Debug

1. Open the project in VS Code
2. Set breakpoints in your JavaScript files
3. Press `F5` or go to the "Run and Debug" view and click the green play button
4. Select either "Launch Fish Evo Simulation" or "Launch Fish Evo Simulation (Edge)"
5. The application will start and the browser will open automatically
6. Your breakpoints will be hit during execution

### Stopping Debug Session

To stop the debug session, click the stop button in the debug toolbar or press `Shift+F5`. The local server will be automatically stopped.

### Command Line Debugging

You can also start the debug server from the command line:

```bash
npm run debug
```

This will start the server on port 5502, which you can then access in your browser at `http://127.0.0.1:5502`.

## Project Structure

- `index.html` - Main entry point
- `core/` - Core simulation files
- `ecs/` - Entity Component System implementation
- `config/` - Configuration files

## Troubleshooting

If you encounter issues with debugging:

1. Make sure Chrome or Edge is installed in the default location
2. Ensure no other process is using port 5501
3. Check that all required Node.js packages are installed (`npm install`)