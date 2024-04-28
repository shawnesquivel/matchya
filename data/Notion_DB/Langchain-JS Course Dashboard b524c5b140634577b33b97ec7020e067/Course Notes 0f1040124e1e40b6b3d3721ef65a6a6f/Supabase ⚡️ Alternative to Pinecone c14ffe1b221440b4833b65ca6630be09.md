# Supabase ⚡️: Alternative to Pinecone

Type: Dashboard
Last Updated: April 5, 2024 1:05 PM

### Why?

- Pinecone free trial puts people on waitlist!!
- We need an alternative that is well supported on serverless environments (NextJS)

### Which Vector Database to Use?

- Once you’ve learned HNSWLib/Pinecone, you should be able to swap out the vector store for any other service!
- Performance doesn’t matter too much for the start, they are all relatively good for small use cases
- However, if you really want to optimize performance, check out this analysis:
    - [https://farfetchtechblog.com/en/blog/post/powering-ai-with-vector-databases-a-benchmark-part-i/](https://farfetchtechblog.com/en/blog/post/powering-ai-with-vector-databases-a-benchmark-part-i/)
    - [https://www.farfetchtechblog.com/en/blog/post/powering-ai-with-vector-databases-a-benchmark-part-ii/](https://www.farfetchtechblog.com/en/blog/post/powering-ai-with-vector-databases-a-benchmark-part-ii/)
- Latest news on Vector Databases, a huge new field due to AI
    - [https://www.reddit.com/r/vectordatabase/](https://www.reddit.com/r/vectordatabase/)
    - 

### What is Supabase?

- Open source Firebase alternative [https://www.youtube.com/watch?v=zBZgdTb-dns](https://www.youtube.com/watch?v=zBZgdTb-dns)
- Client side SDK (Software Development Kit) to connect services to your frontend
- Includes Auth, Databases, and now Vector Databases!
- AMAZING DOCUMENTATION!
- The 100 second tutorial: [https://www.youtube.com/watch?v=zBZgdTb-dns](https://www.youtube.com/watch?v=zBZgdTb-dns)

### Benefits of Supabase

- `pgvector` support [https://supabase.com/blog/openai-embeddings-postgres-vector#more-pgvector-and-chatgpt-resources](https://supabase.com/blog/openai-embeddings-postgres-vector#more-pgvector-and-chatgpt-resources)
- Relatively easy setup, not as easy Pinecone, but more well established!
- Many additional features within the ecosystem
    - Authorization - to let users sign up to the app (Tutorial: [https://www.youtube.com/watch?v=H1V716XPUEs](https://www.youtube.com/watch?v=H1V716XPUEs))
- Well established ecosystem
- Generous free tier

### Adding Supabase to LangChain Projects

1. Create Supabase account 
2. Create project
3. Create table
4. Get `SUPABASE_PRIVATE_KEY` and `SUPABASE_URL` and add to your `.env` file
    - Screenshot (go to lefthand side of screen and click Gear icon (settings)
        
        ![Untitled](Supabase%20%E2%9A%A1%EF%B8%8F%20Alternative%20to%20Pinecone%20c14ffe1b221440b4833b65ca6630be09/Untitled.png)
        
5. Add to `next.config.js` file
6. Check table

### Link

[1] Docs [https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase](https://js.langchain.com/docs/modules/indexes/vector_stores/integrations/supabase)

[2] About pgvector [https://supabase.com/blog/openai-embeddings-postgres-vector](https://supabase.com/blog/openai-embeddings-postgres-vector)