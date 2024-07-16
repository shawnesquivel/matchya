from chalice import Chalice, CORSConfig, Response
from chalicelib.utils import current_epoch_time
from chalicelib.mimir_chat import chat_function_call, determine_assistant_tool_messages
from chalicelib.update_table import get_all_messages_for_chat
from chalicelib.update_table import store_message, get_all_messages_for_chat
import ast
from chalicelib.web_scraper import (
    delete_records,
    find_therapist,
    get_embedding,
    scrape_profile,
    upload_therapist,
)

app = Chalice(app_name="kitsune-backend")

cors_config = CORSConfig(
    # allow_origin="http://localhost:3000",
    # wildcard: testing only
    allow_origin="*",
    allow_headers=["Content-Type", "X-Special-Header", "Authorization"],
    max_age=600,
    allow_credentials=True,
)


@app.route("/", cors=cors_config)
def index():
    """
    Verify the server status by going to http://127.0.0.1:8000/

    Documentation: https://aws.github.io/chalice/quickstart.html
    """
    return {"Welcome": "to the future!"}


@app.route("/chat/messages/{chat_id}", methods=["GET"], cors=cors_config)
def get_chat_messages(chat_id):
    print(f"chat id: {chat_id}")
    messages = get_all_messages_for_chat(chat_id)
    print(f"here are the messages {messages}")
    return {"data": messages}


@app.route("/profile/scrape", methods=["GET"], cors=cors_config)
def scrape_therapist_bio_route():
    print("called profile start")
    bio_link = app.current_request.query_params.get("bio_link", None)

    try:
        if not bio_link.startswith("https://"):
            raise ValueError("Should be an https:// URL to web scrape")

        result = scrape_profile(bio_link)
    except Exception as e:
        print(f"error scraping {e}")
        return {
            "data": None,
            "error": f"Error scraping the bio {e}",
            "status_code": 500,
        }

    return {
        "data": result.get("data"),
        "error": result.get("errors"),
        "status_code": 200,
    }


@app.route("/profile/update", methods=["POST"], cors=cors_config)
def save_therapist_profile():
    therapist_json = app.current_request.json_body
    print(f"received json: {therapist_json.get('location')}")

    try:
        matches = find_therapist(bio_link=therapist_json.get("bio_link"))
        duplicate_records = [match.get("id") for match in matches]
        delete_records(ids=duplicate_records)
        if not therapist_json.get("summary"):
            print("error no summary found")
            raise ValueError("No summary found")
        embedding = get_embedding(therapist_json.get("summary"))
        therapist_pinecone_id = upload_therapist(embedding, therapist_json)
    except Exception as e:
        error_message = {
            "error": f"Error uploading therapist data for {str(therapist_json)} {str(e)}"
        }
        return Response(
            body=error_message,
            status_code=500,
        )

    return Response(
        body={"deleted_records": duplicate_records, "id": therapist_pinecone_id},
        status_code=200,
    )


@app.route("/chat", methods=["POST"], cors=cors_config)
def matchya():
    try:
        user_message = app.current_request.json_body["message"]
        user_chat_id = app.current_request.json_body["chat_id"]
        user_timestamp = current_epoch_time()
        store_message(
            chat_id=user_chat_id,
            content=user_message,
            role="user",
            timestamp=user_timestamp,
        )

        previous_messages = get_all_messages_for_chat(
            user_chat_id,
        )

        messages = chat_function_call(
            user_msg=user_message, model="gpt-4o", old_messages=previous_messages
        )

        print(f"second last message: {messages[-2]}")
        print(f"last message: {messages[-1]}")

        bot_message, tool_message = determine_assistant_tool_messages(messages)
        bot_timestamp = current_epoch_time()

        print(f"bot message: {bot_message}")
        print(f"tool message: {tool_message}")

        store_message(
            chat_id=user_chat_id,
            content=bot_message,
            role="assistant",
            timestamp=bot_timestamp,
        )

        try:
            if tool_message:
                tool_json = ast.literal_eval(tool_message)
            else:
                tool_json = None
        except (ValueError, SyntaxError) as e:
            print(f"JSON  error: {tool_message}")
            print(f"JSON  error: {e}!")
            print(
                f"Problematic string: {tool_message[:100]}..."
            )  # Print first 100 chars
            raise ValueError(str(e))
        #
        response_object = {
            "chat_id": str(user_chat_id),
            "timestamp": current_epoch_time(),
            "content": bot_message,  # message from openai
            "role": "assistant",  # differentiate messages
            "source_documents": tool_json,  # function call results
            "audio_file_url": None,
        }
        return Response(
            body=response_object,
            status_code=200,
            headers={"Access-Control-Allow-Origin": "*"},
        )
    except Exception as e:
        print(f"there was an error {e}")
        return Response(body={"error": str(e)}, status_code=500)
