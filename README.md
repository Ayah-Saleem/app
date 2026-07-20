# Jusoor - Full Stack Application

## About Jusoor
Jusoor is a comprehensive full-stack web application built with React, FastAPI, and MongoDB. It provides a modern platform for managing and showcasing content with a focus on user experience and performance.

## Project Structure

### Frontend
- **Technology**: React 19, React Router, Tailwind CSS, shadcn/ui
- **Location**: `/frontend`
- **Port**: 3000 (development)

### Backend
- **Technology**: FastAPI, MongoDB, Python 3.x
- **Location**: `/backend`
- **Port**: 8000 (development)

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (3.8+)
- MongoDB (local or cloud instance)

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## Environment Configuration

### Frontend `.env`
```
REACT_APP_BACKEND_URL=http://localhost:8000
WDS_SOCKET_PORT=3000
ENABLE_HEALTH_CHECK=true
```

### Backend Configuration
Configure your MongoDB connection and other settings in the backend environment.

## Features

- User authentication and authorization
- Responsive UI with Tailwind CSS
- Real-time updates with Socket.io
- RESTful API with FastAPI
- Modern component library (shadcn/ui)

## Development

This project uses:
- React hooks and functional components
- FastAPI for API endpoints
- MongoDB for data persistence
- Tailwind CSS for styling

## License

Built by Ayah Saleem

## Support

For questions or issues, please open an issue in the repository.
