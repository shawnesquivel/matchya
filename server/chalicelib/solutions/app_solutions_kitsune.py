from chalice import Chalice, CORSConfig, Response
from chalicelib.chat_openai import send_message_to_openai_with_history
from chalicelib.update_table import store_message, get_all_messages_for_chat
from chalicelib.utils import current_epoch_time
from chalicelib.audio import text_to_audio, upload_audio_bytes_to_s3, generate_mp3_file_name, get_playable_audio_link

app = Chalice(app_name="kitsune-backend")

cors_config = CORSConfig(
    # allow_origin="http://localhost:3000",
    # wildcard: testing only
    allow_origin="*",
    allow_headers=['Content-Type', 'X-Special-Header', 'Authorization'], 
    max_age=600,
    allow_credentials=True,
)


@app.route("/", cors=cors_config)
def index():
    """
    Verify the server status by going to http://127.0.0.1:8000/

    Documentation: https://aws.github.io/chalice/quickstart.html
    """
    return {"Welcome": "to the AI future!!"}


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


"""
Write more endpoints here...

- add functions in chalicelib file 
- grab the user's request from app.current_request.json_body
- return Response(body={},status_code=200)

Test with `chalice local`
Deploy with `chalice deploy`

"""
# @app.route("/chat", methods=["POST"], cors=cors_config)
# def kitsune_chatbot_1():
#     try:
#         user_message = app.current_request.json_body["message"]
#         user_temperature = app.current_request.json_body["temperature"]
#         user_model = app.current_request.json_body["model"]
#         user_prompt_template = app.current_request.json_body["prompt_template"]

#         bot_response = send_message_to_openai(user_message, user_prompt_template, user_model, user_temperature)
#         response_object = {
#             "content": str(bot_response)
#         }
#         return Response(body=response_object, status_code=200)
#     except Exception as e:
#         return Response(body={"error": str(e)}, status_code=500)
    

# @app.route("/chat", methods=["POST"], cors=cors_config)
# def kitsune_chatbot_2():
#     try:
#         user_message = app.current_request.json_body["message"]
#         user_temperature = app.current_request.json_body["temperature"]
#         user_model = app.current_request.json_body["model"]
#         user_prompt_template = app.current_request.json_body["prompt_template"]
#         user_chat_id = app.current_request.json_body["chat_id"]
#         user_timestamp = current_epoch_time()

#         store_message(user_chat_id,user_message,"user", user_timestamp, None)

#         bot_response = send_message_to_openai_with_history(user_message, user_prompt_template, user_model, user_temperature, user_chat_id)

#         bot_timestamp = current_epoch_time()
    
#         response_object, _ = store_message(user_chat_id,bot_response,"assistant", bot_timestamp, None)

#         return Response(body=response_object, status_code=200)
#     except Exception as e:
#         return Response(body={"error": str(e)}, status_code=500)


@app.route("/chat", methods=["POST"], cors=cors_config)
def kitsune_chatbot_3():
    try:
        user_message = app.current_request.json_body["message"]
        user_temperature = app.current_request.json_body["temperature"]
        user_model = app.current_request.json_body["model"]
        user_prompt_template = app.current_request.json_body["prompt_template"]
        user_chat_id = app.current_request.json_body["chat_id"]
        user_timestamp = current_epoch_time()

        store_message(user_chat_id,user_message,"user", user_timestamp, None)

        bot_response = send_message_to_openai_with_history(user_message, user_prompt_template, user_model, user_temperature, user_chat_id)

        audio = text_to_audio(bot_response)


        bot_timestamp = current_epoch_time()
        s3_file_name = generate_mp3_file_name()

        upload_audio_bytes_to_s3(audio, "ai41-audio-files", user_chat_id, bot_timestamp, s3_file_name)


        bot_audio_url = get_playable_audio_link(s3_file_name, "ai41-audio-files")
    
        response_object, _ = store_message(user_chat_id,bot_response,"assistant", bot_timestamp, bot_audio_url)

        return Response(body=response_object, status_code=200)
    except Exception as e:
        return Response(body={"error": str(e)}, status_code=500)
    

@app.route("/chat/messages/{chat_id}", methods=["GET"], cors=cors_config)
def get_chat_messages(chat_id):
    print(f"chat id: {chat_id}")
    messages = get_all_messages_for_chat(chat_id)
    print(f"here are the messages {messages}")
    return {"data": messages}