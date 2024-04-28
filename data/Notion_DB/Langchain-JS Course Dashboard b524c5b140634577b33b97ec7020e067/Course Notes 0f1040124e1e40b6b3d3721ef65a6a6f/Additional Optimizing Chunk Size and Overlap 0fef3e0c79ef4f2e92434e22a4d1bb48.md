# Additional: Optimizing Chunk Size and Overlap

Last Updated: April 5, 2024 1:05 PM

### Q: How to split the documents to get more context?

- I'm using documents with a lot of context.
- For example, if I want to search for a cooking document about how to make spaghetti, let's say that is a long tutorial about how to make spaghetti; it has more or less 155 pages.
- Splitting into shorter chunks is a problem because how does the LLM know that these chunks have relationships between them?
- I had to increase the chunks to 7000, this is a "solution" because It has more context, but the problem begins with the fact that I only get responses from the first context, so I only got correct responses from the first context.
- As for the second context, the LLM doesn't know that it has a relation with the first context, so it doesn't appear.
    
    I'm using this code:
    
    ```markdown
    
    const chain = RetrievalQAWithSourcesChain.fromLLM(model, vectorStore.asRetriever(3), {
    		maxTokens: 5000,
    		maxAnswerTokens: 5000,
    		returnSourceDocuments: true,
    		verbose: true,
    });
    ```
    

### A: We need to play around with `chunkSize` and `chunkOverlap`

You've raised a very important question. Maintaining context between chunks, especially for longer documents, is indeed a challenge.

In general, we use chunk overlaps to maintain relationships between consecutive chunks, which can be crucial for something like a step-by-step recipe.

However, I think in your case, both the chunk size and chunk overlap might need to be increased to preserve more context. Here is an example with a chunk size of 500 and overlap of 100:

`1. const splitter = new CharacterTextSplitter({
2.   separator: " ",
3.   chunkSize: 500,
4.   chunkOverlap: 100,
5. });`

The appropriate chunk size and overlap will depend on the length and complexity of your documents. You might need to experiment with different values to find the right balance. E.g., if you're losing a lot of meaning, increase chunk overlap. If you're finding that there is not enough context in each chunk, increase the chunk size. Of course, more embeddings = higher API costs, so be wary of that.

ALSO, please note that increasing the chunk overlap causes some duplication of information across chunks (e.g. if Chunk A = Step 1,2,3 then Chunk B may have Step 3,4,5 => therefore you have more data than necessary in the vector DB => therefore may affect performance).  It's a tradeoff that you'll need to experiment with and adjust according to your specific use case. Perhaps it's better to first SUMMARIZE the entire step by step recipe, and insert that into a vector database? That could also be interesting.

I hope this helps, and please let me know if you have any other questions! Please make sure to join the Discord too!