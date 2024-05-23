from langchain_openai import OpenAIEmbeddings
from chalicelib.mimir_loaders import youtube_to_docs, website_to_docs
from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
import os
from dotenv import load_dotenv

load_dotenv()

"""
Helper Functions
"""

def initialize_pinecone_index(index_name: str = "langchain-ai41") -> bool:
    """
    Return the requested Pinecone index. If not found, create the index.
    """
    # Initialize index.
    try:
        if not os.environ.get("PINECONE_API_KEY", None):
            error_message = (
                f'Pinecone API key was not set {os.getenv("PINECONE_API_KEY")}'
            )
            print(error_message)
            # Forbidden
            return {"status_code": 403, "message": error_message}
        else:
            pc = Pinecone(
                api_key=os.environ.get("PINECONE_API_KEY"),
            )

        index_list = pc.list_indexes().names()
        print(f"List of indices in Pinecone: {index_list}")
        if index_name not in index_list:
            print(f"Index {index_name} was not found... Creating new index.")
            pc.create_index(
                name=index_name,
                dimension=1536,
                metric="euclidean",
                spec=ServerlessSpec(cloud="aws", region="us-west-2"),
            )
        pc_index = pc.Index(index_name)
        stats = pc_index.describe_index_stats()

        print(f"Index Exists: \n Index Stats for {index_name}: {stats}")
        return True
    except Exception as e:
        print(f"Error initializing Pinecone index: {e}")
        return False

def check_pinecone_index(index_name="langchain-ai41"):
    """Check a Pinecone Index stats."""
    pc = Pinecone(
        api_key=os.environ.get("PINECONE_API_KEY"),
    )
    pc_index = pc.Index(index_name)
    stats = pc_index.describe_index_stats()
    if stats.get("total_vector_count"):
        return True
    else:
        return False
    
"""
Function Calling Functions
"""
def pinecone_youtube_upload(youtube_url):
    """Function Calling: Add YouTube video to vector database"""
    print("CALLING YOUTUBE UPLOADER!")
    docs = youtube_to_docs(youtube_url)
    upload_status = upload_documents_to_pinecone(docs)
    print(f"uploaed to youtube: {docs}")
    print(f"upload status: {upload_status}")
    return f"Successfully uploaded {len(docs)} to Pinecone vector database."

def pinecone_website_upload(website_url):
    """Function Calling: Add website contents to vector database"""
    print("CALLING WEBSITE UPLOADER!")
    docs = website_to_docs(website_url)
    upload_status = upload_documents_to_pinecone(docs)
    print(f"uploaed to youtube: {docs}")
    print(f"upload status: {upload_status}")
    return f"Successfully uploaded {len(docs)} to Pinecone vector database."

"""
Write these functions
"""
def upload_documents_to_pinecone(documents, index_name="langchain-ai41"):
    """Uses the OpenAI Embeddings model to upload a list of documents to a Pinecone index."""
    return

def pinecone_similarity_search(user_msg, index_name="langchain-ai41") -> str:
    """
    Do a similarity search on the Pinecone vector store.

    Documentation
    ----
    https://api.python.langchain.com/en/latest/vectorstores/langchain_pinecone.vectorstores.PineconeVectorStore.html#langchain_pinecone.vectorstores.PineconeVectorStore.similarity_search
    """
    return

if __name__ == "__main__":
    result = pinecone_similarity_search("how to start a nextjs project")
    print(result)