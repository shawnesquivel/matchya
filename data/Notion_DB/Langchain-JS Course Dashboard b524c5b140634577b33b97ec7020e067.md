# Langchain-JS Course Dashboard

<aside>
👋🏼 **Hi there!** Welcome to the course. You can find all resources mentioned in the course videos here. Feel free to ping me on [Discord](https://discord.com/invite/HqEJZGGt97) if you have any issues with the notes.

</aside>

## Quick Links ⚠️

> [**Discord Community ↗**](https://discord.gg/HqEJZGGt97)
> 

> [GitHub Repository](https://github.com/shawnesquivel/openai-javascript-course/tree/1-start-here) ↗️
> 

> [Udemy Course ↗️](https://www.udemy.com/course/langchain-develop-ai-web-apps-with-javascript-and-langchain/learn/#overview)
> 

### LangChain Resources ⚠️

- [LangChain GPT (KapaAI)](https://discord.gg/YGAu3Yt2sm)
- [LangChain JavaScript Docs](https://js.langchain.com/docs/)
- [**Reported errors from students**](Langchain-JS%20Course%20Dashboard%20b524c5b140634577b33b97ec7020e067.md)

### API Keys 🔑

- [OpenAI](https://platform.openai.com/signup)
- [YouTube Data API](https://developers.google.com/)
- [SerpAPI](https://serpapi.com/?gclid=EAIaIQobChMIqaCPtZGh_wIVexatBh1JeQFYEAAYASAAEgIr6vD_BwE)
- [Pinecone](https://www.pinecone.io/)

### Clone the [Repository](https://github.com/shawnesquivel/openai-javascript-course/tree/1-start-here) ⚠️

```tsx
git clone https://github.com/shawnesquivel/openai-javascript-course.git
```

## Socials 🔗

> **[Twitter ↗](https://twitter.com/shawnsqvl)**
> 

> **[YouTube ↗](https://www.youtube.com/@shawnsqvl)**
> 

> **[LinkedIn ↗](https://www.linkedin.com/in/shawnesquivel)**
> 

> **[Instagram ↗](https://www.instagram.com/shawnsqvl/)**
> 

### Developer Environment 🌳

- [Visual Studio Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [NodeJS (need v18 or higher)](https://nodejs.org/en)

## 📚 Modules

[Untitled Database](Langchain-JS%20Course%20Dashboard%20b524c5b140634577b33b97ec7020e067/Untitled%20Database%20afe52b70713f42b0b5b0a83bd06245b0.csv)

# All Course Notes

[Course Notes](Langchain-JS%20Course%20Dashboard%20b524c5b140634577b33b97ec7020e067/Course%20Notes%200f1040124e1e40b6b3d3721ef65a6a6f.csv)

# Langchain Theory 🦜

[Theory: OpenAI vs ChatOpenAI?](Langchain-JS%20Course%20Dashboard%20b524c5b140634577b33b97ec7020e067/Theory%20OpenAI%20vs%20ChatOpenAI%20dbfb8207e26b4d9ea150b68860d2498a.md)

[**Summarization Chains**](Langchain-JS%20Course%20Dashboard%20b524c5b140634577b33b97ec7020e067/Summarization%20Chains%20bd5959aa6c3f49f7b95b3784d35a0d44.md)

[Vector Database Similarity Metrics](Langchain-JS%20Course%20Dashboard%20b524c5b140634577b33b97ec7020e067/Vector%20Database%20Similarity%20Metrics%200d6fc2dead484b52afee6ce9463f8413.md)

# Reported Bugs + How to Fix ⚡

### Here are some common errors students run into!

- Pinecone Upsert Error (applies to Project 4, Project 7 when uploading to Pinecone)
    1. Check dimension size is 1536 (open AI embeddings max dimensions)
    2. Try shorten name of vector store 
        1. ❌ open-ai-embeddings-vector-store
        2. ✅ embeddings-vs
    3. Ensure Node Version 18 and higher
    - Source: [https://github.com/mayooear/gpt4-pdf-chatbot-langchain/issues/97](https://github.com/mayooear/gpt4-pdf-chatbot-langchain/issues/97)
- **ReferenceError: fetch is not defined** ⇒ Fix: Update NodeJS
    - Error message
        
        ```tsx
        [agent/action] [1:chain:agent_executor] Agent selected action: {
          "tool": "search",
          "toolInput": "langchain",
          "log": " I need to find out what langchain is.\nAction: search\nAction Input: \"langchain\""
        }
        [tool/start] [1:chain:agent_executor > 4:tool:search] Entering Tool run with input: "langchain"
        [tool/error] [1:chain:agent_executor > 4:tool:search] [1ms] Tool run errored with error: "fetch is not defined"
        [chain/error] [1:chain:agent_executor] [2.74s] Chain run errored with error: "fetch is not defined"
        file:///Users/nilton/Desktop/udemy/openai-javascript-course/node_modules/langchain/dist/tools/serpapi.js:60
                const resp = await fetch(this.buildUrl("search", {
                             ^
        
        ReferenceError: fetch is not defined
            at SerpAPI._call (file:///Users/nilton/Desktop/udemy/openai-javascript-course/node_modules/langchain/dist/tools/serpapi.js:60:22)
            at SerpAPI.call (file:///Users/nilton/Desktop/udemy/openai-javascript-course/node_modules/langchain/dist/tools/base.js:23:33)
            at processTicksAndRejections (node:internal/process/task_queues:96:5)
            at async file:///Users/nilton/Desktop/udemy/openai-javascript-course/node_modules/langchain/dist/agents/executor.js:98:23
            at async Promise.all (index 0)
            at async AgentExecutor._call (file:///Users/nilton/Desktop/udemy/openai-javascript-course/node_modules/langchain/dist/agents/executor.js:94:30)
            at async AgentExecutor.call (file:///Users/nilton/Desktop/udemy/openai-javascript-course/node_modules/langchain/dist/chains/base.js:65:28)
            at async file:///Users/nilton/Desktop/udemy/openai-javascript-course/playground/quickstart.mjs:79:16
        ➜  playground git:(1-start-here) ✗
        
        ```
        
    - Reported in [this Discord channel](https://discord.com/channels/1109163589375373472/1110318485470466078/1114602208709836902)
    - Fix
        - Fetch is an experimental feature in NextJS and thus it is supported by later versions of Node
        - To use it without errors, we must update NodeJS version by one of the following ways
        - 
        - **Using NPM (EASIEST) — MacOS/Linux**
            
            "Using NPM:To update Node using NPM, do the following:
            
            Open the Terminal and check your current Node version: 
            
            `node -v` 
            
            Install n package using the following command:
            
            `npm install -g n`  or `sudo npm install -g n` (to download as admin)
            
            This command will install a tool called "n" which you can use to update Node easily.
            
            To update Node, run the following command in your terminal: 
            
            `n latest` or `sudo n latest` (to get latest version v20)
            
            `n stable` or `sudo n stable` (to get stable version v18)
            
            This command will install the latest version of Node on your system.Now you can verify that your update is complete by rechecking your Node version: node -v" [https://blog.hubspot.com/website/update-node-js](https://blog.hubspot.com/website/update-node-js)
            
        - Windows
            
            Run a Command Prompt or PowerShell as an Administrator.
            
            You can do this by:
            
            1. Searching for "Command Prompt" or "PowerShell" in the Start menu.
            2. Right-clicking the result, and then clicking "Run as administrator".
            
            If you're using the new Windows Terminal, you can open a new tab as an administrator by clicking the down arrow next to the tabs, clicking the "Command Prompt" or "PowerShell" option, and then clicking the "Run as administrator" checkbox before clicking "Submit".
            
            Then Run:
            
            `npm install -g n`
            
            `n stable`
            
        - Homebrew
            
            ```tsx
            brew update
            brew upgrade node
            ```
            
        - MacOS [(Source)](https://stackoverflow.com/a/19333717)
            
            Here's how I successfully upgraded from `v0.8.18` to `v0.10.20` **without any other requirements** like brew etc, (type these commands in the terminal):
            
            1. `sudo npm cache clean -f` (force) clear you npm cache
            2. `sudo npm install -g n` install [n](https://www.npmjs.com/package/n) (this might take a while)
            3. `sudo n stable` upgrade to the current stable version
            
            *Note that `sudo` might prompt your password.*
            
            *Additional note regarding step 3: `stable` can be exchanged for `latest`, `lts` (long term support) or any specific version number such as `0.10.20`.*
            

# shawn’s to do list

- [ ]  add long term memory
- [x]  add video for C++ fix
- [ ]  add update for LangChain + GPT functions
- [ ]  add video OpenAI Call costs, Embedding Costs,
    - Student Feedback +
        - Hey Shawn, the main reason that i bought the course is to get knower about Lang chain and how to price it. Maybe just an update of the course showing how to price. Beside I have a question **@shawn (course creator)** wasn’t it better to put the Lang Chain process in a NodeJs Backend and call it from the client NextJs? This could be helpful if I wanted to switch on a lang chain backend in Python for example.Message #share-or-ask-anything
        1. How do you price the AI projects since each interaction to openai will cost you money?
        2. ***June 23, 2023 8:15 AM*June 23, 2023 8:15 AM*June 23, 2023 8:15 AM***
            
            I didn't get from the course how Lang  chain works. Is it feeding in your entire data set each time. Say you have an entire book. Is that sent as chunked api requests costing you the total of all the requests ?
            
- [x]  update HNSW Lib next.config.js
- github
    - issue [https://github.com/hwchase17/langchainjs/issues/943](https://github.com/hwchase17/langchainjs/issues/943)
    - fix
    
    ![Untitled](Langchain-JS%20Course%20Dashboard%20b524c5b140634577b33b97ec7020e067/Untitled.png)