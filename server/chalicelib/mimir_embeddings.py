from langchain_openai import OpenAIEmbeddings
from chalicelib.mimir_loaders import youtube_to_docs, website_to_docs
import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore
from chalicelib.utils_s3 import get_ssm_parameter
from openai import OpenAI

client = OpenAI(api_key=get_ssm_parameter("OPENAI_API_KEY"))
load_dotenv()


def get_embedding(text, model="text-embedding-3-small"):
    try:
        text = text.replace("\n", " ")
        return client.embeddings.create(input=[text], model=model).data[0].embedding
    except Exception as e:
        raise Exception(e)


def therapist_similarity_search(user_msg) -> str:
    """
    Do a similarity search on the Pinecone vector store.

    Documentation
    ----
    https://api.python.langchain.com/en/latest/vectorstores/langchain_pinecone.vectorstores.PineconeVectorStore.html#langchain_pinecone.vectorstores.PineconeVectorStore.similarity_search
    """
    try:
        pc = Pinecone(api_key=get_ssm_parameter("PINECONE_API_KEY"))
        index = pc.Index(get_ssm_parameter("PINECONE_INDEX"))

        print(f"Check Index: {index} {get_ssm_parameter('PINECONE_INDEX')}")

        search_embedding = get_embedding(user_msg)

        response = index.query(
            vector=search_embedding,
            filter={"languages": {"$eq": "English"}},
            top_k=3,
            include_values=False,
            include_metadata=True,
        )
        return str(response)
    except Exception as e:
        error = f"Error in similarity search: {e}"
        print(error)
        raise Exception(error)
