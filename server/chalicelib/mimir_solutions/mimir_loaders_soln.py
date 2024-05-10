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


def update_docs_metadata(document_list, additional_metadata):
    """Iterate through a list of documents and update metadata key."""
    for document in document_list:
        document.metadata.update(additional_metadata)

    print(f"updated metadata: {document_list[0].metadata}")
    return document_list


def youtube_to_docs(url, additional_metadata={}):
    loader = YoutubeLoader.from_youtube_url(url, add_video_info=False)
    # single doc
    # docs = loader.load()
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=250, chunk_overlap=50)
    docs = loader.load_and_split(text_splitter=text_splitter)

    if additional_metadata:
        update_docs_metadata(docs, additional_metadata)

    print(f"youtube: {len(docs)}")
    print(docs)
    return docs


def website_to_docs(url, additional_metadata={}):
    """Given a website, retrieve the text content"""
    loader = AsyncChromiumLoader([url])
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=250, chunk_overlap=50)
    raw_docs = loader.load_and_split(text_splitter=text_splitter)
    # raw html
    # print(raw_docs)

    bs_transformer = BeautifulSoupTransformer()
    docs = bs_transformer.transform_documents(raw_docs)

    # Result
    print(f"bs: {docs[0].page_content}")
    # print(len(docs))
    print(f"website: {len(docs)}")

    if additional_metadata:
        update_docs_metadata(docs, additional_metadata)

    return docs
