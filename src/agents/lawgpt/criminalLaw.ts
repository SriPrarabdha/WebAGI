// import { getUserApiKey } from '@/utils/settings';
// import { OpenAIChat } from 'langchain/llms/openai';
// import {PineconeHybridSearchRetriever} from 'langchain/retrievers'


const lawGPT = async (question: string) => {
    const url = "https://langchain-e2c6684ec1.wolf.jina.ai/"+question
    try {
      const response = await fetch(url);
      console.log(response.json);
      return response.json;
    } catch (error) {
      console.error(`Error while fetching the URL: ${error}`);
      return '';
    }
  };

export default lawGPT;
