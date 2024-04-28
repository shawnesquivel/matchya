# Vector Database Similarity Metrics

### Question from Valdeci Junior from 4.1 Pinecone Setup

I see in video you setting up Pinecone and the method indicated is "cosine" but in your screen show you using "enclidean" method. What is better? What is the difference?

[](https://www.udemy.com/course/langchain-develop-ai-web-apps-with-javascript-and-langchain/learn/lecture/38098536#questions/19917044)

### Diagram

![Untitled](Vector%20Database%20Similarity%20Metrics%200d6fc2dead484b52afee6ce9463f8413/Untitled.png)

[Measuring Similarity from Embeddings  |  Machine Learning  |  Google for Developers](https://developers.google.com/machine-learning/clustering/similarity/measuring-similarity)

### Answer

1. **Cosine Similarity (RECOMMENDED)**
    - How it works: Measures the cosine of the angle between two vectors. It is a measure of orientation, not magnitude.
    - Pros: Effective in high-dimensional spaces. Not affected by the magnitude of the vectors, making it great for text analyses where vectors are often sparse.
    - Cons: It's not a proper metric as it does not obey the triangle inequality, and it doesn't capture difference in magnitudes.
    - **When to use: When the angle between vectors matters more than their absolute magnitude. Particularly useful for text analysis and recommendation systems.**
2. **Euclidean Distance**
    - How it works: Measures the straight-line distance between two points in a vector space.
    - Pros: Simple to understand and compute. Great for lower-dimensional spaces.
    - Cons: Not effective in high-dimensional spaces due to the "curse of dimensionality". Affected by the scale of features.
    - When to use: When the vectors represent coordinates in a physical space or when the magnitude of the vectors matters. Also, when you're working in a lower-dimensional space.
        - E.g., Vector database is full of similar recipes so the magnitude of the vectors matters.
        - For instance, a small change in the cooking time or the calorie count could significantly affect the similarity of recipes.
        - A recipe that takes 60 minutes to cook is quite different from one that takes 20 minutes
        - Dish with 500 calories is different from one with 200 calories.
        - Euclidean distance, being sensitive to the magnitude of vectors, would capture these differences better than cosine similarity.
3. **Jaccard Similarity (not that relevant to us for LLM apps)**
    - How it works: Measures the intersection divided by the union of two sets. It is often used for comparing the similarity and diversity of sample sets.
    - Pros: Great for categorical data. It's simple, easy to understand, and it gives a value between 0 and 1.
    - Cons: Not suitable for numerical data or text data represented by count vectors or TF-IDF vectors. It also doesn't take into account the magnitude of the vectors.
    - When to use: When your data is categorical or can be represented as sets, like in market basket analysis, collaborative filtering, or clustering analyses.

### Additional Resources

[1] [https://www.pinecone.io/learn/vector-similarity/](https://www.pinecone.io/learn/vector-similarity/)

[2] [https://developers.google.com/machine-learning/clustering/similarity/measuring-similarity](https://developers.google.com/machine-learning/clustering/similarity/measuring-similarity)