import os

"""
pip install --upgrade --quiet  youtube-transcript-api
"""

from langchain_community.document_loaders import YoutubeLoader
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

def notion_to_docs():
    """Hardcoded Notion file path as it is included."""
    loader = NotionDirectoryLoader("Notion_DB")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=250, chunk_overlap=50)
    docs = loader.load_and_split(text_splitter=text_splitter)
    return docs


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


def git_loader_to_docs(username, repository):
    """
    https://api.python.langchain.com/en/latest/document_loaders/langchain_community.document_loaders.git.GitLoader.html
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
    print(f"Git Loader: {len(docs)}")
    print(f"Git Loader: {docs[0].page_content[0:20]}")
    print(f"Git Loader: {docs[0].metadata}")
    return docs


if __name__ == "__main__":
    notion_to_docs()