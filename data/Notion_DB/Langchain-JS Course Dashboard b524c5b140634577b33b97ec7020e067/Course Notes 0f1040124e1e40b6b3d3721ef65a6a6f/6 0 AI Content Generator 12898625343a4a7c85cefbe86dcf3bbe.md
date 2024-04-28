# 6.0 AI Content Generator

Module: Module 6
Type: Dashboard
Last Updated: April 5, 2024 1:05 PM

### How to Get Your API Keys

- IMPORTANT: SerpAPI_API_Key [https://serpapi.com/](https://serpapi.com/)
- IMPORTANT: Google API Key (for video metadata) [https://console.cloud.google.com/apis/library/](https://console.cloud.google.com/apis/library/youtube.googleapis.com?project=langchain-385923)
    - Create an account
    - Create a new project
    - Search API library for `YouTube Data API V3`
    - Enable the API
    - Copy API key into `.env` file and make sure `next.config.js` has GOOGLE_API_KEY enabled

### Diagram

![Untitled](6%200%20AI%20Content%20Generator%2012898625343a4a7c85cefbe86dcf3bbe/Untitled.png)

## Overview

1. **Initializing the Language Learning Model (LLM):** Langchain provides a wrapper, **`ChatOpenAI`**, for interacting with OpenAI's chat models. The initialization includes setting the chat model's parameters, such as temperature and the specific model name.
2. **Constructing Prompts:** Langchain offers a series of prompt template classes (**`ChatPromptTemplate`**, **`HumanMessagePromptTemplate`**, and **`SystemMessagePromptTemplate`**) to create and format prompts in a structured manner. These prompts are used as inputs for the chat model, informing it of its role and the context it's operating within.
3. **Maintaining Conversational Context:** Langchain facilitates chaining together interactions with the chat model via the **`LLMChain`** class. This chain maintains the context of the conversation, allowing the chat model to generate responses that consider past interactions.
4. **Interaction with the Chat Model:** The **`call`** method in **`LLMChain`** is used to interact with the chat model, taking in a conversation prompt and returning the model's generated response.

### Troubleshooting: Why is my agent going in circles?

### Problem

I gave my agent a simple prompt - “who is Pedro Pascal?”

As you can see, partway through the LLM chain, my agent figures out the answer.

```tsx
[chain/start] [1:chain:llm_chain] Entering Chain run with input: {
  "input": "who is pedro pascal",
  "agent_scratchpad": "Question: Who is Pedro Pascal?\nThought: I am not sure who Pedro Pascal is.\nAction: search\nAction Input: \"Pedro Pascal\"\nObservation: José Pedro Balmaceda Pascal is a Chilean-born American actor. After nearly two decades of taking small roles in film and television, Pascal rose to prominence for portraying Oberyn Martell during the fourth season of the HBO fantasy series Game of Thrones and Javier Peña in the Netflix crime series Narcos.\nThought:Question: Who is Pedro Pascal?\nThought: I could search for Pedro Pascal's name or look him up on a website to find out\nAction: Search\nAction Input: \"Pedro Pascal\"\nObservation: José Pedro Balmaceda Pascal is a Chilean-born American actor. After nearly two decades of taking small roles in film and television, Pascal rose to prominence for portraying Oberyn Martell during the fourth season of the HBO fantasy series Game of Thrones and Javier Peña in the Netflix crime series Narcos.\nThought:Question: who is pedro pascal?\nThought: I think it's a current events question, so I should use a search engine.\nAction: search\nAction Input: \"pedro pascal\"\nObservation: José Pedro Balmaceda Pascal is a Chilean-born American actor. After nearly two decades of taking small roles in film and television, Pascal rose to prominence for portraying Oberyn Martell during the fourth season of the HBO fantasy series Game on'

and so on...
```

However, it seems to keep going and doesn’t know when to stop. it’s final result is that it doesn’t know, even though it clearly figured it out partway through.

```tsx

[llm/end] [1:chain:llm_chain > 2:llm:openai] [2.94s] Exiting LLM run with output: {
  "generations": [
    [
      {
        "text": "Question: who is pedro pascal?\nThought: I don't know who Pedro Pascal is.\nAction: search\nAction Input: \"Pedro Pascal\"",
        "message": {
          "text": "Question: who is pedro pascal?\nThought: I don't know who Pedro Pascal is.\nAction: search\nAction Input: \"Pedro Pascal\""
        }
      }
    ]
...
[chain/end] [1:chain:llm_chain] [2.94s] Exiting Chain run with output: {
  "text": "Question: who is pedro pascal?\nThought: I don't know who Pedro Pascal is.\nAction: search\nAction Input: \"Pedro Pascal\""
}
Agent stopped due to max iterations.
```

### Solution

The solution to this is to use `tool.turnDirect = true`  on our tools. This allows us to use the last response from the LLM even if it crashes.

### Theory: What are the different types of Agents?

**Action Agents** take one step at a time, deciding which tool to use and what input to provide based on the user input and the desired outcome.

- Good for small tasks

**Plan-and-Execute Agents** first decide on a plan of actions to take and then execute those actions one at a time. 

- Complex or long-running tasks that require maintaining long-term objectives and focus
- Generally more calls and higher latency.

It is often best to have an Action Agent be in charge of the execution for the Plan-and-Execute Agent.

[Plan-and-Execute Agent | 🦜️🔗 Langchain](https://js.langchain.com/docs/modules/agents/agents/plan_execute/)

### Additional Resources

- How LLM chains work [https://js.langchain.com/docs/modules/chains/llm_chain](https://js.langchain.com/docs/modules/chains/llm_chain)
- What’s an Agent? [https://js.langchain.com/docs/modules/agents/agents/](https://js.langchain.com/docs/modules/agents/agents/)
- Tools Available in Langchain JavaScript [https://js.langchain.com/docs/modules/agents/tools/integrations/](https://js.langchain.com/docs/modules/agents/tools/integrations/)
- Web Browser Tool [https://js.langchain.com/docs/modules/agents/tools/webbrowser](https://js.langchain.com/docs/modules/agents/tools/webbrowser)
- Prompt Templates [https://js.langchain.com/docs/modules/prompts/prompt_templates/](https://js.langchain.com/docs/modules/prompts/prompt_templates/)

### AgentExecutor.fromAgentAndTools

**`AgentExecutor.fromAgentAndTools`** is a method used to create an executor that calls to the agent until an answer is found. It takes an object with two properties: **`agent`** and **`tools`**. The **`agent`** property is an instance of an agent prompt chain, while the **`tools`** property is an array of tools that the agent can use. The executor runs the agent until it arrives at the final answer.