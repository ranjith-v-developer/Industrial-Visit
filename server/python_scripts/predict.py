import sys
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# Training data (same as you provided)
training_data = [

    {"text": "Provide industrial visits near chennai.", "key": "location-chennai", "lang": "english", "response": "chennai location Industrial Visits Here."},
    {"text": "show me the industrial visits near chennai", "key": "location-chennai", "lang": "english", "response": "chennai location industrial visits is now displayed."},
    {"text": "சென்னை அருகே தொழில்துறை வருகைகளை வழங்கவும்.", "key": "location-chennai", "lang": "tamil", "response": "சென்னை இடம் தொழில்துறை வருகைகள் இங்கே."},
    {"text": "चेन्नई", "key": "location-chennai", "lang": "hindi", "response": "यहां अवदी स्थान औद्योगिक भ्रमण करता है।"},

    {"text": "Provide industrial visits near Avadi.", "key": "location-avadi", "lang": "english", "response": "Avadi location Industrial Visits Here."},
    {"text": "show me the industrial visits near avadi", "key": "location-avadi", "lang": "english", "response": "Avadi location industrial visits is now displayed."},
    {"text": "ஆவடி அருகே தொழில்துறை வருகைகளை வழங்கவும்.", "key": "location-avadi", "lang": "tamil", "response": "ஆவடி இடம் தொழில்துறை வருகைகள் இங்கே."},
    {"text": "ஆவடிக்கு அருகிலுள்ள தொழில்துறை வருகைகளைக் காட்டு", "key": "location-avadi", "lang": "tamil", "response": "ஆவடி இருப்பிட தொழில்துறை வருகைகள் இப்போது காட்டப்படுகின்றன."},
    {"text": "अवाडी", "key": "location-avadi", "lang": "hindi", "response": "यहां अवदी स्थान औद्योगिक भ्रमण करता है।"},
    {"text": "आवडी", "key": "location-avadi", "lang": "hindi", "response": "यहां अवदी स्थान औद्योगिक भ्रमण करता है।"},
    {"text": "अवदी के पास औद्योगिक दौरे प्रदान करें।", "key": "location-avadi", "lang": "hindi", "response": "यहां अवदी स्थान औद्योगिक भ्रमण करता है।"},
    {"text": "मुझे अवडी के निकट औद्योगिक दौरे दिखाओ", "key": "location-avadi", "lang": "hindi", "response": "अवदी स्थान औद्योगिक दौरा अब प्रदर्शित किया गया है।"},

    {"text": "Provide industrial visits near ambattur.", "key": "location-ambattur", "lang": "english", "response": "Here is the ambattur location industrial visits."},
    {"text": "show me the industrial visits near ambattur", "key": "location-ambattur", "lang": "english", "response": "Ambattur location industrial visits is now displayed."},
    {"text": "அம்பத்தூர் அருகே தொழில்துறை வருகைகளை வழங்கவும்.", "key": "location-ambattur", "lang": "tamil", "response": "அம்பத்தூர் இடம் தொழில்துறை வருகைகள் இங்கே."},
    {"text": "அம்பத்தூர் அருகிலுள்ள தொழில்துறை வருகைகளைக் காட்டு", "key": "location-ambattur", "lang": "tamil", "response": "அம்பத்தூர் இருப்பிட தொழில்துறை வருகைகள் இப்போது காட்டப்படுகின்றன."},
    {"text": "अंबात्तुर", "key": "location-ambattur", "lang": "hindi", "response": "यहां अम्बत्तूर स्थान पर औद्योगिक यात्राएं होती हैं।"},
    {"text": "अम्बत्तूर के निकट औद्योगिक दौरे प्रदान करें।", "key": "location-ambattur", "lang": "hindi", "response": "यहां अम्बत्तूर स्थान पर औद्योगिक यात्राएं होती हैं।"},
    {"text": "मुझे अम्बत्तूर के निकट औद्योगिक दौरे दिखाओ", "key": "location-ambattur", "lang": "hindi", "response": "अम्बत्तूर स्थान औद्योगिक दौरा अब प्रदर्शित किया गया है।"},

    {"text": "Provide industrial visits near gunidy.", "key": "location-gunidy", "lang": "english", "response": "Here is the gunidy location industrial visits."},
    {"text": "show me the industrial visits near gunidy", "key": "location-gunidy", "lang": "english", "response": "gunidy location industrial visits is now displayed."},
    {"text": "கிண்டி அருகே தொழில்துறை வருகைகளை வழங்கவும்.", "key": "location-gunidy", "lang": "tamil", "response": "கிண்டி இடம் தொழில்துறை வருகைகள் இங்கே."},
    {"text": "கிண்டி அருகிலுள்ள தொழில்துறை வருகைகளைக் காட்டு", "key": "location-gunidy", "lang": "tamil", "response": "கிண்டி இருப்பிட தொழில்துறை வருகைகள் இப்போது காட்டப்படுகின்றன."},
    {"text": "गिंडी", "key": "gunidy", "lang": "location-hindi", "response": "यहां गनीडी लोकेशन पर औद्योगिक दौरे होते हैं।"},
    {"text": "गुनिडी के पास औद्योगिक दौरे प्रदान करें।", "key": "location-gunidy", "lang": "hindi", "response": "यहां गनीडी लोकेशन पर औद्योगिक दौरे होते हैं।"},
    {"text": "मुझे गनीडी के निकट औद्योगिक दौरे दिखाओ", "key": "location-gunidy", "lang": "hindi", "response": "गंदा स्थान औद्योगिक दौरा अब प्रदर्शित किया गया है।"},

    {"text": "computer science and engineering", "key": "dept-bachelor_computer_science_engineering", "lang": "english", "response": "computer science and engineering Industrial Visits Here."},
    {"text": "cse", "key": "dept-bachelor_computer_science_engineering", "lang": "english", "response": "computer science and engineering Industrial Visits Here."},
    {"text": "BE.CSE", "key": "dept-bachelor_computer_science_engineering", "lang": "english", "response": "computer science and engineering Industrial Visits Here."},
    {"text": "BE CSE", "key": "dept-bachelor_computer_science_engineering", "lang": "english", "response": "computer science and engineering Industrial Visits Here."},
    {"text": "BE.computer science and engineering", "key": "dept-bachelor_computer_science_engineering", "lang": "english", "response": "computer science and engineering Industrial Visits Here."},
    {"text": "BE computer science", "key": "dept-bachelor_computer_science_engineering", "lang": "english", "response": "computer science and engineering Industrial Visits Here."},
    {"text": "BE computer science and engineering", "key": "dept-bachelor_computer_science_engineering", "lang": "english", "response": "computer science and engineering Industrial Visits Here."},
    {"text": "computer science", "key": "dept-bachelor_computer_science_engineering", "lang": "english", "response": "computer science and engineering Industrial Visits Here."},
    {"text": "கணினி அறிவியல் மற்றும் பொறியியல்", "key": "dept-bachelor_computer_science_engineering", "lang": "tamil", "response": "கணினி அறிவியல் மற்றும் பொறியியல் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "cse", "key": "dept-bachelor_computer_science_engineering", "lang": "tamil", "response": "கணினி அறிவியல் மற்றும் பொறியியல் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "BE.CSE", "key": "dept-bachelor_computer_science_engineering", "lang": "tamil", "response": "கணினி அறிவியல் மற்றும் பொறியியல் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "BE.கணினி அறிவியல் மற்றும் பொறியியல்", "key": "dept-bachelor_computer_science_engineering", "lang": "tamil", "response": "கணினி அறிவியல் மற்றும் பொறியியல் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "கணினி அறிவியல்", "key": "dept-bachelor_computer_science_engineering", "lang": "tamil", "response": "கணினி அறிவியல் மற்றும் பொறியியல் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "कंप्यूटर विज्ञान और इंजीनियरिंग", "key": "dept-bachelor_computer_science_engineering", "lang": "hindi", "response": "कंप्यूटर विज्ञान और इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "cse", "key": "dept-bachelor_computer_science_engineering", "lang": "hindi", "response": "कंप्यूटर विज्ञान और इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "BE.CSE", "key": "dept-bachelor_computer_science_engineering", "lang": "hindi", "response": "कंप्यूटर विज्ञान और इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "BE.कंप्यूटर विज्ञान और इंजीनियरिंग", "key": "dept-bachelor_computer_science_engineering", "lang": "hindi", "response": "कंप्यूटर विज्ञान और इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "कंप्यूटर विज्ञान", "key": "dept-bachelor_computer_science_engineering", "lang": "hindi", "response": "कंप्यूटर विज्ञान और इंजीनियरिंग औद्योगिक दौरे यहाँ।"},

    {"text": "BE.IT", "key": "dept-bachelor_information_technology", "lang": "english", "response": "information technology and computer science and engineering Industrial Visits Here."},
    {"text": "BE IT", "key": "dept-bachelor_information_technology", "lang": "english", "response": "information technology and computer science and engineering Industrial Visits Here."},
    {"text": "BE.information technology", "key": "dept-bachelor_information_technology", "lang": "english", "response": "information technology and computer science and engineering Industrial Visits Here."},
    {"text": "BE information technology", "key": "dept-bachelor_information_technology", "lang": "english", "response": "information technology and computer science and engineering Industrial Visits Here."},
    {"text": "BE.IT", "key": "dept-bachelor_information_technology", "lang": "tamil", "response": "தகவல் தொழில்நுட்பம் மற்றும் கணினி அறிவியல் மற்றும் பொறியியல் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "BE.தகவல் தொழில்நுட்பம்", "key": "dept-bachelor_information_technology", "lang": "tamil", "response": "தகவல் தொழில்நுட்பம் மற்றும் கணினி அறிவியல் மற்றும் பொறியியல் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "BE.IT", "key": "dept-bachelor_information_technology", "lang": "hindi", "response": "सूचना प्रौद्योगिकी और कंप्यूटर विज्ञान और इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "BE.सूचना प्रौद्योगिकी", "key": "dept-bachelor_information_technology", "lang": "hindi", "response": "सूचना प्रौद्योगिकी और कंप्यूटर विज्ञान और इंजीनियरिंग औद्योगिक दौरे यहाँ।"},

    {"text": "mechanical engineering", "key": "dept-bachelor_mechanical_engineering", "lang": "english", "response": "mechanical engineering Industrial Visits Here."},
    {"text": "mech", "key": "dept-bachelor_mechanical_engineering", "lang": "english", "response": "mechanical engineering Industrial Visits Here."},
    {"text": "BE.Mechanical", "key": "dept-bachelor_mechanical_engineering", "lang": "english", "response": "mechanical engineering Industrial Visits Here."},
    {"text": "BE Mechanical", "key": "dept-bachelor_mechanical_engineering", "lang": "english", "response": "mechanical engineering Industrial Visits Here."},
    {"text": "BE.mechanical engineering", "key": "dept-bachelor_mechanical_engineering", "lang": "english", "response": "mechanical engineering Industrial Visits Here."},
    {"text": "BE mechanical engineering", "key": "dept-bachelor_mechanical_engineering", "lang": "english", "response": "mechanical engineering Industrial Visits Here."},
    {"text": "இயந்திர பொறியியல்", "key": "dept-bachelor_mechanical_engineering", "lang": "tamil", "response": "மேக்கானிகல் இன்ஜினியரிங் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "மேக்", "key": "dept-bachelor_mechanical_engineering", "lang": "tamil", "response": "மேக்கானிகல் இன்ஜினியரிங் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "BE.இயந்திர", "key": "dept-bachelor_mechanical_engineering", "lang": "tamil", "response": "மேக்கானிகல் இன்ஜினியரிங் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "BE.இயந்திர பொறியியல்", "key": "dept-bachelor_mechanical_engineering", "lang": "tamil", "response": "மேக்கானிகல் இன்ஜினியரிங் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "मैकेनिकल इंजीनियरिंग", "key": "dept-bachelor_mechanical_engineering", "lang": "hindi", "response": "मैकेनिकल इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "मैच", "key": "dept-bachelor_mechanical_engineering", "lang": "hindi", "response": "मैकेनिकल इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "BE.मैकेनिकल", "key": "dept-bachelor_mechanical_engineering", "lang": "hindi", "response": "मैकेनिकल इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "BE.मैकेनिकल इंजीनियरिंग", "key": "dept-bachelor_mechanical_engineering", "lang": "hindi", "response": "मैकेनिकल इंजीनियरिंग औद्योगिक दौरे यहाँ।"},

    {"text": "civil engineering", "key": "dept-bachelor_civil_engineering", "lang": "english", "response": "civil engineering Industrial Visits Here."},
    {"text": "civil", "key": "dept-bachelor_civil_engineering", "lang": "english", "response": "civil engineering Industrial Visits Here."},
    {"text": "BE.Civil", "key": "dept-bachelor_civil_engineering", "lang": "english", "response": "civil engineering Industrial Visits Here."},
    {"text": "BE.civil engineering", "key": "dept-bachelor_civil_engineering", "lang": "english", "response": "civil engineering Industrial Visits Here."},
    {"text": "கட்டிட பொறியாளர்", "key": "dept-bachelor_civil_engineering", "lang": "tamil", "response": "சிவில் இன்ஜினியரிங் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "கட்டிட", "key": "dept-bachelor_civil_engineering", "lang": "tamil", "response": "சிவில் இன்ஜினியரிங் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "BE.கட்டிட", "key": "dept-bachelor_civil_engineering", "lang": "tamil", "response": "சிவில் இன்ஜினியரிங் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "BE.கட்டிட பொறியாளர்", "key": "dept-bachelor_civil_engineering", "lang": "tamil", "response": "சிவில் இன்ஜினியரிங் தொழிற்சாலை பயணங்கள் இங்கு."},
    {"text": "सिविल इंजीनियरिंग", "key": "dept-bachelor_civil_engineering", "lang": "hindi", "response": "सिविल इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "सिविल", "key": "dept-bachelor_civil_engineering", "lang": "hindi", "response": "सिविल इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "BE.सिविल", "key": "dept-bachelor_civil_engineering", "lang": "hindi", "response": "सिविल इंजीनियरिंग औद्योगिक दौरे यहाँ।"},
    {"text": "BE.सिविल इंजीनियरिंग", "key": "dept-bachelor_civil_engineering", "lang": "hindi", "response": "सिविल इंजीनियरिंग औद्योगिक दौरे यहाँ।"},

]


# Extracting the text, keys, and language info
texts = [entry['text'] for entry in training_data]
keys = [entry['key'] for entry in training_data]
langs = [entry['lang'] for entry in training_data]
responses = [entry['response'] for entry in training_data]

# Create a pipeline for vectorizing the text and applying the Naive Bayes classifier
model = make_pipeline(TfidfVectorizer(), MultinomialNB())

# Train the model
model.fit(texts, keys)

# Function to predict key and language based on input text
def predict_with_partial(text):
    # Check if input text is a substring of any training text
    for entry in training_data:
        if entry["text"].find(text) != -1:  # Find the partial match
            return {"key": entry["key"], "lang": entry["lang"], "response": entry['response']}  # Return the corresponding lang and response
    
    # If no exact match, fall back to the trained model prediction
    predicted_key = model.predict([text])[0]
    
    # # Find the corresponding entry from the training data based on the predicted key
    # for entry in training_data:
    #     if entry["key"] == predicted_key:
    #         return {"lang": entry["lang"], "response": "Your response here"}
    
    # return {"lang": "unknown", "response": "No response available"}

# Get the input text from the command line arguments (from Node.js)
input_text = sys.argv[1]

# Get the prediction result
predicted_result = predict_with_partial(input_text)

# Output the prediction as JSON for NestJS to parse
print(json.dumps(predicted_result, ensure_ascii=False))
