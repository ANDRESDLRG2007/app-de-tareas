// Cargar tareas desde almacenamiento local
document.addEventListener("DOMContentLoaded", loadTasks);

// Función para agregar una tarea
function addTask() {
    const taskName = document.getElementById("taskName").value;
    if (taskName === "") {
        alert("Por favor ingresa una tarea");
        return;
    }

    const task = {
        name: taskName,
        completed: false,
        id: Date.now(),
        deadline: getTaskDeadline()
    };

    // Guardar la tarea en el almacenamiento local
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    // Limpiar el campo de entrada
    document.getElementById("taskName").value = "";

    // Recargar tareas
    loadTasks();
}

// Función para cargar y mostrar las tareas
function loadTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    
    tasks.forEach(task => {
        const li = document.createElement("li");
        li.classList.toggle("completed", task.completed);

        li.innerHTML = `
            <span>${task.name} (Fecha límite: ${task.deadline})</span>
            <button onclick="toggleTask(${task.id})">Marcar como ${task.completed ? 'pendiente' : 'completada'}</button>
            <button class="remove" onclick="removeTask(${task.id})">Eliminar</button>
        `;
        
        taskList.appendChild(li);
    });

    // Verificar fechas límite
    checkDeadlines();
}

// Función para marcar una tarea como completada o pendiente
function toggleTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    const task = tasks.find(t => t.id === taskId);
    task.completed = !task.completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    
    loadTasks();
}

// Función para eliminar una tarea
function removeTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem("tasks"));
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    loadTasks();
}

// Función para obtener la fecha límite (en este caso, es un ejemplo estático)
function getTaskDeadline() {
    const today = new Date();
    today.setDate(today.getDate() + 2); // Fecha límite en 2 días
    return today.toLocaleDateString();
}

// Función para comprobar fechas límite y enviar notificaciones
function checkDeadlines() {
    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const notifications = document.getElementById("notifications");
    notifications.innerHTML = "";

    tasks.forEach(task => {
        const deadline = new Date(task.deadline);
        const now = new Date();
        const timeDiff = deadline - now;

        // Si la tarea está cerca de la fecha límite (menos de 24 horas)
        if (timeDiff > 0 && timeDiff < 86400000) {
            const alertMessage = document.createElement("div");
            alertMessage.innerText = `¡Recordatorio! La tarea "${task.name}" tiene fecha límite el ${task.deadline}.`;
            notifications.appendChild(alertMessage);
        }
    });
}

// Opcional: Llamar a checkDeadlines cada hora
setInterval(checkDeadlines, 3600000); // Cada hora (3600000ms)
