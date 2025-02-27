import React, { useState } from 'react';
import './Kanban.css';

const Kanban = () => {
    const [columns, setColumns] = useState({
        todo: [
            { id: 1, title: "Tarea 1", description: "Descripción de la tarea 1", assignee: "Juan" },
            { id: 2, title: "Tarea 2", description: "Descripción de la tarea 2", assignee: "María" }
        ],
        inProgress: [
            { id: 3, title: "Tarea 3", description: "Descripción de la tarea 3", assignee: "Carlos" }
        ],
        done: [
            { id: 4, title: "Tarea 4", description: "Descripción de la tarea 4", assignee: "Ana" }
        ]
    });

    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignee: ''
    });

    const moveTaskToNextColumn = (columnName, taskIndex) => {
        const newColumns = { ...columns };
        const task = newColumns[columnName][taskIndex];
        newColumns[columnName] = newColumns[columnName].filter((_, index) => index !== taskIndex);
        let nextColumn = "";
        if (columnName === "todo") nextColumn = "inProgress";
        else if (columnName === "inProgress") nextColumn = "done";
        if (nextColumn) {
            newColumns[nextColumn] = [...newColumns[nextColumn], task];
        }
        setColumns(newColumns);
    };

    const moveTaskToPreviousColumn = (columnName, taskIndex) => {
        const newColumns = { ...columns };
        const task = newColumns[columnName][taskIndex];
        newColumns[columnName] = newColumns[columnName].filter((_, index) => index !== taskIndex);
        let prevColumn = "";
        if (columnName === "inProgress") prevColumn = "todo";
        else if (columnName === "done") prevColumn = "inProgress";
        if (prevColumn) {
            newColumns[prevColumn] = [...newColumns[prevColumn], task];
        }
        setColumns(newColumns);
    };

    const handleInputChange = (e) => {
        setNewTask({ ...newTask, [e.target.name]: e.target.value });
    };

    const addTask = (e) => {
        e.preventDefault();
        // Se crea el objeto tarea sin ID, pues éste se asignará desde la DB
        const newTaskObj = {
            title: newTask.title,
            description: newTask.description,
            assignee: newTask.assignee
        };
        setColumns({ ...columns, todo: [...columns.todo, newTaskObj] });
        setNewTask({ title: '', description: '', assignee: '' });
    };

    return (
        <div className="kanban-board">
            {Object.keys(columns).map(columnName => (
                <div key={columnName} className="kanban-column">
                    <h2>
                        {columnName === "todo" && "To Do"}
                        {columnName === "inProgress" && "In Progress"}
                        {columnName === "done" && "Done"}
                    </h2>
                    {columnName === "todo" && (
                        <form onSubmit={addTask} className="new-task-form">
                            <input
                                type="text"
                                name="title"
                                placeholder="Título"
                                value={newTask.title}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Descripción"
                                value={newTask.description}
                                onChange={handleInputChange}
                            />
                            <input
                                type="text"
                                name="assignee"
                                placeholder="Responsable"
                                value={newTask.assignee}
                                onChange={handleInputChange}
                            />
                            <button type="submit">Añadir tarea</button>
                        </form>
                    )}
                    {columns[columnName].map((task, index) => (
                        <div key={task.id ? task.id : index} className="kanban-task">
                            <h3>{task.title}</h3>
                            <p>{task.description}</p>
                            <p><strong>Responsable:</strong> {task.assignee}</p>
                            <div className="kanban-buttons">
                                {columnName !== "todo" && (
                                    <button onClick={() => moveTaskToPreviousColumn(columnName, index)}>
                                        Retroceder tarea
                                    </button>
                                )}
                                {columnName !== "done" && (
                                    <button onClick={() => moveTaskToNextColumn(columnName, index)}>
                                        Pasar a siguiente tarea
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default Kanban;
