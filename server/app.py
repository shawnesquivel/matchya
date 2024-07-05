from chalice import Chalice, CORSConfig, Response
from chalicelib.utils import current_epoch_time
from chalicelib.mimir_chat import chat_function_call, determine_assistant_tool_messages
from chalicelib.update_table import get_all_messages_for_chat
from chalicelib.update_table import store_message, get_all_messages_for_chat

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
