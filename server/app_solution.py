from chalice import Chalice, CORSConfig, Response
from chalice import BadRequestError
import logging
from chalicelib.chat_openai import (
    send_message_to_openai,
    send_message_to_openai_with_history,
)
from chalicelib.utils import current_epoch_time
from chalicelib.update_table import store_message, get_all_messages_for_chat
from chalicelib.audio import (
    text_to_audio,
    generate_mp3_file_name,
    upload_audio_bytes_to_s3,
    get_playable_audio_link,
)

"""
This is the solutions file, please refer to it when you are stuck.
"""


app = Chalice(app_name="kitsune-backend")

cors_config = CORSConfig(
    # allow_origin="http://localhost:3000",
    # wildcard: testing only
    allow_origin="*",
    allow_headers=["X-Special-Header"],
    max_age=600,
    allow_credentials=True,
)


@app.route("/")
def index():
    """
    Verify the server status by going to http://127.0.0.1:8000/

    Documentation: https://aws.github.io/chalice/quickstart.html
    """
    return {"Welcome": "to the future!"}


@app.route("/hello/{name}")
def hello_name(name):
    """
    Receives the value after the /hello/{VALUE} does something to it.

    Examples
    --------
    http://127.0.0.1:8000/hello/elon

    http://127.0.0.1:8000/hello/sam
    """
    # '/hello/james' -> {"hello": "james"}

    return {"message": f"Welcome to the course, {name.upper()}!"}


# @app.route("/chat", methods=["POST"], cors=cors_config)
# def kitsune_chatbot_1():
#     """Kitsune 1: Chatbot"""
#     try:
#         user_message = app.current_request.json_body["message"]
#         # Add more settings from the frontend
#         user_temperature = app.current_request.json_body["temperature"]
#         user_model = app.current_request.json_body["model"]
#         user_prompt_template = app.current_request.json_body["prompt_template"]

#         bot_response = send_message_to_openai(
#             user_message, user_prompt_template, user_model, user_temperature
#         )

#         # We will continue adding keys here later, for now it will simply be the bot_response
#         response_object = {
#             "content": bot_response,
#             "timestamp": current_epoch_time(),
#             "chat_id": app.current_request.json_body["chat_id"],
#         }

#         print(f"Returning object: {response_object}")
#         return Response(
#             body=response_object,
#             status_code=200,
#         )

#     except Exception as e:
#         logging.error(f"An error occurred: {str(e)}")
#         return Response(body={"error": str(e)}, status_code=500)


# @app.route("/chat", methods=["POST"], cors=cors_config)
# def kitsune_chatbot_2():
#     """Kitsune 2: Messages"""
#     try:
#         user_message = app.current_request.json_body["message"]
#         """
#         TUTORIAL: Store the user message in the backend.
#         1. Get chat ID
#         2. Store message as user
#         """
#         user_chat_id = app.current_request.json_body["chat_id"]
#         user_timestamp = current_epoch_time()
#         store_message(
#             chat_id=user_chat_id,
#             timestamp=user_timestamp,
#             content=user_message,
#             role="user",
#         )
#         """
#         TUTORIAL: Fetch old messages
#         """

#         # Add more settings from the frontend
#         user_temperature = app.current_request.json_body["temperature"]
#         user_model = app.current_request.json_body["model"]
#         user_prompt_template = app.current_request.json_body["prompt_template"]

#         bot_response = send_message_to_openai_with_history(
#             user_message, user_prompt_template, user_model, user_temperature
#         )
#         """
#         TUTORIAL: Store the bot resposne in the backend.
#         """
#         bot_timestamp = current_epoch_time()

#         bot_response_obj, bot_storage_response = store_message(
#             chat_id=user_chat_id,
#             timestamp=bot_timestamp,
#             content=bot_response,
#             role="assistant",
#         )
#         print(f"bot storage response {bot_storage_response}")

#         # We will continue adding keys here later, for now it will simply be the bot_response

#         print(f"Returning object: {bot_response_obj}")
#         return Response(
#             body=bot_response_obj,
#             status_code=200,
#         )

#     except Exception as e:
#         logging.error(f"An error occurred: {str(e)}")
#         return Response(body={"error": str(e)}, status_code=500)


@app.route("/chat", methods=["POST"], cors=cors_config)
def kitsune_chatbot_3():
    """Kitsune 3: Add Audio Files"""
    try:
        user_message = app.current_request.json_body["message"]
        user_chat_id = app.current_request.json_body["chat_id"]
        user_timestamp = current_epoch_time()
        store_message(
            chat_id=user_chat_id,
            timestamp=user_timestamp,
            content=user_message,
            role="user",
        )

        # Add more settings from the frontend
        user_temperature = app.current_request.json_body["temperature"]
        user_model = app.current_request.json_body["model"]
        user_prompt_template = app.current_request.json_body["prompt_template"]

        bot_response = send_message_to_openai_with_history(
            user_message,
            user_prompt_template,
            user_model,
            user_temperature,
            user_chat_id,
        )

        """
        TUTORIAL: Get audio from ElevenLabs
        """
        audio = text_to_audio(bot_response)

        """
        TUTORIAL: Upload audio to S3 bucket
        """

        s3_file_name = generate_mp3_file_name()
        bot_timestamp = current_epoch_time()

        upload_audio_bytes_to_s3(
            audio, "hippo-ai-audio", user_chat_id, bot_timestamp, s3_file_name
        )

        """
        TUTORIAL: Get playable link from S3.
        """

        bot_audio_url = get_playable_audio_link(s3_file_name, "hippo-ai-audio")

        """
        
        TUTORIAL: Store the message with the audio link.
        """

        bot_response_obj, bot_storage_response = store_message(
            chat_id=user_chat_id,
            timestamp=bot_timestamp,
            content=bot_response,
            role="assistant",
            audio_file_url=bot_audio_url,
        )

        # We will continue adding keys here later, for now it will simply be the bot_response

        return Response(
            body=bot_response_obj,
            status_code=200,
        )

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return Response(body={"error": str(e)}, status_code=500)


@app.route("/chat/messages/{chat_id}", methods=["GET"], cors=cors_config)
def get_chat_messages(chat_id):
    """Phase 3: Fetch old messages"""
    print(f" received messages request: {chat_id}")
    messages = get_all_messages_for_chat(chat_id)
    print(f"retrieved chat messages: {messages}")
    return {"data": messages}


# @app.route("/chat", methods=["POST", "GET"], cors=cors_config)
# def tutorial_chat_endpoint():
#     """
#     Test endpoint for NextJS tutorial.

#     To Test:
#     curl -X POST http://127.0.0.1:8000/chat \
#         -H "Content-Type: application/json" \
#         -d '{
#                 "message": "What is a Large Language Model?"
#     }'
#     """
#     try:
#         user_message = app.current_request.json_body["message"]
#         user_api_key = app.current_request.json_body["apiKey"]

#         if not user_api_key:
#             user_api_key = "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"
#         print(f"received user message: {user_message}")
#         messages = text_generation_with_function_call(
#             user_message, api_key=user_api_key
#         )
#         # Assume messages is a list and we need the last message which is a dictionary containing 'choices'
#         last_message = messages[-1]
#         print(f"LAST MESSAGE: {last_message}")
#         if hasattr(last_message, "choices") and last_message.choices:
#             print("choices Present")
#             result_content = last_message.choices[-1].message.content
#         else:
#             print("choices not present")
#             result_content = last_message.content
#             print(result_content)
#         return Response(body={"data": {"response": result_content}}, status_code=200)
#     except Exception as e:
#         logging.error(f"An error occurred: {str(e)}")
#         return Response(body={"error": str(e)}, status_code=500)


# @app.route("/agents", methods=["POST", "GET"], cors=cors_config)
# def agents_endpoint():
#     """
#     Test endpoint for NextJS tutorial.

#     To Test:
#     curl -X POST http://127.0.0.1:8000/chat \
#         -H "Content-Type: application/json" \
#         -d '{
#                 "message": "What is a Large Language Model?"
#     }'
#     """
#     try:
#         # TODO Use the request body from user
#         # user_message = app.current_request.json_body["message"]
#         user_message = "Make a tweet about AI agents"

#         user_api_key = app.current_request.json_body["apiKey"]

#         if not user_api_key:
#             user_api_key = "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"
#         result_content = {" "}
#         return Response(body={"data": {"response": result_content}}, status_code=200)
#     except Exception as e:
#         logging.error(f"An error occurred: {str(e)}")
#         return Response(body={"error": str(e)}, status_code=500)
