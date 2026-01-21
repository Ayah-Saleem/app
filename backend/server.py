from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
import uuid

# Import custom modules
from database import execute_query
from auth import hash_password, verify_password, create_access_token, decode_access_token
from mock_ai_services import MockAIServices

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Initialize FastAPI
app = FastAPI(title="Jusoor API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.getenv('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Mock AI Services
ai_services = MockAIServices()

# ===== Pydantic Models =====

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2)
    preferred_language: str = "en"

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TranslationRequest(BaseModel):
    input_type: str
    input_content: str
    input_language: str = "en"
    output_type: str
    output_language: str = "en"

class FeedbackRequest(BaseModel):
    feedback_type: str
    rating: Optional[int] = None
    comment: Optional[str] = None
    translation_id: Optional[int] = None
    session_id: Optional[int] = None

class AccessibilitySettingsRequest(BaseModel):
    font_size: Optional[str] = None
    contrast_mode: Optional[str] = None
    color_theme: Optional[str] = None
    colorblind_mode: Optional[str] = None
    text_to_speech_enabled: Optional[bool] = None
    keyboard_navigation_hints: Optional[bool] = None
    reduced_motion: Optional[bool] = None

# ===== Authentication Dependency =====

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header format")
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("user_id")
    user = execute_query(
        "SELECT id, email, full_name, role, preferred_language FROM users WHERE id = %s AND is_active = TRUE",
        (user_id,),
        fetch_one=True
    )
    
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def require_admin(current_user: dict = Depends(get_current_user)):
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

# ===== API Routes =====

@api_router.get("/")
async def root():
    return {"message": "Welcome to Jusoor API", "version": "1.0.0"}

# ----- Authentication Routes -----

@api_router.post("/auth/register")
async def register(request: RegisterRequest):
    try:
        existing_user = execute_query(
            "SELECT id FROM users WHERE email = %s",
            (request.email,),
            fetch_one=True
        )
        
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        password_hash = hash_password(request.password)
        user_id = execute_query(
            """INSERT INTO users (email, password_hash, full_name, preferred_language) 
               VALUES (%s, %s, %s, %s)""",
            (request.email, password_hash, request.full_name, request.preferred_language)
        )
        
        execute_query(
            "INSERT INTO accessibility_settings (user_id) VALUES (%s)",
            (user_id,)
        )
        
        token = create_access_token({"user_id": user_id, "email": request.email})
        
        return {
            "success": True,
            "message": "Registration successful",
            "token": token,
            "user": {
                "id": user_id,
                "email": request.email,
                "full_name": request.full_name,
                "role": "user"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@api_router.post("/auth/login")
async def login(request: LoginRequest):
    try:
        user = execute_query(
            """SELECT id, email, password_hash, full_name, role, preferred_language 
               FROM users WHERE email = %s AND is_active = TRUE""",
            (request.email,),
            fetch_one=True
        )
        
        if not user or not verify_password(request.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        execute_query(
            "UPDATE users SET last_login = %s WHERE id = %s",
            (datetime.now(timezone.utc), user['id'])
        )
        
        token = create_access_token({"user_id": user['id'], "email": user['email']})
        
        return {
            "success": True,
            "message": "Login successful",
            "token": token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "full_name": user['full_name'],
                "role": user['role'],
                "preferred_language": user['preferred_language']
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@api_router.get("/auth/me")
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": current_user
    }

# ----- Translation Routes -----

@api_router.post("/translate")
async def translate(request: TranslationRequest, current_user: dict = Depends(get_current_user)):
    try:
        start_time = datetime.now(timezone.utc)
        result = None
        
        if request.input_type == "video" and request.output_type == "text":
            result = ai_services.sign_language_to_text(request.input_content, request.input_language)
            output_content = result['text']
        elif request.input_type == "text" and request.output_type == "sign":
            result = ai_services.text_to_sign_language(request.input_content, request.output_language)
            output_content = result['video_url']
        elif request.input_type == "audio" and request.output_type == "text":
            result = ai_services.speech_to_text(request.input_content, request.input_language)
            output_content = result['text']
        elif request.input_type == "text" and request.output_type == "audio":
            result = ai_services.text_to_speech(request.input_content, request.output_language)
            output_content = result['audio_url']
        elif request.input_type == "text" and request.output_type == "text":
            result = ai_services.translate_text(request.input_content, request.input_language, request.output_language)
            output_content = result['translated_text']
        else:
            raise HTTPException(status_code=400, detail="Unsupported translation type")
        
        end_time = datetime.now(timezone.utc)
        duration = (end_time - start_time).total_seconds()
        
        translation_id = execute_query(
            """INSERT INTO translation_history 
               (user_id, input_type, input_content, input_language, output_type, output_content, output_language, translation_duration)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (current_user['id'], request.input_type, request.input_content[:1000], request.input_language,
             request.output_type, output_content[:1000], request.output_language, duration)
        )
        
        return {
            "success": True,
            "translation_id": translation_id,
            "result": result,
            "output_content": output_content,
            "duration": duration
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Translation error: {e}")
        raise HTTPException(status_code=500, detail="Translation failed")

@api_router.get("/translations/history")
async def get_translation_history(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    try:
        translations = execute_query(
            """SELECT id, input_type, input_content, input_language, output_type, output_content, 
                      output_language, translation_duration, created_at
               FROM translation_history
               WHERE user_id = %s
               ORDER BY created_at DESC
               LIMIT %s OFFSET %s""",
            (current_user['id'], limit, offset),
            fetch=True
        )
        
        total = execute_query(
            "SELECT COUNT(*) as count FROM translation_history WHERE user_id = %s",
            (current_user['id'],),
            fetch_one=True
        )
        
        return {
            "success": True,
            "translations": translations or [],
            "total": total['count'] if total else 0,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"History retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve history")

@api_router.delete("/translations/{translation_id}")
async def delete_translation(translation_id: int, current_user: dict = Depends(get_current_user)):
    try:
        translation = execute_query(
            "SELECT user_id FROM translation_history WHERE id = %s",
            (translation_id,),
            fetch_one=True
        )
        
        if not translation:
            raise HTTPException(status_code=404, detail="Translation not found")
        
        if translation['user_id'] != current_user['id'] and current_user['role'] != 'admin':
            raise HTTPException(status_code=403, detail="Access denied")
        
        execute_query("DELETE FROM translation_history WHERE id = %s", (translation_id,))
        
        return {"success": True, "message": "Translation deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete translation")

# ----- Live Session Routes -----

@api_router.post("/live-session/start")
async def start_live_session(current_user: dict = Depends(get_current_user)):
    try:
        session_token = str(uuid.uuid4())
        session_id = execute_query(
            """INSERT INTO live_sessions (user_id, session_token, session_name)
               VALUES (%s, %s, %s)""",
            (current_user['id'], session_token, f"Session {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "session_token": session_token
        }
    except Exception as e:
        logger.error(f"Session start error: {e}")
        raise HTTPException(status_code=500, detail="Failed to start session")

@api_router.post("/live-session/{session_id}/message")
async def add_session_message(
    session_id: int,
    message_type: str,
    original_content: str,
    translated_content: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        session = execute_query(
            "SELECT user_id FROM live_sessions WHERE id = %s",
            (session_id,),
            fetch_one=True
        )
        
        if not session or session['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="Access denied")
        
        execute_query(
            """INSERT INTO session_messages (session_id, message_type, original_content, translated_content)
               VALUES (%s, %s, %s, %s)""",
            (session_id, message_type, original_content[:500], translated_content[:500])
        )
        
        execute_query(
            "UPDATE live_sessions SET messages_count = messages_count + 1 WHERE id = %s",
            (session_id,)
        )
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Message add error: {e}")
        raise HTTPException(status_code=500, detail="Failed to add message")

@api_router.post("/live-session/{session_id}/end")
async def end_live_session(session_id: int, current_user: dict = Depends(get_current_user)):
    try:
        session = execute_query(
            "SELECT user_id, start_time FROM live_sessions WHERE id = %s",
            (session_id,),
            fetch_one=True
        )
        
        if not session or session['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="Access denied")
        
        end_time = datetime.now(timezone.utc)
        start_time = session['start_time']
        duration = int((end_time - start_time).total_seconds())
        
        execute_query(
            """UPDATE live_sessions 
               SET end_time = %s, duration_seconds = %s, is_active = FALSE
               WHERE id = %s""",
            (end_time, duration, session_id)
        )
        
        return {"success": True, "duration": duration}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Session end error: {e}")
        raise HTTPException(status_code=500, detail="Failed to end session")

@api_router.get("/live-session/{session_id}/messages")
async def get_session_messages(session_id: int, current_user: dict = Depends(get_current_user)):
    try:
        session = execute_query(
            "SELECT user_id FROM live_sessions WHERE id = %s",
            (session_id,),
            fetch_one=True
        )
        
        if not session or session['user_id'] != current_user['id']:
            raise HTTPException(status_code=403, detail="Access denied")
        
        messages = execute_query(
            """SELECT id, message_type, original_content, translated_content, timestamp
               FROM session_messages WHERE session_id = %s ORDER BY timestamp ASC""",
            (session_id,),
            fetch=True
        )
        
        return {"success": True, "messages": messages or []}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Messages retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve messages")

# ----- Feedback Routes -----

@api_router.post("/feedback")
async def submit_feedback(request: FeedbackRequest, current_user: dict = Depends(get_current_user)):
    try:
        feedback_id = execute_query(
            """INSERT INTO feedback (user_id, translation_id, session_id, feedback_type, rating, comment)
               VALUES (%s, %s, %s, %s, %s, %s)""",
            (current_user['id'], request.translation_id, request.session_id, 
             request.feedback_type, request.rating, request.comment)
        )
        
        return {"success": True, "feedback_id": feedback_id, "message": "Feedback submitted"}
    except Exception as e:
        logger.error(f"Feedback error: {e}")
        raise HTTPException(status_code=500, detail="Failed to submit feedback")

@api_router.get("/feedback")
async def get_feedback(current_user: dict = Depends(get_current_user)):
    try:
        feedback = execute_query(
            """SELECT id, feedback_type, rating, comment, status, created_at
               FROM feedback WHERE user_id = %s ORDER BY created_at DESC""",
            (current_user['id'],),
            fetch=True
        )
        
        return {"success": True, "feedback": feedback or []}
    except Exception as e:
        logger.error(f"Feedback retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve feedback")

# ----- Accessibility Settings Routes -----

@api_router.get("/settings/accessibility")
async def get_accessibility_settings(current_user: dict = Depends(get_current_user)):
    try:
        settings = execute_query(
            """SELECT font_size, contrast_mode, color_theme, colorblind_mode,
                      text_to_speech_enabled, keyboard_navigation_hints, reduced_motion
               FROM accessibility_settings WHERE user_id = %s""",
            (current_user['id'],),
            fetch_one=True
        )
        
        return {"success": True, "settings": settings or {}}
    except Exception as e:
        logger.error(f"Settings retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve settings")

@api_router.put("/settings/accessibility")
async def update_accessibility_settings(
    request: AccessibilitySettingsRequest,
    current_user: dict = Depends(get_current_user)
):
    try:
        updates = []
        params = []
        
        for field, value in request.model_dump(exclude_none=True).items():
            updates.append(f"{field} = %s")
            params.append(value)
        
        if not updates:
            return {"success": True, "message": "No changes"}
        
        params.append(current_user['id'])
        query = f"UPDATE accessibility_settings SET {', '.join(updates)} WHERE user_id = %s"
        
        execute_query(query, tuple(params))
        
        return {"success": True, "message": "Settings updated"}
    except Exception as e:
        logger.error(f"Settings update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update settings")

# ----- Admin Routes -----

@api_router.get("/admin/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    try:
        users = execute_query(
            """SELECT id, email, full_name, role, preferred_language, created_at, last_login, is_active
               FROM users ORDER BY created_at DESC""",
            fetch=True
        )
        
        return {"success": True, "users": users or []}
    except Exception as e:
        logger.error(f"Users retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve users")

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: dict = Depends(require_admin)):
    try:
        total_users = execute_query("SELECT COUNT(*) as count FROM users", fetch_one=True)
        total_translations = execute_query("SELECT COUNT(*) as count FROM translation_history", fetch_one=True)
        total_sessions = execute_query("SELECT COUNT(*) as count FROM live_sessions", fetch_one=True)
        total_feedback = execute_query("SELECT COUNT(*) as count FROM feedback", fetch_one=True)
        
        recent_translations = execute_query(
            """SELECT COUNT(*) as count FROM translation_history 
               WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)""",
            fetch_one=True
        )
        
        return {
            "success": True,
            "stats": {
                "total_users": total_users['count'] if total_users else 0,
                "total_translations": total_translations['count'] if total_translations else 0,
                "total_sessions": total_sessions['count'] if total_sessions else 0,
                "total_feedback": total_feedback['count'] if total_feedback else 0,
                "recent_translations_7days": recent_translations['count'] if recent_translations else 0
            }
        }
    except Exception as e:
        logger.error(f"Stats retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve stats")

@api_router.get("/admin/feedback")
async def get_all_feedback(current_user: dict = Depends(require_admin)):
    try:
        feedback = execute_query(
            """SELECT f.id, f.feedback_type, f.rating, f.comment, f.status, f.created_at,
                      u.email, u.full_name
               FROM feedback f
               LEFT JOIN users u ON f.user_id = u.id
               ORDER BY f.created_at DESC""",
            fetch=True
        )
        
        return {"success": True, "feedback": feedback or []}
    except Exception as e:
        logger.error(f"Feedback retrieval error: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve feedback")

@api_router.put("/admin/feedback/{feedback_id}/status")
async def update_feedback_status(feedback_id: int, status: str, current_user: dict = Depends(require_admin)):
    try:
        execute_query(
            "UPDATE feedback SET status = %s WHERE id = %s",
            (status, feedback_id)
        )
        
        return {"success": True, "message": "Status updated"}
    except Exception as e:
        logger.error(f"Status update error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update status")

# Include router in app
app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)