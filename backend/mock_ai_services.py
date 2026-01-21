import time
import random
from typing import Dict, Any

class MockAIServices:
    """Mock AI services for academic demonstration"""
    
    @staticmethod
    def sign_language_to_text(video_path: str, language: str = "en") -> Dict[str, Any]:
        """Mock sign language video to text translation"""
        time.sleep(1.5)  # Simulate processing time
        
        sample_texts = [
            "Hello, how are you today?",
            "Thank you for your help.",
            "I need assistance with something.",
            "Good morning, nice to meet you.",
            "Can you please help me?",
            "I am learning sign language."
        ]
        
        return {
            "success": True,
            "text": random.choice(sample_texts),
            "confidence": round(random.uniform(0.85, 0.98), 2),
            "processing_time": 1.5,
            "detected_language": "ASL"
        }
    
    @staticmethod
    def text_to_sign_language(text: str, language: str = "en") -> Dict[str, Any]:
        """Mock text to sign language video generation"""
        time.sleep(1.2)
        
        # Return a mock video URL
        return {
            "success": True,
            "video_url": "/api/mock/sign-video/" + str(hash(text))[-8:],
            "duration": len(text.split()) * 0.8,
            "processing_time": 1.2,
            "language": "ASL"
        }
    
    @staticmethod
    def speech_to_text(audio_path: str, language: str = "en") -> Dict[str, Any]:
        """Mock speech to text conversion"""
        time.sleep(1.0)
        
        sample_texts = [
            "Welcome to Jusoor translation system.",
            "This is a demonstration of speech recognition.",
            "The system is working correctly.",
            "Thank you for using our service.",
            "How can I help you today?"
        ]
        
        return {
            "success": True,
            "text": random.choice(sample_texts),
            "confidence": round(random.uniform(0.90, 0.99), 2),
            "processing_time": 1.0,
            "detected_language": language
        }
    
    @staticmethod
    def text_to_speech(text: str, language: str = "en") -> Dict[str, Any]:
        """Mock text to speech conversion"""
        time.sleep(0.8)
        
        return {
            "success": True,
            "audio_url": "/api/mock/audio/" + str(hash(text))[-8:],
            "duration": len(text.split()) * 0.5,
            "processing_time": 0.8,
            "language": language
        }
    
    @staticmethod
    def translate_text(text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Mock text translation"""
        time.sleep(0.5)
        
        # Simple mock translations
        translations = {
            "en_ar": {
                "Hello": "مرحبا",
                "Thank you": "شكرا لك",
                "Good morning": "صباح الخير",
                "How are you": "كيف حالك"
            },
            "ar_en": {
                "مرحبا": "Hello",
                "شكرا": "Thank you",
                "صباح الخير": "Good morning",
                "كيف حالك": "How are you"
            }
        }
        
        key = f"{source_lang}_{target_lang}"
        translated = translations.get(key, {}).get(text, f"[{target_lang.upper()}] {text}")
        
        return {
            "success": True,
            "translated_text": translated,
            "source_language": source_lang,
            "target_language": target_lang,
            "confidence": round(random.uniform(0.92, 0.99), 2),
            "processing_time": 0.5
        }