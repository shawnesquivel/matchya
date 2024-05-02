from pathlib import Path
from openai import OpenAI

client = OpenAI(api_key="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")

speech_file_path = Path(__file__).parent / "audio_openai.mp3"
#  Deprecation warning
# response = client.audio.speech.create(
#     model="tts-1",
#     voice="nova",
#     input="Today is a wonderful day to build something people love!",
# )

# response.stream_to_file(speech_file_path)


# With streaming response
with client.audio.speech.with_streaming_response.create(
    model="tts-1",
    voice="nova",
    input="No, I don't ever give up. I'd have to be dead or completely incapacitated",
) as response:
    response.stream_to_file(speech_file_path)
