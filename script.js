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


let tasksCollection;

document.addEventListener('DOMContentLoaded', () => {
    // Pedir permiso de notificación al cargar la app
    if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Inicializar referencia a la colección de tareas en Firestore
    tasksCollection = db.collection("tasks");

    // Cargar tareas desde Firestore
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

    // Ajustar fecha a medianoche local para evitar desfase por zona horaria
    const [year, month, day] = taskDeadline.split('-');
    const localDate = new Date(Number(year), Number(month) - 1, Number(day), 0, 0, 0);
    const task = {
        name: taskName,
        // Guardar la fecha como string ISO local (sin desfase)
        deadline: localDate.toISOString().split('T')[0],
        materia: taskMateria,
        completed: false,
        createdAt: new Date()
    };
    tasksCollection.add(task)
        .then(() => {
            loadTasks();
            closeModal();
        })
        .catch((error) => {
            alert("Error al guardar la tarea: " + error);
        });
}

// Función para cargar tareas
function loadTasks() {
    const taskList = document.getElementById('taskList');
    const loadingDiv = document.getElementById('loadingTasks');
    taskList.innerHTML = '';
    loadingDiv.style.display = 'block';
    tasksCollection.orderBy("createdAt", "desc").get()
        .then((querySnapshot) => {
            tasks = [];
            querySnapshot.forEach((doc) => {
                const task = doc.data();
                task.id = doc.id;
                tasks.push(task);
            });
            renderTasks(tasks);
            // Revisar notificaciones después de cargar tareas
            checkTaskNotifications(tasks);
        })
        .catch((error) => {
            alert("Error al cargar tareas: " + error);
        })
        .finally(() => {
            loadingDiv.style.display = 'none';
        });

// Función para notificar tareas próximas
function checkTaskNotifications(tasks) {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    tasks.forEach(task => {
        if (!task.deadline) return;
        const taskDate = new Date(task.deadline + 'T00:00:00');
        if (
            taskDate.getFullYear() === tomorrow.getFullYear() &&
            taskDate.getMonth() === tomorrow.getMonth() &&
            taskDate.getDate() === tomorrow.getDate()
        ) {
            // Notificar solo si no se ha notificado antes en esta sesión
            if (!window["notified_" + task.id]) {
                new Notification("Tarea para mañana", {
                    body: `${task.name} - ${task.materia}`
                });
                window["notified_" + task.id] = true;
            }
        }
    });
}
}

// Función para formatear la fecha (mostrar día de la semana)
function formatDate(date) {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
}

// Función para marcar una tarea como completada
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    tasksCollection.doc(id).update({ completed: !task.completed })
        .then(() => loadTasks())
        .catch((error) => alert("Error al actualizar tarea: " + error));
}

// Función para eliminar tarea
function removeTask(id) {
    tasksCollection.doc(id).delete()
        .then(() => loadTasks())
        .catch((error) => alert("Error al eliminar tarea: " + error));
}

// Función para filtrar tareas
function filterTasks(materia = '', fecha = '') {
    let query = tasksCollection;
    if (materia) {
        query = query.where("materia", "==", materia);
    }
    if (fecha === 'masCercano') {
        query = query.orderBy("deadline", "asc");
    } else {
        query = query.orderBy("createdAt", "desc");
    }
    query.get()
        .then((querySnapshot) => {
            let filteredTasks = [];
            querySnapshot.forEach((doc) => {
                const task = doc.data();
                task.id = doc.id;
                filteredTasks.push(task);
            });
            renderTasks(filteredTasks);
        })
        .catch((error) => {
            alert("Error al filtrar tareas: " + error);
        });
}
// Función para renderizar una lista de tareas específica (usada por el filtro)
function renderTasks(taskArray) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    taskArray.forEach(task => {
        const li = document.createElement('li');
        li.classList.toggle('completed', task.completed);
        // Asegurarse de que la fecha esté en formato válido
        let formattedDate = '';
        if (task.deadline) {
            formattedDate = formatDate(task.deadline);
        }
        li.innerHTML = `
            <div class="task-card">
                <p class="date-day">${formattedDate}</p>
                <p class="description">${task.name} - ${task.materia}</p>
                <div class="task-buttons">
                    <button onclick="toggleTask('${task.id}')">✅</button>
                    <button class="remove" onclick="removeTask('${task.id}')">🗑️</button>
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
