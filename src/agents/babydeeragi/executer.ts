import { AgentExecuter } from '../base/AgentExecuter';
import { taskCreationAgent } from './agents/taskCreation/agent';
import { AgentTask } from '@/types';
import { getTaskById } from '@/utils/task';
import { webBrowsing } from './tools/webBrowsing';
import { textCompletionToolPrompt } from './prompt';
import { textCompletionTool } from '../common/tools/textCompletionTool';
import { setupMessage } from '@/utils/message';
import { toast } from 'sonner';
import { translate } from '@/utils/translate';

export class BabyDeerAGI extends AgentExecuter {
  sessionSummary = `OBJECTIVE: ${this.objective}\n\n`;
  userInputResolver: ((message: string) => void) | null = null;
  userInputPromise: Promise<string> | null = null;

  // Create task list by agent
  async taskCreation() {
    this.statusCallback({ type: 'creating' });
    this.abortController = new AbortController();
    const taskList = await taskCreationAgent(
      this.objective,
      this.modelName,
      this.language,
      this.abortController?.signal,
      this.messageCallback,
    );

    if (!taskList) {
      toast.error(translate('ERROR_CREATING_TASKS', 'message'));
      this.stop();
      return;
    }

    this.taskList = taskList;
    this.printer.printTaskList(this.taskList, 0);
  }

  async taskOutputWithTool(task: AgentTask) {
    let taskOutput = '';
    switch (task.tool) {
      case 'text-completion':
        this.abortController = new AbortController();
        let dependentTasksOutput = '';
        if (task.dependentTaskIds) {
          for (const id of task.dependentTaskIds) {
            const dependentTasks = getTaskById(this.taskList, id);
            const dependentTaskOutput = dependentTasks?.output?.slice(0, 2000);
            dependentTasksOutput += dependentTaskOutput;
          }
        }
        const prompt = textCompletionToolPrompt(
          this.objective,
          this.language,
          task.task,
          dependentTasksOutput,
        );
        taskOutput = await textCompletionTool(
          prompt,
          this.modelName,
          this.abortController?.signal,
          task.id,
          this.messageCallback,
        );
        break;
      case 'web-search':
        taskOutput =
          (await webBrowsing(
            this.objective,
            task,
            this.taskList,
            this.messageCallback,
            this.statusCallback,
            this.isRunningRef,
            this.verbose,
            this.modelName,
            this.language,
            this.abortController?.signal,
          )) ?? '';
        break;
      case 'user-input':
        taskOutput = await this.getUserInput(task);
        break;
      default:
        break;
    }
    return taskOutput;
  }

  async executeTask(task: AgentTask) {
    if (!this.isRunningRef.current) return;

    // Execute the task
    this.statusCallback({ type: 'executing' });
    this.printer.printNextTask(task);
    let taskOutput = await this.taskOutputWithTool(task);

    if (!this.isRunningRef.current) return;

    // print the task output
    this.printer.printTaskOutput(taskOutput, task);

    if (!this.isRunningRef.current) return;

    // Find the task index in the task list
    const taskIndex = this.taskList.findIndex((t) => t.id === task.id);

    // Update the task status
    this.taskList[taskIndex].output = taskOutput;
    this.taskList[taskIndex].status = 'complete';
  }

  // Override AgentExecuter
  async prepare() {
    super.prepare();
    // 1. Create task list
    await this.taskCreation();
  }

  async loop() {
    // Continue the loop while there are incomplete tasks
    while (
      this.isRunningRef.current &&
      this.taskList.some((task) => task.status === 'incomplete')
    ) {
      if (!this.isRunningRef.current) {
        break;
      }

      this.statusCallback({ type: 'preparing' });

      const incompleteTasks = this.taskList.filter(
        (task) => task.status === 'incomplete',
      );
      // Filter tasks that have all their dependencies completed
      const executableTasks = incompleteTasks.filter((task) => {
        if (!task.dependentTaskIds) return true;
        return task.dependentTaskIds.every((id) => {
          const dependentTask = getTaskById(this.taskList, id);
          return dependentTask?.status === 'complete';
        });
      });

      // Execute all executable tasks in parallel
      await Promise.all(executableTasks.map((task) => this.executeTask(task)));
    }
  }

  async finishup() {
    if (!this.isRunningRef.current) {
      this.statusCallback({ type: 'finished' });
      return;
    }
    const id = this.taskList[this.taskList.length - 1].id + 1;
    this.printer.printTaskList(this.taskList, id);

    super.finishup();
  }

  async userInput(message: string): Promise<void> {
    if (this.userInputResolver) {
      this.userInputResolver(message);
      this.userInputResolver = null;
      this.userInputPromise = null;
    }
  }

  getUserInput(task: AgentTask) {
    this.messageCallback(
      setupMessage('user-input', task.task, task.tool, undefined, task.id),
    );
    toast.message(translate('USER_INPUT_WAITING', 'message'));
    this.statusCallback({ type: 'user-input' });
    this.userInputPromise = new Promise((resolve) => {
      this.userInputResolver = resolve;
    });
    return this.userInputPromise;
  }
}
