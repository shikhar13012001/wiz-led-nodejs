class TaskQueue {
  constructor() {
    this.tasks = []; // Array to hold tasks
    this.isRunning = false; // Flag to check if execution is in progress
  }

  // Method to add a task to the queue
  enqueue(task) {
    this.tasks.push(task);
    this.run(); // Attempt to run the next task
  }

  // Internal method to run the next task
  async run() {
    if (!this.isRunning && this.tasks.length > 0) {
      this.isRunning = true; // Set flag to indicate execution is in progress
      const task = this.tasks.shift(); // Get the next task from the queue
      try {
        await task(); // Wait for the task to complete
        // create delay for 300ms
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (err) {
        console.error("Task failed with error:", err);
      }
      this.isRunning = false; // Reset flag after execution
      this.run(); // Attempt to run the next task
    }
  }
}
export default TaskQueue;
