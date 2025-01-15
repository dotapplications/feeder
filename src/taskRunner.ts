// taskRunner.ts
type TaskFunction<T> = () => Promise<T>;

/**
 * Runs a task with a name and tracks its execution
 * @param taskName Name of the task for logging/monitoring
 * @param task Async function to execute
 * @returns Result of the task execution
 */
export async function run<T>(
  taskName: string,
  task: TaskFunction<T>
): Promise<T> {
  console.log(`Starting task: ${taskName}`);
  const startTime = Date.now();

  try {
    const result = await task();
    const duration = Date.now() - startTime;
    console.log(`Completed task: ${taskName} in ${duration}ms`);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Failed task: ${taskName} after ${duration}ms`, error);
    throw error;
  }
}
