import os

from langchain_pinecone import PineconeVectorStore

"""
pip install --upgrade --quiet  youtube-transcript-api
"""

from langchain_community.document_loaders import YoutubeLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
"""
https://python.langchain.com/docs/use_cases/web_scraping
pip install langchain-openai langchain playwright beautifulsoup4
playwright install
playwright install-deps
"""
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer

"""
pip install pypdf
"""

# Open Source Embeddings
from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
from langchain_openai import OpenAIEmbeddings

"""
https://python.langchain.com/docs/integrations/vectorstores/chroma/
pip install chromadb
"""
from langchain_community.document_loaders import (
    PyPDFLoader,
    GithubFileLoader,
    GitLoader,
    NotionDirectoryLoader,
)


from dotenv import load_dotenv

load_dotenv()


def github_files_to_docs(username, repository):
    """

    Load all the JSX and JSON files from a repo.

    TODO: not working atm. See Langchain issue: https://github.com/langchain-ai/langchain/issues/17453
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


if __name__ == "__main__":
    """Upload PDFs"""
    docs = pdf_folder_to_docs("pdfs")
    print(docs)
    print(len(docs))
    status = upload_documents_to_pinecone(docs)
    print(status)
    """Upload GitHub Directory"""
    docs = github_files_to_docs("shawnesquivel", "openai-javascript-course")
    print(docs)
    status = upload_documents_to_pinecone(docs)
    print(status)