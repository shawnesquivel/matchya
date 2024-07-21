from pinecone import Pinecone
from dotenv import load_dotenv
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
