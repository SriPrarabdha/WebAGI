import { FC, useCallback, useEffect, useRef, useState } from 'react';
import va from '@vercel/analytics';
import {
  AgentStatus,
  AgentType,
  Execution,
  Message,
  MessageBlock,
  SelectItem,
  UserSettings,
} from '@/types';
import { Input } from './Input';
import AgentMessage from './AgentMessage';
import { AgentParameter } from './AgentParameter';
import { ProjectTile } from './ProjectTile';
import { AgentMessageHeader } from './AgentMessageHeader';
import {
  getExportText,
  getMessageBlocks,
  loadingAgentMessage,
} from '../../utils/message';
import { BabyAGI } from '@/agents/babyagi';
import { BabyBeeAGI } from '@/agents/babybeeagi/agent';
import { BabyCatAGI } from '@/agents/babycatagi/agent';
import { BabyDeerAGI } from '@/agents/babydeeragi/executer';
import lawGPT from '@/agents/lawgpt/criminalLaw';
import { AGENT, ITERATIONS, MODELS, SETTINGS_KEY } from '@/utils/constants';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useExecution } from '@/hooks/useExecution';
import { useExecutionStatus } from '@/hooks/useExecutionStatus';
import { translate } from '../../utils/translate';
import { AgentMessageFooter } from './AgentMessageFooter';
import axios from 'axios';
import { taskCompletedNotification } from '@/utils/notification';
import { MessageSummaryCard } from './MessageSummaryCard';
import { useTranslation } from 'next-i18next';
import { AgentMessageBlock } from './AgentMessageBlock';

import OutputMsg  from './OutputMsg';

export const Agent: FC = () => {
  const [model, setModel] = useState<SelectItem>(MODELS[1]);
  const [iterations, setIterations] = useState<SelectItem>(ITERATIONS[0]);
  const [objective, setObjective] = useState<string>('');
  const [firstTask, setFirstTask] = useState<string>(
    translate('FIRST_TASK_PLACEHOLDER', 'constants'),
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageBlocks, setMessageBlocks] = useState<MessageBlock[]>([]);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    type: 'ready',
  });
  const [agent, setAgent] = useState<
    BabyAGI | BabyBeeAGI | BabyCatAGI | BabyDeerAGI | null
  >(null);
  const [selectedAgent, setSelectedAgent] = useState<SelectItem>(AGENT[0]);
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    addExecution,
    updateExec,
    executions,
    selectedExecutionId,
    selectExecution,
  } = useExecution();
  const { isExecuting, setExecuting } = useExecutionStatus();

  const scrollToBottom = useCallback(() => {
    const behavior = isExecuting ? 'smooth' : 'auto';
    messagesEndRef.current?.scrollIntoView({ behavior: behavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageBlocks]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  useEffect(() => {
    if (selectedExecutionId) {
      const selectedExecution = executions.find(
        (exe) => exe.id === selectedExecutionId,
      );
      if (selectedExecution) {
        setMessages(selectedExecution.messages);
      }
    } else {
      setMessages([]);
      setObjective('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExecutionId]);

  useEffect(() => {
    const execution = executions.find((exe) => exe.id === selectedExecutionId);
    if (execution) {
      const updatedExecution: Execution = {
        ...execution,
        messages: messages,
      };
      updateExec(updatedExecution);
    }

    const blocks = getMessageBlocks(messages);
    setMessageBlocks(blocks);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n]);

  // manage data
  const saveNewData = async () => {
    const execution: Execution = {
      id: uuidv4(),
      name: objective,
      date: new Date().toISOString(),
      params: {
        objective: objective,
        model: model,
        iterations: iterations,
        firstTask: firstTask,
        agent: selectedAgent.id as AgentType,
      },
      messages: messages,
    };

    selectExecution(execution.id);
    await new Promise((resolve) => {
      addExecution(execution);
      resolve(null);
    });

    return execution;
  };

  // handler functions
  const messageHandler = (message: Message) => {
    setMessages((currentMessages) => {
      // if the message.type and id are the same, overwrite the message
      const index = currentMessages.findIndex(
        (msg) => msg.type === message.type && msg.id === message.id,
      );
      if (index !== -1) {
        const newMessages = [...currentMessages];
        newMessages[index] = message;
        return newMessages;
      }

      const updatedMessages = [...currentMessages, message];

      // show toast notification
      if (message.type === 'complete' || message.type === 'end-of-iterations') {
        toast.success(translate('ALL_TASKS_COMPLETED_TOAST', 'agent'));
        taskCompletedNotification(objective);
      } else if (message.type === 'done') {
        toast.success(translate('TASK_COMPLETED_TOAST', 'agent'));
      }

      return updatedMessages;
    });
  };

  const inputHandler = (value: string) => {
    setObjective(value);
  };

  const cancelHandle = () => {
    setAgent(null);
    setExecuting(false);
  };

  const [caseInfo , setCaseInfo] =useState<string>('');

  const startHandler = async (msg:string) => {
    if (needSettingsAlert()) {
      alert(translate('ALERT_SET_UP_API_KEY', 'agent'));
      return;
    }
    if (model.id === 'gpt-4') {
      const enabled = await enabledGPT4();
      if (!enabled) {
        alert(translate('ALERT_GPT_4_DISABLED', 'constants'));
        return;
      }
    }
   
    setMessages([]);
    setExecuting(true);
    const execution = await saveNewData();
    const verbose = false; // You can set this to true to see the agent's internal state

    // switch agent
    let agent = null;
    switch (selectedAgent.id) {
      case 'babyagi':
        agent = new BabyAGI(
          objective,
          model.id,
          Number(iterations.id),
          firstTask,
          execution.id,
          messageHandler,
          setAgentStatus,
          cancelHandle,
          language,
          verbose,
        );
        break;
      case 'babybeeagi':
        agent = new BabyBeeAGI(
          objective,
          model.id,
          firstTask,
          messageHandler,
          setAgentStatus,
          cancelHandle,
          language,
          verbose,
        );
        break;
      case 'babycatagi':
        agent = new BabyCatAGI(
          objective,
          model.id,
          messageHandler,
          setAgentStatus,
          cancelHandle,
          language,
          verbose,
        );
        break;
      case 'babydeeragi':
        agent = new BabyDeerAGI(
          objective,
          model.id,
          messageHandler,
          setAgentStatus,
          cancelHandle,
          language,
          verbose,
        );
        break;
    }
    setAgent(agent);
    agent?.start();

  

    va.track('Start', {
      model: model.id,
      agent: selectedAgent.id,
      iterations: iterations.id,
    });

    const resp=await lawGPT(msg);
    setCaseInfo(resp) ;
    console.log(resp);
      // console.log(caseInfo)
  };
  // console.log(caseInfo)

  const stopHandler = () => {
    setExecuting(false);
    agent?.stop();

    va.track('Stop');
  };

  const clearHandler = () => {
    setMessages([]);
    selectExecution(undefined);
    setAgentStatus({ type: 'ready' });

    va.track('New');
  };

  const copyHandler = () => {
    navigator.clipboard.writeText(getExportText(messages, selectedAgent.id));
    toast.success(translate('COPIED_TO_CLIPBOARD', 'agent'));

    va.track('CopyToClipboard');
  };

  const downloadHandler = () => {
    const element = document.createElement('a');
    const file = new Blob([getExportText(messages, selectedAgent.id)], {
      type: 'text/plain;charset=utf-8',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${objective.replace(/\s/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();

    va.track('Download');
  };

  const feedbackHandler = (isGood: boolean) => {
    let selectedExecution = executions.find(
      (exe) => exe.id === selectedExecutionId,
    );
    if (selectedExecution) {
      setMessages(selectedExecution.messages);
    }
    const feedbackObjective = selectedExecution?.params.objective;
    const feedbackModel = selectedExecution?.params.model.id;
    const feedbackAgent = selectedExecution?.params.agent;
    const feedbackIterations = Number(selectedExecution?.params.iterations.id);

    let lastResult = messages
      .filter(
        (message) =>
          message.type === 'task-output' || message.type === 'task-result',
      )
      .pop()?.text;
    if (feedbackAgent === 'babybeeagi') {
      lastResult = messages
        .filter((message) => message.type === 'task-result-summary')
        .pop()?.text;
    }
    const lastTaskList = messages
      .filter((message) => message.type === 'task-list')
      .pop()?.text;
    const sessionSummary = messages
      .filter((message) => message.type === 'session-summary')
      .pop()?.text;
    const iterationNumber = messages.filter(
      (message) => message.type === 'done',
    ).length;
    const finished =
      messages.filter(
        (message) =>
          message.type === 'complete' || message.type === 'end-of-iterations',
      ).length > 0;
    const output = getExportText(messages);

    axios.post('/api/feedback', {
      objective: feedbackObjective,
      evaluation: isGood ? 'good' : 'bad',
      model: feedbackModel,
      agent: feedbackAgent,
      iterations: feedbackIterations,
      last_result: lastResult,
      task_list: lastTaskList,
      session_summary: sessionSummary,
      iteration_number: iterationNumber,
      finished: finished,
      output: output,
    });

    toast.success(translate('FEEDBACK_SUBMITTED_TOAST', 'constants'));

    // update execution
    if (selectedExecution) {
      selectedExecution.evaluation = isGood ? 'good' : 'bad';
      updateExec(selectedExecution);
    }
  };

  const userInputHandler = async (text: string) => {
    if (agent instanceof BabyDeerAGI) {
      agent.userInput(text);
    }
  };

  const needSettingsAlert = () => {
    const useUserApiKey = process.env.NEXT_PUBLIC_USE_USER_API_KEY;
    if (useUserApiKey === 'false') {
      return false;
    }

    const userSettings = localStorage.getItem(SETTINGS_KEY);
    if (userSettings) {
      const { openAIApiKey } = JSON.parse(userSettings) as UserSettings;
      if (openAIApiKey && openAIApiKey?.length > 0) {
        return false;
      }
    }
    return true;
  };

  const enabledGPT4 = async () => {
    const userSettings = localStorage.getItem(SETTINGS_KEY);
    if (!userSettings) {
      return false;
    }

    const { enabledGPT4 } = JSON.parse(userSettings) as UserSettings;
    if (enabledGPT4 === undefined) {
      return true; // If no value is given, its enabled by default
    }

    return enabledGPT4;
  };

  const currentEvaluation = () => {
    const selectedExecution = executions.find(
      (exe) => exe.id === selectedExecutionId,
    );
    if (selectedExecution) {
      return selectedExecution.evaluation;
    }
    return undefined;
  };

  return (
    <div className="overflow-none relative flex-1 bg-white dark:bg-[#343541]">
      {messageBlocks.length === 0 ? (
        <>
          <AgentParameter
            model={model}
            setModel={setModel}
            iterations={iterations}
            setIterations={setIterations}
            firstTask={firstTask}
            setFirstTask={setFirstTask}
            agent={selectedAgent}
            setAgent={setSelectedAgent}
          />
          <div className="h-[calc(100vh-450px)]">
            <ProjectTile />
          </div>
        </>
      ) : (
        <div className="max-h-full overflow-scroll">
          <AgentMessageHeader model={model} agent={selectedAgent} />
          {messageBlocks.map((block, index) => (
            <AgentMessageBlock
              block={block}
              key={index}
              userInputCallback={userInputHandler}
            />
          ))}
          {isExecuting && (
            <>
            <AgentMessage message={loadingAgentMessage(agentStatus)} />
            </>
          )}
          {!isExecuting && messages.length > 0 && (
            <>
            <OutputMsg message={caseInfo}/>
            <AgentMessageFooter />
            </>
          )}
          <div
            className="h-[162px] bg-white dark:bg-[#343541]"
            ref={messagesEndRef}
          />
        </div>
      )}
      <Input
        value={objective}
        onChange={inputHandler}
        onStart={startHandler}
        onStop={stopHandler}
        onClear={clearHandler}
        onCopy={copyHandler}
        onDownload={downloadHandler}
        onFeedback={feedbackHandler}
        isExecuting={isExecuting}
        hasMessages={messages.length > 0}
        agent={selectedAgent.id as AgentType}
        evaluation={currentEvaluation()}
      />
    </div>
  );
};
