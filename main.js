// Import required Electron modules
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// Declare global variables
let mainWindow;

// Define the createMainWindow function to create the main window
function createMainWindow() {
  // Create a new browser window
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load the index.html file into the window
  mainWindow.loadFile("index.html");

  // Open the DevTools
  mainWindow.webContents.openDevTools();

  // Set the main window to null when it is closed
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

// Define the createTodoList function to create the to-do list
function createTodoList() {
  // Read the tasks file specified by the user
  const tasksFile = fs.readFileSync("tasks.txt", "utf8");

  // Parse the tasks file into an object
  const tasks = JSON.parse(tasksFile);

  // Create an empty to-do list
  const todoList = [];

  // Add each task from the tasks file to the to-do list
  for (const task of tasks) {
    todoList.push({
      name: task.name,
      allowedApps: task.allowedApps,
    });
  }

  // Return the to-do list
  return todoList;
}

// Define the startMonitoring function to start monitoring the user's tasks
function startMonitoring() {
  // Create the to-do list
  const todoList = createTodoList();

  // Send the to-do list to the renderer process
  mainWindow.webContents.send("start-monitoring", todoList);
}

// Define the stopMonitoring function to stop monitoring the user's tasks
function stopMonitoring() {
  // Send a message to the renderer process to stop monitoring
  mainWindow.webContents.send("stop-monitoring");
}

// Define the main function to create the application
function main() {
  // Create the main window when the app is ready
  app.on("ready", createMainWindow);

  // Quit the app when all windows are closed
  app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  // Create an IPC channel to start monitoring
  ipcMain.on("start-monitoring", function () {
    startMonitoring();
  });

  // Create an IPC channel to stop monitoring
  ipcMain.on("stop-monitoring", function () {
    stopMonitoring();
  });
}

// Call the main function to create the application
main();
