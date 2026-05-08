from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from pathlib import Path
from sqlalchemy.orm import Session
from database import TaskDB, init_db, get_db

app = FastAPI()

# Initialize database
init_db()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (built React app)
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    app.mount("/assets", StaticFiles(directory=static_dir / "assets"), name="assets")

class Task(BaseModel):
    title: str
    description: str = ""
    priority: str = "medium"  # low, medium, high
    completed: bool = False
    due_date: str = ""


@app.on_event("startup")
def startup_event():
    """Add default tasks if database is empty"""
    db = next(get_db())
    if db.query(TaskDB).count() == 0:
        default_tasks = [
            TaskDB(
                title="Deploy app on OpenShift",
                description="Configure and deploy the application to OpenShift cluster",
                priority="high",
                completed=False,
                due_date="2026-05-15"
            ),
            TaskDB(
                title="Review code documentation",
                description="Update API documentation and add code comments",
                priority="medium",
                completed=False,
                due_date="2026-05-10"
            )
        ]
        db.add_all(default_tasks)
        db.commit()
    db.close()


@app.get("/api")
def root():
    return {"message": "TaskFlow API Running"}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/tasks")
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(TaskDB).all()
    return [
        {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
            "due_date": task.due_date,
        }
        for task in tasks
    ]


@app.post("/api/tasks")
def create_task(task: Task, db: Session = Depends(get_db)):
    new_task = TaskDB(
        title=task.title,
        description=task.description,
        priority=task.priority,
        completed=task.completed,
        due_date=task.due_date,
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return {
        "id": new_task.id,
        "title": new_task.title,
        "description": new_task.description,
        "priority": new_task.priority,
        "completed": new_task.completed,
        "due_date": new_task.due_date,
    }


@app.put("/api/tasks/{task_id}")
def complete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if task:
        task.completed = True
        db.commit()
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
            "due_date": task.due_date,
        }
    return {"error": "Task not found"}


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if task:
        db.delete(task)
        db.commit()
        return {"message": "Task deleted"}
    return {"error": "Task not found"}


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    tasks = db.query(TaskDB).all()
    total = len(tasks)
    completed = len([t for t in tasks if t.completed])
    pending = total - completed
    high_priority = len([t for t in tasks if t.priority == "high" and not t.completed])
    
    return {
        "total": total,
        "completed": completed,
        "pending": pending,
        "high_priority": high_priority,
        "completion_rate": round((completed / total * 100) if total > 0 else 0, 1)
    }


@app.put("/api/tasks/{task_id}/priority")
def update_priority(task_id: int, priority: str, db: Session = Depends(get_db)):
    task = db.query(TaskDB).filter(TaskDB.id == task_id).first()
    if task:
        task.priority = priority
        db.commit()
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "priority": task.priority,
            "completed": task.completed,
            "due_date": task.due_date,
        }
    return {"error": "Task not found"}


# Serve React App - MUST BE LAST
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    """Serve the React application for all non-API routes"""
    if static_dir.exists():
        file_path = static_dir / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        # Return index.html for client-side routing
        return FileResponse(static_dir / "index.html")
    return {"message": "Frontend not built. Run 'npm run build' in frontend directory."}

# Made with Bob
