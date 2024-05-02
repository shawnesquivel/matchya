import json
from langchain_openai import OpenAIEmbeddings
from chalicelib.loaders_solution import youtube_to_docs, website_to_docs

"""
https://python.langchain.com/docs/integrations/vectorstores/chroma/
pip install chromadb


Persistent Directory Example: https://github.com/hwchase17/chroma-langchain/blob/master/persistent-qa.ipynb
"""
from langchain_community.vectorstores import Chroma
import os
import chromadb
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from langchain_pinecone import PineconeVectorStore

load_dotenv()


def init_pinecone():
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    pc.create_index(
        name="langchain",
        dimension=1536,  # Replace with your model dimensions
        metric="euclidean",  # Replace with your model metric
        spec=ServerlessSpec(cloud="aws", region="us-west-2"),
    )


def upload_documents_to_pinecone(documents, index_name="langchain-ai41"):
    if not documents:
        print(f"ERROR: Incomplete documents: {documents}")
        return False

    embeddings_model = OpenAIEmbeddings(
        model="text-embedding-ada-002", openai_api_key=os.getenv("OPENAI_API_KEY")
    )

    db = PineconeVectorStore.from_existing_index(
        embedding=embeddings_model, index_name=index_name
    )

    upload_status = db.add_documents(documents=documents)
    print(f"uploaded!")

    check_pinecone_index()
    return upload_status


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
    """Check the current index stats"""
    pc = Pinecone(
        api_key=os.environ.get("PINECONE_API_KEY"),
    )
    pc_index = pc.Index(index_name)
    stats = pc_index.describe_index_stats()
    if stats.get("total_vector_count"):
        return True
    else:
        return False


def pinecone_similarity_search(user_msg, index_name="langchain-ai41") -> str:
    """
    Returns a string search so that OpenAI can understand.

    https://api.python.langchain.com/en/latest/vectorstores/langchain_pinecone.vectorstores.PineconeVectorStore.html#langchain_pinecone.vectorstores.PineconeVectorStore.similarity_search
    """

    embeddings_model = OpenAIEmbeddings(
        model="text-embedding-ada-002", openai_api_key=os.getenv("OPENAI_API_KEY")
    )

    vectorstore = PineconeVectorStore.from_existing_index(
        embedding=embeddings_model, index_name=index_name
    )
    result = vectorstore.similarity_search(query=user_msg, k=4)
    # print(result)
    return f"{result}"


def pinecone_youtube_upload(youtube_url):
    print("CALLING YOUTUBE UPLOADER!")
    docs = youtube_to_docs(youtube_url)
    upload_status = upload_documents_to_pinecone(docs)
    print(f"uploaed to youtube: {docs}")
    print(f"upload status: {upload_status}")
    return f"Successfully uploaded {len(docs)} to Pinecone vector database."


def pinecone_website_upload(website_url):
    print("CALLING WEBSITE UPLOADER!")
    docs = website_to_docs(website_url)
    upload_status = upload_documents_to_pinecone(docs)
    print(f"uploaed to youtube: {docs}")
    print(f"upload status: {upload_status}")
    return f"Successfully uploaded {len(docs)} to Pinecone vector database."
