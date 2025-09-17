let tasks = [];

document.addEventListener('DOMContentLoaded', () => {
    // Cargar tareas desde el almacenamiento local
    loadTasks();
    
    // Abre el modal para agregar tarea
    document.getElementById('openModal').addEventListener('click', openModal);
    
    // Filtrar tareas por materia o fecha
    document.getElementById('filterMateria').addEventListener('change', filterTasks);
    document.getElementById('filterFecha').addEventListener('change', filterTasks);
});

// Abre el modal
function openModal() {
    document.getElementById('taskModal').style.display = 'block';
}

// Cierra el modal
function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
}

// Función para agregar tarea
function addTask() {
    const taskName = document.getElementById('taskName').value;
    const taskDeadline = document.getElementById('taskDeadline').value;
    const taskMateria = document.getElementById('taskMateria').value;

    if (!taskName || !taskDeadline) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const task = {
        id: Date.now(),
        name: taskName,
        deadline: taskDeadline,
        materia: taskMateria,
        completed: false,
    };

    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
    closeModal();
}

// Función para cargar tareas
function loadTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.classList.toggle('completed', task.completed);

        li.innerHTML = `
            <span>${task.name} - ${task.materia} (Fecha límite: ${task.deadline})</span>
            <button onclick="toggleTask(${task.id})">Marcar como completada</button>
            <button class="remove" onclick="removeTask(${task.id})">Eliminar</button>
        `;
        taskList.appendChild(li);
    });
}

// Función para marcar una tarea como completada
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    task.completed = !task.completed;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Función para eliminar tarea
function removeTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadTasks();
}

// Función para filtrar tareas
function filterTasks() {
    const filterMateria = document.getElementById('filterMateria').value;
    const filterFecha = document.getElementById('filterFecha').value;

    let filteredTasks = tasks;

    if (filterMateria) {
        filteredTasks = filteredTasks.filter(t => t.materia === filterMateria);
    }

    if (filterFecha === 'masCercano') {
        filteredTasks = filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    tasks = filteredTasks;
    loadTasks();
}
