# 5.0 YouTube Video Chatbot

Module: Module 5
Type: Dashboard
Last Updated: April 5, 2024 1:05 PM

### Overview

1. **Initialization**: The process starts with the conversion of the YouTube video transcript into a series of smaller, overlapping chunks using the CharacterTextSplitter.
2. **Embedding Creation**: Each of these text chunks is then transformed into a vector representation using OpenAIEmbeddings. This numerical representation retains the semantic meaning of the text.
3. **Vector Store Creation**: These vector representations are stored in a Vector Store (HNSWLib in this case). The vector store allows for efficient similarity search, helping to quickly locate the most relevant chunks of text when a question is asked.
4. **Chain Creation**: Next, a ConversationalRetrievalQAChain is created, which combines the language model (ChatOpenAI) and the Vector Store. This chain will handle the process of accepting a question, searching the vector store for relevant context, and generating an appropriate response.
5. **Question Processing**: When a question is received, the ConversationalRetrievalQAChain performs a search in the Vector Store to find the most relevant chunks of text. The results of this search, along with the question, are fed into the ChatOpenAI model.
6. **Answer Generation**: The ChatOpenAI model then uses the context from the vector store and the input question to generate a coherent and relevant response. This response is returned to the user, and the chat history is updated for context in subsequent questions.

### Diagram

![Untitled](5%200%20YouTube%20Video%20Chatbot%20a013220be58240f5baadcbfb0f237470/Untitled.png)

### Student Error: hnswlib-node not found

- Error message
    - hnswlib-node was not found
    
    [Discord - A New Way to Chat with Friends & Communities](https://discord.com/channels/1109163589375373472/1110318485470466078/1122769896045019136)
    
    ![Untitled](5%200%20YouTube%20Video%20Chatbot%20a013220be58240f5baadcbfb0f237470/Untitled%201.png)
    
- Fix
    - Was due to a newer version of langchain (0.0.96)
    - Fixed by downgrading to use 0.0.75 version of langchain by running:
    
    ```markdown
    npm uninstall langchain
    ```
    
    ```markdown
    npm install langchain@0.0.75 --save 
    ```
    
    - Shawn opened up a Github issue on June 26, 2023 on the LangChain Github Repo:
        - Hopefully they will fix it!
    
    [HNSWLib not compatible  · Issue #1764 · hwchase17/langchainjs](https://github.com/hwchase17/langchainjs/issues/1764)