# TaskFlow Dashboard

Enterprise Task Management System with IBM Design Language

## Features

### Backend (FastAPI)
- ✅ RESTful API with FastAPI
- ✅ Task CRUD operations
- ✅ Priority levels (Low, Medium, High)
- ✅ Task descriptions and due dates
- ✅ Analytics and statistics endpoint
- ✅ CORS enabled
- ✅ Serves built React frontend

### Frontend (React + Vite)
- ✅ IBM Design System (Blue & White theme)
- ✅ IBM Plex Sans typography
- ✅ Real-time task management
- ✅ Interactive charts (Pie & Bar charts)
- ✅ Task filtering (All, Pending, Completed, High Priority)
- ✅ Priority management with color-coded badges
- ✅ Statistics dashboard
- ✅ Responsive design
- ✅ Modern, professional UI

## Quick Start

### Option 1: Run with Script (Recommended)

```bash
chmod +x run.sh
./run.sh
```

Then open http://localhost:8080 in your browser.

### Option 2: Manual Setup

#### 1. Install Backend Dependencies
```bash
cd backend
pip3 install -r requirements.txt
```

#### 2. Build Frontend
```bash
cd frontend
npm install
npm run build
```

#### 3. Run Application
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080
```

Then open http://localhost:8080 in your browser.

## Development Mode

If you want to develop with hot-reload:

### Terminal 1 - Backend
```bash
cd backend
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Frontend will be at http://localhost:3000 (with hot-reload)

## API Endpoints

- `GET /api` - API status
- `GET /api/health` - Health check
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Mark task as complete
- `DELETE /api/tasks/{id}` - Delete task
- `GET /api/stats` - Get statistics
- `PUT /api/tasks/{id}/priority` - Update task priority

## Project Structure

```
.
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile          # Backend container
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── index.css       # IBM-styled CSS
│   │   └── main.jsx        # React entry point
│   ├── package.json        # Node dependencies
│   ├── vite.config.js      # Vite configuration
│   └── Dockerfile          # Frontend container
├── openshift/              # OpenShift deployment configs
└── run.sh                  # Quick start script
```

## Technology Stack

### Backend
- FastAPI
- Uvicorn
- Python 3.9+

### Frontend
- React 18
- Vite
- Axios
- Recharts
- IBM Plex Sans Font

## Design System

The application follows IBM's design principles:
- **Primary Color**: IBM Blue (#0f62fe)
- **Typography**: IBM Plex Sans
- **Layout**: Clean, professional grid system
- **Components**: Modern cards, buttons, and forms
- **Responsive**: Mobile-first design

## Deployment

### Docker
Build and run with Docker:
```bash
# Backend
docker build -t taskflow-backend ./backend
docker run -p 8080:8080 taskflow-backend

# Frontend (for development)
docker build -t taskflow-frontend ./frontend
docker run -p 3000:3000 taskflow-frontend
```

### OpenShift
Deploy to OpenShift using the provided YAML files in the `openshift/` directory.

## License

MIT License