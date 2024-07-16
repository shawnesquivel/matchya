import os
from dotenv import load_dotenv
from openai import OpenAI
from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
import json
import uuid
from langchain_community.document_loaders import AsyncChromiumLoader
from langchain_community.document_transformers import BeautifulSoupTransformer
import requests
from bs4 import BeautifulSoup
import time

import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_uuid():
    return str(uuid.uuid4())


def get_embedding(text, model="text-embedding-3-small"):
    try:
        text = text.replace("\n", " ")
        embedding = (
            client.embeddings.create(input=[text], model=model).data[0].embedding
        )
        print(f"Embedding success.")
        return embedding
    except Exception as e:
        raise Exception(f"Embedding Error: {e}")


def valid_metadata_size(metadata):
    """Check under 40KB limit"""
    metadata_json = json.dumps(metadata)
    size = len(metadata_json.encode("utf-8"))

    # Check if it exceeds Pinecone's limit
    if size < 40960:  # 40KB in bytes
        print(f"Metadata is under Pinecone's 40KB limit. {size}")
        return True
    else:
        print("Metadata is above Pinecone's 40KB limit.")
        return False


def upload_therapist(embedding, metadata):
    """Uses the OpenAI Embeddings model to upload a list of documents to a Pinecone index."""

    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    index = pc.Index(os.getenv("PINECONE_INDEX"))

    if not valid_metadata_size(metadata):
        return

    try:
        upsert_response = index.upsert(
            vectors=[
                {"id": generate_uuid(), "values": embedding, "metadata": metadata},
            ],
        )
        print(f"upsert response: {upsert_response}")
    except Exception as e:
        error = f"Upload Therapis Error: Embedding {len(embedding)} metadata: {metadata} -- ERROR {e}"
        raise Exception(error)

    return upsert_response


def main():

    bio = """
    Hi, I’m Andrew- a therapist with a passion for finding purpose and meaning in a world that can sometimes feel overwhelming and hard to make sense of.

 

    Before beginning my counselling training, I spent over 12 years in the Canadian Armed Forces. Seeing the impacts of operational deployments on my friends and colleagues, and leading soldiers through difficult spiritual, identity, relationship, and traumatic experiences led to a career transition and interest in working with stress-relief & resilience, and grief & trauma-survival for first responders and veterans.

    

    This experience taught me to connect with people by seeing the world through their eyes with nonjudgement and empathy. I believe in meeting you where you are and collaborating together on building a life you love.

    

    Whether you are seeking help after a long struggle, navigating a major turning point or just looking for someone to listen without judgement, I offer to help you on your journey towards living a fulfilling and meaningful life.

    

    I respect that healing, and even just reaching out for help, can be stressful. My commitment to you is to help you feel listened to, respected and understood."""
    embedding = get_embedding(bio)

    metadata = {
        "name": "Andrew Jarvis",
        "address": "470 Granville St #518, Vancouver, BC V6C 1V5",
        "clinic": "Thrive Downtown Counselling Centre",
        "direct_billing": True,
        "specialties": [
            "Identity, Meaning and Purpose",
            "Anxiety and Stress Management",
            "Trauma (PTSD) and Grief Recovery",
            "Relationships",
            "Couples Therapy",
            "Career and Life Transitions",
            "Planning",
            "Men's Issues and Masculinity",
            "First Responders and Other Uniformed Personnel (Military, Police, Corrections, Firefighters, Paramedics, and ER professionals)",
        ],
        "approaches": [
            "Emotion-Focused Therapy",
            "Person-Centred Therapy",
            "Narrative Therapy",
            "Existential",
            "Strengths-Based",
        ],
        "languages": ["English", "French & Québécois"],
        "qualifications": [
            "Master of Arts in Counselling Psychology",
            "Trauma and Resilience Group Co-Facilitation training with the Veterans Transition Network",
            "Frontline Workshop for Uniformed Sexual Trauma",
        ],
        "fees": [
            "Sliding scale available. Please inquire by email.",
            "Individual Therapy (50min): $165",
            "Individual Therapy (80min intake/extended): $247.50",
            "Couples Therapy (50min): $200",
            "Couples Therapy (80min intake/extended): $300",
            "Covered under most Extended Benefits Plans",
        ],
        "bio": bio,
        "booking_link": "https://thrivedowntown.janeapp.com/#/staff_member/36",
        "bio_link": "https://thrivedowntown.com/our-team/andrew-jarvis/",
    }

    print(embedding)
    upload_therapist(embedding, metadata)


def extract_json(website_contents):
    """Use LLM to parse to a JSON schema."""
    try:

        response = client.chat.completions.create(
            model="gpt-4o",
            temperature=0,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": """You are a helpful assistant designed to transform this text into JSON.
                    
                    JSON Format
                    Do not include additional links.  
                    Do not include website sections.
                    Make the schema flat.
                    Use the None keyword if you're uncertain.
                    
                    ** Do not deviate from this schema **
                    {
                    "name": "John Smith",
                    "gender": "male or female or None",
                    "available_online: True/False/None,
                    "location": "City, State/Province",
                    "country": "Country",
                    "clinic": "Thrive Downtown Counselling Centre",
                    "specialties": [
                        "Identity, Meaning and Purpose",
                    ],
                    "approaches": [
                        "Emotion-Focused Therapy",
                        "Existential",
                    ],
                    "languages": ["English"],
                    "qualifications": [
                        "Master of Arts in Counselling Psychology",
                    ],
                    "fees": [""],
                    "bio": long string,
                    "booking_link": Link or None,
                    }
                    """,
                },
                {"role": "user", "content": f"""Website {website_contents}"""},
            ],
        )
        # print(f"OpenAI: {response}")
    except Exception as e:
        print(f"An error occurred extracting the bio: {e}")
        raise

    return response.choices[0].message.content


def extract_profile_pic(raw_html: list, name: str):
    """Use LLM to find the link to their profile picture"""
    print(f" Raw HTML : {raw_html} {type(raw_html)} {raw_html[0]}")
    if len(raw_html) == 0:
        print("empty img links - nothing to extract")
        raise ValueError("No img links scraped")

    if len(raw_html) == 1:
        print("Only one link found, skipping OpenAI call.")
        src = raw_html[0].get("src")
        if not src:
            print(
                f"could not find the src attribute in hte img link {src} {raw_html[0]}"
            )
            raise ValueError("There was nothing found in the image link.")
        return {"profile_link": src}

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            response_format={"type": "json_object"},
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": """You are a helpful assistant designed to extract the therapist's profile page from the link, src, and title as a JSON object.

                    Image links are likely inside an HTML or link that has their name in it. 
                    Image links are unlikely inside tags with the word 'logo' .
                    Do not change the case as the image resource is case sensitive.

                    Format: webp, png, etc.

                    Schema {"profile_link": ""}
                    """,
                },
                {
                    "role": "user",
                    "content": f"""Name: {name}
                
                 Raw HTML {str(raw_html)}""",
                },
            ],
        )
        # print(f"OpenAI: {response}")
    except Exception as e:
        print(f"An error occurred extracting the bio: {e}")
        raise

    try:
        response_json = json.loads(response.choices[0].message.content)
        return response_json
    except Exception as e:
        print("Erorr extracting json")
        raise ValueError("Error extracting json")


def bs(links):
    """Grab all the text on a page."""
    # Load HTML
    loader = AsyncChromiumLoader(links)
    html = loader.load()

    # Transform
    bs_transformer = BeautifulSoupTransformer()
    docs_transformed = bs_transformer.transform_documents(
        html, tags_to_extract=["p", "li", "div", "a", "span"]
    )
    return docs_transformed


def fetch_raw_html(url, timeout=10):
    """Returns HTML from a web url."""
    session = requests.Session()
    retry = Retry(total=5, backoff_factor=0.3, status_forcelist=[500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)

    try:
        response = session.get(url, timeout=timeout)
        response.raise_for_status()  # Raises an HTTPError if the response code was unsuccessful
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to load page {url}") from e

    return response.text


def extract_img_tags(html_content):
    """Extract all 'img' tags from the ®aw HTML."""
    try:
        soup = BeautifulSoup(html_content, "html.parser")
        img_tags = soup.find_all("img")
        print(f"All Image Tags: {img_tags}")
        if not img_tags:
            raise ValueError("no image tags")
    except Exception as e:
        print(f"error extracting img tags {e}")
    return img_tags


def extract_img_info(img_tags, keyword):
    """Filter the image tags to find the profile picture"""
    img_info = []
    keyword_lower = keyword.lower()
    if " " in keyword_lower:
        first_name, last_name = keyword_lower.split()
    else:
        first_name = keyword_lower
        last_name = ""

    for img in img_tags:
        img_src = img.get("src", "").lower()
        img_data_src = img.get("data-src", "").lower()
        img_data_breeze = img.get("data-breeze", "").lower()
        img_alt = img.get("alt", "").lower()
        img_title = img.get("title", "").lower()

        if (
            first_name in img_src
            or last_name in img_src
            or first_name in img_data_src
            or last_name in img_data_src
            or first_name in img_data_breeze
            or last_name in img_data_breeze
            or first_name in img_alt
            or last_name in img_alt
            or first_name in img_title
            or last_name in img_title
            and not img_src.startswith("data:image/")
            and "logo" not in img_src
            and "logo" not in img_data_breeze
            and "logo" not in img_data_src
        ):
            img_info.append(
                {
                    "src": img.get("src"),
                    "data-src": img.get("data-src"),
                    "data-breeze": img.get("data-breeze"),
                    "alt": img.get("alt"),
                    "title": img.get("title"),
                }
            )
        # all other scenarios
        else:
            img_info.append(
                {
                    "src": img.get("src"),
                    "data-src": img.get("data-src"),
                    "data-breeze": img.get("data-breeze"),
                    "alt": img.get("alt"),
                    "title": img.get("title"),
                }
            )

    print(f"BS Image Info: {img_info} {type(img_info)}")
    return img_info


def ai_long_summary(profile, model):
    """Summarize the profile."""
    try:
        response = client.chat.completions.create(
            model=model,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": f"""Given the therapist profile, summarize it in a single paragraph.
                    
                    {str(profile)}""",
                },
                {"role": "user", "content": f"""Website """},
            ],
        )
        # print(f"OpenAI: {response}")
    except Exception as e:
        print(f"OpenAI: An error occurred summarizing the profile: {e}")
        raise

    return response.choices[0].message.content


def ai_short_summary(long_summary, model="gpt-4o") -> str:
    """Write a two sentence summary of the therapist"""
    try:
        response = client.chat.completions.create(
            model=model,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": f"""Given the therapist's profile, summarize it in two SHORT sentences. Do not include a mention of their bio link.
                    
                    Summary:
                    {str(long_summary)}
                    

                    The first sentence format: "John specializes in ..."
                    Second sentence format:                     
                    
                    Two Sentence Summary:
                    """,
                },
                {"role": "user", "content": f"""Website """},
            ],
        )
        # print(f"OpenAI: {response}")
    except Exception as e:
        print(f"OpenAI: An error occurred summarizing the profile: {e}")
        raise

    return response.choices[0].message.content


def check_therapist_exists(bio_link):
    try:
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        index = pc.Index(os.getenv("PINECONE_INDEX"))
        search_embedding = get_embedding("hello world")

        response = index.query(
            vector=search_embedding,
            filter={"bio_link": {"$eq": bio_link}},
            top_k=3,
            include_values=False,
            include_metadata=True,
        )
        print(f"therapist_similarity_search response: {response.get('matches')}")
        if len(response.get("matches")):
            return True
        else:
            return False
    except Exception as e:
        error = f"Error in similarity search: {e} {type(bio_link)} {bio_link} "
        print(error)
        raise Exception(error)


def scrape_profile(link: str):
    """Gets JSON from an HTTPS link"""
    errors = []

    website = bs([link])
    print(website)
    if not website[0].page_content:
        error = "could not scrape website"
        print(error)
        errors.append({"error": error, "link": link})

    therapist_json_string = extract_json(website[0].page_content)

    try:
        therapist_json = json.loads(therapist_json_string)
        if therapist_json["name"] == "John Smith":
            errors.append({"error": "John Smith Error", "link": link})
        therapist_json["bio_link"] = link
        print(f"JSON: {therapist_json}")
    except Exception as e:
        error_message = f"Error loading JSON for link {link}: {str(e)}"
        print(error_message)
        errors.append({"error": error_message, "link": link})

    try:
        html = fetch_raw_html(link)
        img_tags = extract_img_tags(html)
        img_info = extract_img_info(img_tags, keyword=therapist_json.get("name"))
        img_json = extract_profile_pic(img_info, therapist_json.get("name"))
        therapist_json["profile_link"] = img_json.get("profile_link")
        print(f"Img Link: {therapist_json.get('profile_link')}")
        if not therapist_json.get("profile_link").startswith("https://"):
            error_message = f"Profile link does not start with https for link {link} {therapist_json.get('profile_link')}"
            errors.append(
                {
                    "error": error_message,
                    "link": link,
                }
            )
            raise ValueError("Profile link could not be verified")
    except Exception as e:
        error_message = f"Error extracting image link for link {link}: {str(e)}"
        print(error_message)
        therapist_json["profile_link"] = "None"
        errors.append({"error": error_message, "link": link})

    try:
        summary = ai_long_summary(therapist_json_string, "gpt-4o")
        therapist_json["summary"] = summary
        print(f"AI Long Summary: {summary[0:50]}")
    except Exception as e:
        error_message = f"Error generating AI long summary for link {link}: {str(e)}"
        therapist_json["summary"] = None
        errors.append({"error": error_message, "link": link})

    try:
        short_summary = ai_short_summary(therapist_json_string, "gpt-4o")
        therapist_json["short_summary"] = short_summary
        print(f"AI Short Summary: {summary[0:50]}")
    except Exception as e:
        error_message = f"Error generating AI short summary for link {link}: {str(e)}"
        therapist_json["short_summary"] = None
        errors.append({"error": error_message, "link": link})

    try:
        embedding = get_embedding(therapist_json.get("summary"))
        response = upload_therapist(embedding, therapist_json)
        print(f"Pinecone Success: {response}")
    except Exception as e:
        error_message = f"Error uploading therapist data for link {link}: {str(e)}"
        errors.append({"error": error_message, "link": link})

    if errors:
        print(f"{len(links)} links // {len(errors)} errors:")
        for error in errors:
            print(f"Link: {error['link']} - Error: {error['error']}")
    else:
        print("No errors.")

    return {"data": therapist_json, "errors": errors}
