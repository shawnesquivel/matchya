"""
pip install --upgrade --quiet  youtube-transcript-api pypdf langchain-openai langchain pinecone
"""
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.document_loaders import (
    PyPDFLoader,
    GithubFileLoader,
)
from dotenv import load_dotenv
import os
load_dotenv()

def github_files_to_docs(username, repository):
    """
    Load all the JSX and JSON files from a repo.

    If you have issues: https://github.com/langchain-ai/langchain/issues/17453
    """
    loader = GithubFileLoader(
        repo=f"{username}/{repository}",  # username/repo
        access_token=os.getenv("GITHUB_PERSONAL_ACCESS_TOKEN"),
        github_api_url="https://api.github.com",
        file_filter=lambda file_path: file_path.endswith(
            (".jsx", ".json")
        ),  # add file types in a tuple
    )
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=250, chunk_overlap=50)
    docs = loader.load_and_split(text_splitter=text_splitter)
    return docs

def pdf_folder_to_docs(folder_path):
    """
    Load all PDFs in a directory and split them into documents.
    Each PDF file is loaded and processed individually using the PyPDFLoader.
    """
    # Initialize an empty list to hold all documents from all PDF files.
    all_docs = []

    # Iterate over each file in the specified directory.
    for filename in os.listdir(folder_path):
        # Check if the file is a PDF by its extension.
        if filename.endswith(".pdf"):
            # Construct the full path to the PDF file.
            file_path = os.path.join(folder_path, filename)
            print(
                f"Processing {file_path}..."
            )  # Optional: print the file being processed.

            # Load and split the PDF into documents.
            loader = PyPDFLoader(file_path)
            docs = loader.load_and_split()

            # Add the documents from this PDF to the list of all documents.
            all_docs.extend(docs)

    # Optionally, print the length of all documents loaded and the content of a specific one.
    print(f"Total documents loaded: {len(all_docs)}")

    return all_docs

def upload_documents_to_pinecone(documents, index_name="ai41"):
    """Uses the OpenAI Embeddings model to upload a list of documents to a Pinecone index."""
    if not documents:
        print(f"ERROR: Incomplete documents: {documents}")
        return False

    embeddings_model = OpenAIEmbeddings(
        model="text-embedding-ada-002", openai_api_key=os.getenv("OPENAI_API_KEY"), disallowed_special=()
    )

    db = PineconeVectorStore.from_existing_index(
        embedding=embeddings_model, index_name=index_name
    )

    upload_status = db.add_documents(documents=documents)

    return upload_status


def pinecone_similarity_search(user_msg, index_name="ai41") -> str:
    """
    Do a similarity search on the Pinecone vector store.

    Documentation
    ----
    https://api.python.langchain.com/en/latest/vectorstores/langchain_pinecone.vectorstores.PineconeVectorStore.html#langchain_pinecone.vectorstores.PineconeVectorStore.similarity_search
    """
    try:
        embeddings_model = OpenAIEmbeddings(
            model="text-embedding-ada-002", openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        vectorstore = PineconeVectorStore.from_existing_index(
            embedding=embeddings_model, index_name=index_name
        )

        result = vectorstore.similarity_search(query=user_msg, k=6)

        return str(result)
    except Exception as e:
        error = f"Error in similarity search: {e}"
        return error

if __name__ == "__main__":
    """Upload PDFs (do this once)"""
    docs = pdf_folder_to_docs("pdfs")
    print(docs)
    print(len(docs))
    status = upload_documents_to_pinecone(docs)
    print(status)
    """Upload GitHub Directory (do this once)"""
    docs = github_files_to_docs("shawnesquivel", "ai-41-start")
    print(docs)
    status = upload_documents_to_pinecone(docs)
    print(status)
    """Test it out"""
    # result = pinecone_similarity_search("what is chain of thought?")
    # print(result)