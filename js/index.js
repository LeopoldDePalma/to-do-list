'use strict';
//==========================================

import {
	getTasksLocalStorage,
	setTasksLocalStorage,
	generateUniqueId,
	initSortableList,
	updateListTasks,
} from './utils.js';

const form = document.querySelector('.form');
const textareaForm = document.querySelector('.form-textarea');
const buttonSendForm = document.querySelector('.form-send-button');
const buttonCancel = document.querySelector('.form-cancel-button');
const output = document.querySelector('.output');
let editId = null;
let isEditTask = false;

updateListTasks();
///! All eventListeners
form.addEventListener('submit', sendTask);
buttonCancel.addEventListener('click', resetSendForm);
output.addEventListener('dragover', initSortableList);
output.addEventListener('dragover', event => {
	event.preventDefault();
});

output.addEventListener('click', event => {
	const taskElement = event.target.closest('.task-btns');
	if (!taskElement) return;

	if (event.target.closest('.task-pinned')) {
		pinnedTask(event);
	} else if (event.target.closest('.task-edit')) {
		editTask(event);
	} else if (event.target.closest('.task-delete')) {
		deleteTask(event);
	} else if (event.target.closest('.task-done')) {
		doneTask(event);
	}
});

///! All functions
function sendTask(event) {
	event.preventDefault();

	const task = textareaForm.value.trim().replace(/\s+/g, ' ');
	if (!task) {
		return alert('The field must not be empty!');
	}

	if (isEditTask) {
		saveEditedTask(task);
		return;
	}

	const arrayTasksLS = getTasksLocalStorage();
	arrayTasksLS.push({
		id: generateUniqueId(),
		task: task,
		pinned: false,
		done: false,
		position: 1000,
	});

	setTasksLocalStorage(arrayTasksLS);
	updateListTasks();
	form.reset();
}

function pinnedTask(event) {
	const task = event.target.closest('.task');
	const id = Number(task.dataset.taskId); // Получаем идентификатор задачи

	const arrayTasksLS = getTasksLocalStorage();
	const index = arrayTasksLS.findIndex(task => task.id === id);

	if (index === -1) {
		return alert('Task not found!');
	}

	if (!arrayTasksLS[index].pinned && arrayTasksLS[index].done) {
		return alert("You can't pin a completed task!");
	}

	if (arrayTasksLS[index].pinned) {
		arrayTasksLS[index].pinned = false;
	} else {
		arrayTasksLS[index].pinned = true;
	}

	setTasksLocalStorage(arrayTasksLS);
	updateListTasks();
}

function editTask(event) {
	const task = event.target.closest('.task');
	const text = task.querySelector('.task-text');
	editId = parseInt(task.dataset.taskId, 10);

	textareaForm.value = text.textContent;
	isEditTask = true;
	buttonSendForm.textContent = 'Save';
	buttonCancel.classList.remove('none');
	form.scrollIntoView({ behavior: 'smooth' });
}

function deleteTask(event) {
	const task = event.target.closest('.task');
	const id = Number(task.dataset.taskId); // Получаем идентификатор задачи

	const arrayTasksLS = getTasksLocalStorage();
	const newTasks = arrayTasksLS.filter(task => task.id !== id); // Фильтруем задачи по идентификатору и возвращаем новый массив

	setTasksLocalStorage(newTasks);
	updateListTasks();
}

function doneTask(event) {
	const task = event.target.closest('.task');
	const id = Number(task.dataset.taskId); // Получаем идентификатор задачи

	const arrayTasksLS = getTasksLocalStorage();
	const index = arrayTasksLS.findIndex(task => task.id === id);

	if (index === -1) {
		return alert('Task not found!');
	}

	if (!arrayTasksLS[index].done && arrayTasksLS[index].pinned) {
		// Если задача не выполнена и закреплена, то мы убираем ее из закрепленных
		arrayTasksLS[index].pinned = false;
	}

	if (arrayTasksLS[index].done) {
		arrayTasksLS[index].done = false;
	} else {
		arrayTasksLS[index].done = true;
	}

	setTasksLocalStorage(arrayTasksLS);
	updateListTasks();
}

function saveEditedTask(task) {
	const arrayTasksLS = getTasksLocalStorage();
	const editedTaskIndex = arrayTasksLS.findIndex(task => task.id === editId);

	if (editedTaskIndex !== -1) {
		arrayTasksLS[editedTaskIndex].task = task;
		setTasksLocalStorage(arrayTasksLS);
		updateListTasks();
	} else {
		alert('Task not found!');
	}
	resetSendForm();
}

function resetSendForm() {
	editId = null;
	isEditTask = false;
	buttonSendForm.textContent = 'Add';
	buttonCancel.classList.add('none');
	form.reset();
}
