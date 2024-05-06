import os
import requests
from dotenv import find_dotenv, load_dotenv
import boto3
from botocore.exceptions import NoCredentialsError
import io
import uuid


load_dotenv(find_dotenv())

"""
Helper funtions for ElevenLabs (audio) and Amazon S3 (file storage)
"""


# Helper function
def generate_mp3_file_name():
    """
    Generate a random hash for S3 audio files.

    Example: "fs89feq1.mp3"

    Returns
    -------
    A string representing a unique UUID.
    """
    return str(uuid.uuid4()) + ".mp3"


def text_to_audio(message: str) -> bytes:
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
        "xi-api-key": os.getenv("ELEVEN_LABS_API_KEY"),
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


def upload_audio_bytes_to_s3(audio_content, bucket, chat_id, timestamp, s3_obj_name):
    """
    Uploads audio to S3.

    Returns the file name of the audio file.
    """
    # Validation (don't write this)
    if not isinstance(audio_content, bytes):
        print(f"Error: audio_content is not bytes, but {type(audio_content)}")
        return False
    if not bucket:
        print(f"Error: no bucket provided. Bucket: {bucket}")
        return False

    # Upload to S3
    try:
        s3_client = boto3.client("s3")
        audio_file = io.BytesIO(audio_content)
        print(f"Converted to io.BytesIO: {type(audio_file)}")
        extra_args = {
            "ContentType": "audio/mpeg",
            "Metadata": {
                "chat_id": chat_id,
                "timestamp": str(timestamp),
            },
        }
        s3_client.upload_fileobj(audio_file, bucket, s3_obj_name, ExtraArgs=extra_args)
        print(f"✅ Audio upload to {bucket} (bucket) as '{s3_obj_name}'")
        return True
    except Exception as e:
        print(f"An error occurred: {e}")
        return False


def get_playable_audio_link(file_name, bucket_name, expiration=604800):
    """
    Generate a pre-signed URL to access a private S3 object.

    Parameters:
    - file_name: The key/name of the file in the S3 bucket.
    - bucket_name: The name of the S3 bucket.
    - expiration: Time in seconds for the pre-signed URL to remain valid. Default: 7 days (604800 sec)

    Returns:
    - The pre-signed URL string or None if an error occurs.
    """
    # Create a boto3 S3 client
    s3_client = boto3.client("s3")
    try:
        response = s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket_name, "Key": file_name},
            ExpiresIn=expiration,
        )
    except NoCredentialsError:
        print("Credentials not available for AWS S3")
        return None
    except Exception as e:
        print(f"An error occurred generating the pre-signed URL: {e}")
        return None
    print(f"Got the presigned S3 URL, expires in {expiration} sec: {response}")
    return response


if __name__ == "__main__":
    link = get_playable_audio_link("9dc9376a-9e7d-4005-bf98-f442434c1b98.mp3", "ai41-audio-files")
    print(link)