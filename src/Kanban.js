import React, { useState, useEffect } from 'react';
import './Kanban.css';

// Formulario para crear una nueva tarea
function CreateTaskForm({ users, states, onTaskCreated }) {
    const [form, setForm] = useState({ title: '', description: '', assignee_ids: [] });

    // Actualiza los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Actualiza la selección múltiple de usuarios
    const handleAssigneeChange = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setForm({ ...form, assignee_ids: selectedIds });
    };

    // Envía el formulario para crear una tarea
    const handleSubmit = async (e) => {
        e.preventDefault();
        const todoState = states.find(st => st.name === "To Do"); // Busca el estado "To Do"
        if (!todoState) return;
        const body = { ...form, enabled: 1, state_id: todoState.id };
        await fetch('http://localhost:8000/api/tasks/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        setForm({ title: '', description: '', assignee_ids: [] });
        onTaskCreated(); // Recarga la lista de tareas
    };

    return (
        <form onSubmit={handleSubmit} className="create-task-form">
            <input type="text" name="title" placeholder="Título" value={form.title} onChange={handleChange} required />
            <input type="text" name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
            <label>Asignados:</label>
            <select multiple value={form.assignee_ids} onChange={handleAssigneeChange}>
                {users.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
            </select>
            <button type="submit">Crear Tarea</button>
        </form>
    );
}

// Formulario para editar una tarea existente
function EditTaskForm({ task, users, states, onCancel, onTaskUpdated }) {
    const [form, setForm] = useState({
        title: task.title,
        description: task.description,
        assignee_ids: task.assignees.map(u => u.id),
        state_id: task.state.id
    });

    // Actualiza los campos del formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Actualiza la selección múltiple de usuarios
    const handleAssigneeChange = (e) => {
        const selectedIds = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setForm({ ...form, assignee_ids: selectedIds });
    };

    // Envía el formulario para actualizar la tarea
    const handleSubmit = async (e) => {
        e.preventDefault();
        const body = { ...form, enabled: task.enabled };
        await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        onTaskUpdated();
    };

    return (
        <form onSubmit={handleSubmit} className="edit-task-form">
            <input type="text" name="title" placeholder="Título" value={form.title} onChange={handleChange} required />
            <input type="text" name="description" placeholder="Descripción" value={form.description} onChange={handleChange} />
            <label>Estado:</label>
            <select name="state_id" value={form.state_id} onChange={handleChange}>
                {states.map(st => (<option key={st.id} value={st.id}>{st.name}</option>))}
            </select>
            <label>Asignados:</label>
            <select multiple value={form.assignee_ids} onChange={handleAssigneeChange}>
                {users.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
            </select>
            <button type="submit">Guardar</button>
            <button type="button" onClick={onCancel}>Cancelar</button>
        </form>
    );
}

// Tablero Kanban: muestra tareas por columnas y permite mover, editar, desactivar o eliminar tareas
function KanbanBoard() {
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [states, setStates] = useState([]);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        fetchTasks();
        fetchUsers();
        fetchStates();
    }, []);

    // Carga las tareas desde la API
    const fetchTasks = async () => {
        const res = await fetch('http://localhost:8000/api/tasks/');
        const data = await res.json();
        setTasks(data.filter(task => task.enabled !== 0));
    };

    // Carga los usuarios desde la API
    const fetchUsers = async () => {
        const res = await fetch('http://localhost:8000/api/users/');
        const data = await res.json();
        setUsers(data);
    };

    // Carga los estados desde la API
    const fetchStates = async () => {
        const res = await fetch('http://localhost:8000/api/states/');
        const data = await res.json();
        setStates(data);
    };

    // Actualiza el estado de la tarea (mover de columna)
    const updateTaskState = async (task, newStateId) => {
        const body = {
            title: task.title,
            description: task.description,
            enabled: task.enabled,
            state_id: newStateId,
            assignee_ids: task.assignees.map(u => u.id)
        };
        await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        fetchTasks();
    };

    // Desactiva (soft delete) la tarea
    const disableTask = async (task) => {
        const body = {
            title: task.title,
            description: task.description,
            enabled: 0,
            state_id: task.state.id,
            assignee_ids: task.assignees.map(u => u.id)
        };
        await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        fetchTasks();
    };

    // Elimina la tarea definitivamente (delete en cascada)
    const deleteTask = async (task) => {
        await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
            method: 'DELETE'
        });
        fetchTasks();
    };

    // Filtra las tareas por estado
    const getTasksByState = (stateName) => {
        const st = states.find(s => s.name === stateName);
        if (!st) return [];
        return tasks.filter(t => t.state.id === st.id);
    };

    const onTaskUpdated = () => {
        setEditingTask(null);
        fetchTasks();
    };

    return (
        <div className="kanban-board">
            <div className="kanban-column">
                <h2>To Do</h2>
                <CreateTaskForm users={users} states={states} onTaskCreated={fetchTasks} />
                {getTasksByState("To Do").map(task => (
                    <div key={task.id} className="kanban-task">
                        {editingTask && editingTask.id === task.id ? (
                            <EditTaskForm
                                task={task}
                                users={users}
                                states={states}
                                onCancel={() => setEditingTask(null)}
                                onTaskUpdated={onTaskUpdated}
                            />
                        ) : (
                            <>
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <p><strong>Asignados:</strong> {task.assignees.map(u => u.name).join(", ")}</p>
                                <div className="kanban-buttons">
                                    <button onClick={() => updateTaskState(task, 2)}>Avanzar</button>
                                    <button onClick={() => setEditingTask(task)}>Editar</button>
                                    <button onClick={() => disableTask(task)}>Desactivar</button>
                                    <button onClick={() => deleteTask(task)}>Eliminar</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="kanban-column">
                <h2>In Progress</h2>
                {getTasksByState("In Progress").map(task => (
                    <div key={task.id} className="kanban-task">
                        {editingTask && editingTask.id === task.id ? (
                            <EditTaskForm
                                task={task}
                                users={users}
                                states={states}
                                onCancel={() => setEditingTask(null)}
                                onTaskUpdated={onTaskUpdated}
                            />
                        ) : (
                            <>
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <p><strong>Asignados:</strong> {task.assignees.map(u => u.name).join(", ")}</p>
                                <div className="kanban-buttons">
                                    <button onClick={() => updateTaskState(task, 1)}>Retroceder</button>
                                    <button onClick={() => updateTaskState(task, 3)}>Avanzar</button>
                                    <button onClick={() => setEditingTask(task)}>Editar</button>
                                    <button onClick={() => disableTask(task)}>Desactivar</button>
                                    <button onClick={() => deleteTask(task)}>Eliminar</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <div className="kanban-column">
                <h2>Done</h2>
                {getTasksByState("Done").map(task => (
                    <div key={task.id} className="kanban-task">
                        {editingTask && editingTask.id === task.id ? (
                            <EditTaskForm
                                task={task}
                                users={users}
                                states={states}
                                onCancel={() => setEditingTask(null)}
                                onTaskUpdated={onTaskUpdated}
                            />
                        ) : (
                            <>
                                <h3>{task.title}</h3>
                                <p>{task.description}</p>
                                <p><strong>Asignados:</strong> {task.assignees.map(u => u.name).join(", ")}</p>
                                <div className="kanban-buttons">
                                    <button onClick={() => updateTaskState(task, 2)}>Retroceder</button>
                                    <button onClick={() => setEditingTask(task)}>Editar</button>
                                    <button onClick={() => disableTask(task)}>Desactivar</button>
                                    <button onClick={() => deleteTask(task)}>Eliminar</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function UserManager() {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', email: '' });
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const res = await fetch('http://localhost:8000/api/users/');
        const data = await res.json();
        setUsers(data);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (editingUser) setEditingUser({ ...editingUser, [name]: value });
        else setNewUser({ ...newUser, [name]: value });
    };

    const addUser = async (e) => {
        e.preventDefault();
        await fetch('http://localhost:8000/api/users/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });
        setNewUser({ name: '', email: '' });
        fetchUsers();
    };

    const updateUser = async (user) => {
        await fetch(`http://localhost:8000/api/users/${user.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        setEditingUser(null);
        fetchUsers();
    };

    const deleteUser = async (userId) => {
        await fetch(`http://localhost:8000/api/users/${userId}/`, {
            method: 'DELETE'
        });
        fetchUsers();
    };

    return (
        <div className="user-manager">
            <h2>Usuarios</h2>
            <form onSubmit={editingUser ? (e) => { e.preventDefault(); updateUser(editingUser); } : addUser}>
                <input type="text" name="name" placeholder="Nombre" value={editingUser ? editingUser.name : newUser.name} onChange={handleInputChange} required />
                <input type="email" name="email" placeholder="Email" value={editingUser ? editingUser.email : newUser.email} onChange={handleInputChange} required />
                <button type="submit">{editingUser ? 'Actualizar' : 'Agregar'}</button>
            </form>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.name} ({user.email})
                        <button onClick={() => setEditingUser(user)}>Editar</button>
                        <button onClick={() => deleteUser(user.id)}>Eliminar</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function KanbanApp() {
    const [view, setView] = useState("kanban");
    return (
        <div>
            <nav>
                <button onClick={() => setView("kanban")}>Kanban</button>
                <button onClick={() => setView("users")}>Usuarios</button>
            </nav>
            {view === "kanban" ? <KanbanBoard /> : <UserManager />}
        </div>
    );
}

export default KanbanApp;
