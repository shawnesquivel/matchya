"""
Dependencies:
1. pip install --upgrade --quiet  youtube-transcript-api pypdf langchain-openai langchain playwright beautifulsoup4
2. playwright install
3. playwright install-deps
"""
from langchain_community.document_loaders import YoutubeLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer
from dotenv import load_dotenv
load_dotenv()

"""
Helper Functions
"""

def update_docs_metadata(document_list, additional_metadata):
    """Helper: Iterate through a list of documents and update metadata key."""
    for document in document_list:
        document.metadata.update(additional_metadata)

    print(f"updated metadata: {document_list[0].metadata}")
    return document_list

"""
Function Calling
"""

def youtube_to_docs(url, additional_metadata={}):
    """Turn a YouTube link into the LangChain document format."""
    # Create documents
    loader = YoutubeLoader.from_youtube_url(url, add_video_info=False)
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=250, chunk_overlap=50)
    # Split according to text splitter
    docs = loader.load_and_split(text_splitter=text_splitter)

    if additional_metadata:
        update_docs_metadata(docs, additional_metadata)

    print(f"youtube: {len(docs)}")
    print(docs)
    return docs


def website_to_docs(url, additional_metadata={}):
    """Given a website URL, create a list of Langchain Documents"""
    # Create Documents
    loader = AsyncChromiumLoader([url])
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=250, chunk_overlap=50)
    raw_docs = loader.load_and_split(text_splitter=text_splitter)
    # Transform into a good format
    bs_transformer = BeautifulSoupTransformer()
    docs = bs_transformer.transform_documents(raw_docs)


    print(f"bs: {docs[0].page_content}")
    print(f"website: {len(docs)}")

    if additional_metadata:
        update_docs_metadata(docs, additional_metadata)

    return docs
