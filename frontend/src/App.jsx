import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'

const API = import.meta.env.VITE_API_URL || '/api'

// IBM Color Palette
const COLORS = {
  primary: '#0f62fe',
  secondary: '#0043ce',
  success: '#24a148',
  warning: '#f1c21b',
  danger: '#da1e28',
  gray: '#525252',
  lightGray: '#f4f4f4',
  white: '#ffffff',
}

const PRIORITY_COLORS = {
  high: COLORS.danger,
  medium: COLORS.warning,
  low: COLORS.success,
}

function App() {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({})
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState('all')

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/tasks`)
      setTasks(res.data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/stats`)
      setStats(res.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchStats()
  }, [])

  const addTask = async () => {
    if (!title) return

    await axios.post(`${API}/tasks`, {
      title,
      description,
      priority,
      completed: false,
      due_date: dueDate,
    })

    setTitle('')
    setDescription('')
    setPriority('medium')
    setDueDate('')
    fetchTasks()
    fetchStats()
  }

  const completeTask = async (id) => {
    await axios.put(`${API}/tasks/${id}`)
    fetchTasks()
    fetchStats()
  }

  const deleteTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`)
    fetchTasks()
    fetchStats()
  }

  const updatePriority = async (id, newPriority) => {
    await axios.put(`${API}/tasks/${id}/priority?priority=${newPriority}`)
    fetchTasks()
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed
    if (filter === 'pending') return !task.completed
    if (filter === 'high') return task.priority === 'high' && !task.completed
    return true
  })

  const chartData = [
    { name: 'Completed', value: stats.completed || 0, color: COLORS.success },
    { name: 'Pending', value: stats.pending || 0, color: COLORS.primary },
  ]

  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
  ]

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="logo">
            <span className="logo-icon">📋</span>
            TaskFlow Dashboard
          </h1>
          <p className="subtitle">Enterprise Task Management System</p>
        </div>
      </header>

      <main className="container main-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card primary">
            <div className="stat-value">{stats.total || 0}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.completed || 0}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card warning">
            <div className="stat-value">{stats.pending || 0}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card danger">
            <div className="stat-value">{stats.high_priority || 0}</div>
            <div className="stat-label">High Priority</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="card">
            <h2 className="card-title">Task Completion</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="completion-rate">
                <strong>{stats.completion_rate || 0}%</strong> Completion Rate
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Priority Distribution</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.primary} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Create Task Form */}
        <div className="card">
          <h2 className="card-title">Create New Task</h2>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Task Title *</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary" onClick={addTask}>
            <span className="btn-icon">+</span> Add Task
          </button>
        </div>

        {/* Task List */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Tasks</h2>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
              <button
                className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
                onClick={() => setFilter('high')}
              >
                High Priority
              </button>
            </div>
          </div>

          <div className="task-list">
            {filteredTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>No tasks found</p>
              </div>
            ) : (
              filteredTasks.map(task => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <div className="task-header">
                      <span className="task-status">
                        {task.completed ? '✅' : '⏳'}
                      </span>
                      <h3 className="task-title">{task.title}</h3>
                      <span
                        className={`priority-badge priority-${task.priority}`}
                        style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    {task.due_date && (
                      <p className="task-due-date">
                        📅 Due: {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="task-actions">
                    {!task.completed && (
                      <>
                        <select
                          className="priority-select"
                          value={task.priority}
                          onChange={(e) => updatePriority(task.id, e.target.value)}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => completeTask(task.id)}
                        >
                          Complete
                        </button>
                      </>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteTask(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2026 TaskFlow - Enterprise Task Management System</p>
        </div>
      </footer>
    </div>
  )
}

export default App

// Made with Bob
