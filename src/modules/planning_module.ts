import { Tool, z } from "genkit";
import cron from "node-cron";
import fs from "fs/promises";
import path from "path";
import { ai } from "../genkit_init";
import {
  getPersonalityMemory,
  getEntityMemory,
  getReflectionsMemory,
  getExperienceMemory,
  retriveAllMemoriesContext,
} from "../api/settings_api/memory_invocation_tools";
import { taskSchema } from "../schemas/task_schema";
import { toolDefinitions } from "../config/agent_config";
import { createDailyObjective } from "../api/agent_api/create_daily_objectives";
import { createTasksFromObjectives } from "../api/agent_api/create_tasks_from_objectives_agent";
import { optimiseDailyTasks } from "../api/agent_api/optimise_daily_tasks";
import { executeTask } from "../api/agent_api/execute_task";
import { handleAgentResponse } from "./response_modules";

// const nestedToolSchema = z.object({
//   name: z.string(),
//   subTools: z.array(z.string()),
//   description: z.string(),
// });

export class LLMPlanningModule {
  private activeJobs: Map<string, any>;
  private planStoragePath: string;
  private toolDefinitions: Record<string, Object>;

  constructor() {
    this.activeJobs = new Map();
    this.planStoragePath = path.join(__dirname, "../../../plans");
    this.toolDefinitions = toolDefinitions;
  }

  private async storeDailyPlan(plan: any) {
    const date = new Date().toISOString().split("T")[0];
    const filePath = path.join(this.planStoragePath, `${date}.json`);

    try {
      await fs.mkdir(this.planStoragePath, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(plan, null, 2));
      return filePath;
    } catch (error) {
      throw new Error(`Failed to store daily plan: ${error.message}`);
    }
  }

  private async loadDailyPlan(date: string) {
    const filePath = path.join(this.planStoragePath, `${date}.json`);
    try {
      const planData = await fs.readFile(filePath, "utf-8");
      return JSON.parse(planData);
    } catch (error) {
      console.error(`No plan found for date: ${date}`);
      return null;
    }
  }

  private timeToCron(timeStr: string): string {
    const [time, meridiem] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);

    if (meridiem === "PM" && hours !== 12) {
      hours += 12; // Convert PM hours to 24-hour format
    } else if (meridiem === "AM" && hours === 12) {
      hours = 0; // Convert 12 AM to 0 hours
    }

    return `${minutes} ${hours} * * *`;
  }

  private scheduleTask(task: any) {
    const cronExpression = this.timeToCron(task.executionTime);

    const job = cron.schedule(cronExpression, async () => {
      try {
        var response = await executeTask(task);

        handleAgentResponse(response);

        this.activeJobs.get(task.id)?.stop();
        this.activeJobs.delete(task.id);
      } catch (error) {
        console.error(`Task execution failed: ${task.id}`, error);
      }
    });

    this.activeJobs.set(task.id, job);
  }

  private async scheduleDailyTasks(tasks: any[]) {
    for (const job of this.activeJobs.values()) {
      job.stop();
    }
    this.activeJobs.clear();

    for (const task of tasks) {
      this.scheduleTask(task);
    }
  }

  async generateDailyPlan() {
    try {
      const currentDate = new Date();
      const objectives = await createDailyObjective();
      console.log(objectives);

      const allTasks = [];
      for (const objective of objectives) {
        var tasks = await createTasksFromObjectives(objective);
        console.log("Tasks:", tasks);
        allTasks.push(...tasks);
      }

      var optimizedTasks = await optimiseDailyTasks(allTasks);

      console.log("Optimized Tasks:", optimizedTasks);

      const dailyPlan = {
        date: currentDate,
        objectives,
        tasks: optimiseDailyTasks,
        timestamp: currentDate,
      };

      await this.storeDailyPlan(dailyPlan);
      await this.scheduleDailyTasks(optimizedTasks);
      return dailyPlan;
    } catch (error) {
      console.error("Error generating daily plan:", error);
      throw error;
    }
  }

  async initialize() {
    const today = new Date().toISOString().split("T")[0];
    const existingPlan = await this.loadDailyPlan(today);

    if (existingPlan) {
      await this.scheduleDailyTasks(existingPlan.tasks);
    } else {
      await this.generateDailyPlan();
    }

    // Schedule daily plan generation for midnight
    cron.schedule("0 0 * * *", () => this.generateDailyPlan());
  }

  shutdown() {
    for (const job of this.activeJobs.values()) {
      job.stop();
    }
    this.activeJobs.clear();
  }
}

// call initilaise
