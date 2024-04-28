# 4.0 Chat with PDFs

Module: Module 4
Type: Dashboard
Last Updated: April 5, 2024 1:05 PM

### Summary

This application is a chatbot that uses AI to answer user queries based on the content of uploaded PDF documents. 

It provides an interface for users to upload a document, ask questions related to it, and get answers extracted from the content of the uploaded document. 

AI models are used for document processing and extracting relevant responses to user queries.

## Step by Step Overview

- **Step 1: Front-end Interaction**
    
    The codebase starts with a front-end implemented in ReactJS. Here are the main points:
    
    - A PDFLoader React component is created which renders the user interface.
    - The useState() hook is used to manage the state variables `prompt`, `messages`, and `error`.
    - User types a question in the PromptBox component, which triggers the `handlePromptChange()` function to store the user input in the `prompt` state variable.
    - The user then hits 'Submit', triggering `handleSubmitPrompt()` function, which sends a POST request to the backend with the current `prompt` as a query.
    - The backend processes this query and sends back a response. This response is parsed and displayed to the user through the ResultWithSources component.

- **Step 2: Uploading and Processing the PDF**
    
    The splitting of documents into chunks is essential for dealing with large amounts of text data that needs to be processed by AI Language Models, which have a maximum token limit.
    
    Once the PDF file is uploaded, it needs to be processed and stored in a format suitable for future querying. This is handled by the first part of the back-end code. Here's the step-by-step process:
    
    - The PDFLoader class from langchain is used to load the uploaded PDF file.
    - Once loaded, the documents in the file are split into smaller chunks using the CharacterTextSplitter class from langchain. This is done to accommodate the limitations of Language Models which can process only a certain amount of text at a time.
    - The metadata associated with each chunk is reduced to fit within the size limit set by Pinecone. This involves removing unnecessary fields from the metadata.
    - Finally, the chunks with their reduced metadata are uploaded to a Pinecone database using the PineconeClient class from pinecone-database.

- **Step 3: Querying the Database**
    
    The final step involves processing a user's search query and retrieving relevant results from the Pinecone database. Here's how this works:
    
    - The back-end code receives a search query from the user.
    - The PineconeClient class is used to establish a connection with the Pinecone database, where the chunks of the PDF documents are stored.
    - A vector database search is performed using the VectorDBQAChain class from langchain. This class uses the OpenAI Language Models to process and understand the user's query. The results are then returned based on the similarity search in the vector database.
    - The response is then sent back to the front-end, where it is displayed to the user.
    
    The core AI part of this step involves the use of OpenAI's Language Models for processing and understanding the user's query. The concept of similarity search in a vector database is also an important part of AI, allowing for efficient retrieval of information based on semantic similarity rather than simple keyword matching.
    

### **Warning: Could not find a preferred cmap table when uploading PDF to vector database**

***Question by Yehonatan Yosefi***
We can ignore that warning message. It's due to the PDF parsing when using PDFLoader from LangChain. 

"CMAP" stands for charactermap, which each font has. It helps the software understand how to translate character codes. 

The error is saying that, for some of the fonts in your PDF, the software is expecting a particular type of character map (a cmap table identified as "(0, 1)"), but it's not finding it. So the software doesn't know how to handle these fonts correctly.

It's warning you that it may not be able to display some characters correctly. If cmap cannot be found, it will default to another cmap. If not, it will throw an error. So just be wary when using PDFs that have a lot of weird text in them, that some of the Page Content may not load.

In our case, the resume querying looked relatively good, but this could be something to be improved (e.g. only use standard fonts, no special chracters, etc.)

source: [https://github.com/mozilla/pdf.js/issues/4800](https://github.com/mozilla/pdf.js/issues/4800) **June 5, 2023 10:27 AM**

### Can we change the max tokens of the output, to get a longer answer?

[Asked by **@BorjaSoler**](https://discord.com/channels/1109163589375373472/1110318485470466078/1116392583388729486) 

Answer:
Yes, just modify the maxTokens parameter on your model instantiation. If you're interested in the default values, just `console.log(model)` and it should show you the maxTokens value 

```tsx

const model = new OpenAI({
  maxTokens: 500, // Set the desired maxTokens value
});
```

### Question: Regarding PDF chatbot, how can we change the initial prompt or give a few examples of how the answer should look like?

[Asked by **@BorjaSoler**](https://discord.com/channels/1109163589375373472/1110318485470466078/1116392583388729486) 
 E.g. tell it to be as verbose as possible. We go over this more in the Social Media Assistant project and RoboHR projects, you can check the solutions for those files, and they will show you different Prompt Template examples.

```tsx
//modify this as necessary
const customPromptTemplate = new BasePromptTemplate(`The following is a detailed answer to the question:

Question: {query}

Answer:`);

const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
  k: 1,
  returnSourceDocuments: true,
  prompt: customPromptTemplate,
});

const response = await chain.call({ query: input });
```