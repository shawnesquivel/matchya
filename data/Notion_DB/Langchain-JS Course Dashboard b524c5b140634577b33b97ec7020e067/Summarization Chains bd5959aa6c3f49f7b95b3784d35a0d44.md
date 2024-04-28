# Summarization Chains

### This section best goes with

### Why?

The CombineDocuments chain is used when the amount of text to be processed exceeds the LLM's input limit. This chain allows for large documents, such as entire books or pages of search results, to be processed by the LLM. This is achieved through methods such as stuffing, map reduce, and refine.

- Conceptual Example for Map Reduce
    - Original Documents:
        
        **Document 1:**
        "The Lion King is a musical based on the 1994 Walt Disney Animation Studios' animated feature film of the same name with music by Elton John, lyrics by Tim Rice, and book by Roger Allers and Irene Mecchi, along with additional music and lyrics by Lebo M, Mark Mancina, Jay Rifkin, Julie Taymor, and Hans Zimmer."
        
        **Document 2:**
        "Directed by Taymor, the musical features actors in animal costumes as well as giant, hollow puppets. The show is produced by Disney Theatrical Productions."
        
        **Document 3:**
        "It debuted July 8, 1997, in Minneapolis, Minnesota at the Orpheum Theatre, and was an instant success before premiering on Broadway at the New Amsterdam Theater on October 15, 1997 in previews, with the official opening on November 13, 1997."
        
    - Summary of Documents
        
        First, using the Map phase, we ask the LLM to summarize each document individually:
        
        **Summary of Document 1:**
        "The Lion King is a musical adaptation of the 1994 Disney animated film, featuring music by Elton John and other artists."
        
        **Summary of Document 2:**
        "Directed by Julie Taymor, The Lion King musical incorporates actors in animal costumes and large puppets, and is produced by Disney Theatrical Productions."
        
        **Summary of Document 3:**
        "The Lion King musical debuted in Minneapolis in 1997, and after immediate success, it premiered on Broadway later that same year."
        
    - Final Prompt
        
        Now comes the Reduce phase, where we combine these summaries into a single, coherent summary.
        
        **Final Summary:**
        "The Lion King is a successful musical adaptation of the 1994 Disney film, featuring music by Elton John among others. The production, directed by Julie Taymor, is notable for its use of animal costumes and large puppets. It debuted in Minneapolis in 1997, and following its immediate success, premiered on Broadway the same year."
        
    
    So the Map Reduce technique allows us to take larger chunks of text and summarize them individually (Map phase), then combine those summaries into a final, overall summary (Reduce phase).
    

| Method | How It Works | Pros | Cons |
| --- | --- | --- | --- |
| Stuffing | Incorporates related documents from the vector database into the prompt.

This gives context to the LLM to give a good answer. | Single call to the LLM | If documents are too long, can exceed length |
| Map Reduce | Applies an initial prompt to each chunk. 
Each chunk is passed to the LLM as inputs.

EAch output is combined into a final output | More context per document | More calls to LLM |
| Refine | LLM summarizes documents one by one. |  |  |

### Types of Summarization

"Stuffing" involves incorporating related documents from the database into the prompt. These documents serve as context for the LLM, but this method has limitations if the documents are too long and exceed the context length.

The "Map Reduce" method involves applying an initial prompt to each chunk of data. Each chunk is then passed through the LLM to generate multiple responses. These initial outputs are then combined into one final output, necessitating more than one call to the LLM.

Finally, the "Refine" technique involves a process that has a local memory. The LLM summarizes the documents one by one, using the summaries generated so far to influence the next output, repeating until all documents have been processed.

In the provided block of code, the 'summarizeAllChain' function creates a Map Reduce chain that takes a series of documents as input, summarizes each document individually, and then combines all the summaries into a single output. This allows for efficient summarization of large volumes of text.

### Purpose

The **`loadSummarizationChain`** function in this context is used to set up a "summarization pipeline" using the Map Reduce method mentioned in the article.

This pipeline is designed to process a large number of documents, breaking them down into smaller, manageable chunks, summarizing each chunk individually, and then combining these summaries to produce a comprehensive summary of all the documents.

To put it simply, the purpose of the **`loadSummarizationChain`** function is to efficiently summarize a large collection of documents by breaking down the process into smaller, more manageable steps and then combining the results.

[data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2738%27%20height=%2738%27/%3e](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2738%27%20height=%2738%27/%3e)

### Map reduce is best used when you have a lot of input documents, as it reduces the overall size of the message to the LLM

 The **`loadSummarizationChain`** function, when combined with a Map Reduce approach, essentially condenses a large set of documents into a summary that can be handled by the LLM.

Here's how it works:

1. **The Map phase**: Each document (or a piece of a document, if they're very long) is summarized individually. This results in a set of shorter summaries.
2. **The Reduce phase:** These individual summaries are then combined (or 'reduced') into a final, comprehensive summary.

This process allows a large amount of information to be processed and understood by the LLM, even when the total amount of text exceeds the LLM's maximum token limit. By summarizing the documents first, we can fit more information into the language model's input.

So, yes, it's a technique to reduce the size of the input sent to the LLM when dealing with a large number of documents.

[data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2738%27%20height=%2738%27/%3e](data:image/svg+xml,%3csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2738%27%20height=%2738%27/%3e)

## Note: Map Reduce Loses Some Context

Summarization indeed involves a trade-off. 

The goal is to preserve the most important points or context from a document or a set of documents. However, because it's a condensed version, some details or nuances could be lost.

The quality and accuracy of the summarization largely depend on how good the AI model (in this case, the LLM) is at summarizing. An advanced language model will aim to keep the most relevant and important information intact, maintaining the overall context while reducing the length.

In the context of the **`loadSummarizationChain`** function, it's designed to perform summarization in such a way that the critical essence of each document is maintained before they are combined in the reduce phase. So while it's possible that some information may be lost in the process, the aim is to retain as much valuable and contextual information as possible.

Also, remember that the quality of the summary can be influenced by factors like the complexity of the text and the amount of detail contained within it. Therefore, the effectiveness of this approach can vary depending on the specific use case.

### Resources

To Learn More: [https://weaviate.io/blog/combining-langchain-and-weaviate](https://weaviate.io/blog/combining-langchain-and-weaviate)