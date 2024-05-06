import requests
from pathlib import Path


# Create your account and get your API key here: https://elevenlabs.io/
ELEVENLABS_API_KEY = ""

def get_elevenlabs_audio(message: str) -> bytes:
    """
    Convert a message into an audio file using the Labs API.

    Parameters
    ----------
    message (str): The message to be converted to audio format.

    Returns
    -------
    The byte stream to the audio.

    Pre-Requisite:
    ---------------
    (1) ElevenLabs API Key is added to the `.env`

    Tutorial Reference:
    https://elevenlabs.io/docs/api-reference/text-to-speech
    """
    # Limit usage for testing
    CHARACTER_LIMIT = 5000

    if len(message) > CHARACTER_LIMIT:
        print(
            f"🎤 Text received surpasses free limit, shortening to {CHARACTER_LIMIT} char."
        )

    print("🎤 Generating audio! Waiting for Eleven Labs...")
    # Headers to send with the request
    # Includes the expected response type (audio/mpeg for MP3) and the content type of the request
    # Your API key is also included here for authentication
    payload = {
        "text": message,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            # Stability: This slider controls the consistency and randomness between each voice generation. Lowering the stability introduces a broader emotional range, potentially making the voice sound more emotive. However, setting it too low can lead to unpredictable performances or overly rapid speech, whereas setting it too high can result in a monotonous and emotionless output.
            "stability": 0,
            # Similarity Boost: This setting dictates how closely the AI attempts to replicate the original voice. A higher similarity boost means the AI will try harder to mimic the original voice's nuances, including its tone and characteristics. However, setting the similarity slider too high might result in replication of artifacts or undesired elements from the original recording if it's of poor quality.
            "similarity_boost": 0,
        },
    }

    headers = {
        "accept": "audio/mpeg",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
    }
    # You might get a 401 error if you run out of characters (10,000 for free)

    # The URL endpoint for the Text-to-Speech request
    # Change the voice ID here: https://api.elevenlabs.io/v1/voices
    voice_id = "21m00Tcm4TlvDq8ikWAM"
    try:
        response = requests.post(
            # Change the voice ID here: https://api.elevenlabs.io/v1/voices
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?optimize_streaming_latency=0",
            json=payload,
            headers=headers,
        )
        print(f"ElevenLabs Response: {response}")

        # Check if the request was successful
        if response.ok:
            # Open the output file in write-binary mode

            speech_file_path = Path(__file__).parent / "audio_eleven.mp3"

            with open(speech_file_path, "wb") as f:
                # Read the response in chunks and write to the file
                for chunk in response.iter_content(chunk_size=1024):
                    f.write(chunk)
            # Inform the user of success
            print("Audio stream saved successfully.")
        else:
            # Print the error message if the request was not successful
            print(response.text)

        if response.status_code == 200 and response.content:
            return response.content
        else:
            print(f"Error? {response.status_code}: {response.content}")
            return None
    except requests.RequestException as e:
        print(f"Error Block 1: {e}")
        print(f"Error during request: {e}")
        return None

    except Exception as e:
        print(f"Error: {e}")
        print(f"Unexpected error: {e}")
        return None


# response = get_elevenlabs_audio(
#     "Your time is limited, so don’t waste it living someone else’s life."
# )

response = get_elevenlabs_audio(
    "No, I don't ever give up. I'd have to be dead or completely incapacitated"
)
