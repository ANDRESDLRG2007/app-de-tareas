let tasks = [];

// Materias disponibles
const availableMaterias = [
    "Inglés III",
    "Emprendimiento I",
    "Gestión de Bases de Datos",
    "Construcción de Aplicaciones Web",
    "Tecnologías para Aplicaciones Móviles",
    "Estructura de Datos Avanzada"
];

document.addEventListener('DOMContentLoaded', () => {
    // Cargar tareas desde el almacenamiento local
    loadTasks();

    // Abre el modal para agregar tarea
    document.getElementById('openModal').addEventListener('click', openModal);

    // Establecer filtro
    document.getElementById('setFilterBtn').addEventListener('click', setFilter);

    // Borrar filtro
    document.getElementById('clearFilterBtn').addEventListener('click', clearFilter);
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

        const formattedDate = formatDate(task.deadline);
        li.innerHTML = `
            <div class="task-card">
                <p class="date-day">${formattedDate}</p>
                <p class="description">${task.name} - ${task.materia}</p>
                <div class="task-buttons">
                    <button onclick="toggleTask(${task.id})">✅</button>
                    <button class="remove" onclick="removeTask(${task.id})">🗑️</button>
                </div>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Función para formatear la fecha (mostrar día de la semana)
function formatDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
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
function filterTasks(materia = '', fecha = '') {
    // Obtener todas las tareas desde localStorage
    let allTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let filteredTasks = allTasks;

    // Filtrar por materia
    if (materia) {
        filteredTasks = filteredTasks.filter(t => t.materia === materia);
    }

    // Filtrar por fecha
    if (fecha === 'masCercano') {
        filteredTasks = filteredTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    // Mostrar las tareas filtradas
    renderTasks(filteredTasks);
}
// Función para renderizar una lista de tareas específica (usada por el filtro)
function renderTasks(taskArray) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    taskArray.forEach(task => {
        const li = document.createElement('li');
        li.classList.toggle('completed', task.completed);
        const formattedDate = formatDate(task.deadline);
        li.innerHTML = `
            <div class="task-card">
                <p class="date-day">${formattedDate}</p>
                <p class="description">${task.name} - ${task.materia}</p>
                <div class="task-buttons">
                    <button onclick="toggleTask(${task.id})">✅</button>
                    <button class="remove" onclick="removeTask(${task.id})">🗑️</button>
                </div>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Función para establecer el filtro
function setFilter() {
    const filterMateria = document.getElementById('filterMateria').value;
    const filterFecha = document.getElementById('filterFecha').value;

    filterTasks(filterMateria, filterFecha); // Llamamos a la función de filtro con los valores seleccionados
}

// Función para borrar el filtro
function clearFilter() {
    // Restablecer los filtros a valores vacíos
    document.getElementById('filterMateria').value = '';
    document.getElementById('filterFecha').value = '';

    // Recargar todas las tareas sin filtros aplicados
    loadTasks();
}
