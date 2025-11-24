import sys
import speech_recognition as sr
from pydub import AudioSegment
import os
import json
import requests
import urllib.parse

# Initialize recognizer class in SpeechRecognition
recognizer = sr.Recognizer()

# Convert audio to text
def convert_audio_to_text(audio_file):
    # Convert audio file to a format that can be processed by the recognizer
    audio = AudioSegment.from_file(audio_file)
    # audio = audio.set_channels(1).set_frame_rate(16000)  # Mono channel and 16kHz sample rate
    temp_audio_path = "temp.wav"

    # Export the audio as a WAV file
    audio.export(temp_audio_path, format="wav")

    # Load the audio file with SpeechRecognition
    with sr.AudioFile(temp_audio_path) as source:
        audio_data = recognizer.record(source)

    # Recognize the speech using Google's speech recognition API
    try:
        text = recognizer.recognize_google(audio_data)
        translated_code = translate_text(text, "auto", "auto")
        text = recognizer.recognize_google(audio_data, language=translated_code)
        return f"{translated_code}-{text}"
    except sr.UnknownValueError:
        print("Sorry, I could not understand the audio.")
        return None
    except sr.RequestError as e:
        print(f"Could not request results from Google Speech Recognition service; {e}")
        return None
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)

# Function to translate text using Google's Unofficial API
def translate_text(text, source_lang="auto", target_lang="auto"):
    encoded_text = urllib.parse.quote(text)  # URL encode the text
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={source_lang}&tl={target_lang}&dt=t&q={encoded_text}"
    
    response = requests.get(url)
    if response.status_code == 200:
        try:
            return response.json()[2]
        except Exception as e:
            print("Error parsing translation response:", e)
            return None
    else:
        print("Translation API request failed.")
        return None

if __name__ == "__main__":
    # File path and language code
    audio_file = sys.argv[1]

    # Get the transcription result
    text = convert_audio_to_text(audio_file)
    # Decode the text if necessary (i.e., if it contains Unicode escape sequences)
    if text:
        result = {
            "text": text.split('-')[1],
            "language_code": text.split('-')[0]
        }
        print(json.dumps(result, ensure_ascii=False))
    else:
        print(json.dumps({
            "text": "",
            "language_code": None
        }, ensure_ascii=False))