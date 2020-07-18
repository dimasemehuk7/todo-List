'use strict';

function DB() {
    const values = localStorage.getItem('values');
    if (!values) {
        localStorage.setItem("values", JSON.stringify([]));
    }
}

DB.prototype.save = function (task) {
    const tasks = JSON.parse(localStorage.getItem('values'));
    tasks.push(task);
    localStorage.setItem("values", JSON.stringify(tasks));
};

DB.prototype.remove = function (taskId) {
    const tasks = JSON.parse(localStorage.getItem('values'));
    tasks.splice(taskId, 1);
    localStorage.setItem("values", JSON.stringify(tasks));
};

DB.prototype.getAll = function () {
    return JSON.parse(localStorage.getItem('values'));
};

function View() {}

View.prototype.init = function (handlers) {
    document
        .getElementById("input-form")
        .addEventListener("submit", function (event) {
            event.preventDefault();
            const input = document.getElementById('add-item');
            handlers.addClickHandler(input.value);
            input.value = '';
        });
    document
        .getElementById('list')
        .addEventListener('click', function (event) {
            if (event.target.classList.contains('del-btn')) {
                handlers.delClickHandler(event.target.id);
            }
        });
};


View.prototype.resetInput = function () {
    document.getElementById('add-item').value = '';
};

View.prototype.onTasksChange = function (tasks) {
    const listElem = document.getElementById('list');
    listElem.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskElem = document.createElement('div');
        taskElem.innerHTML = task;
        taskElem.classList.add('task-elem');

        const delBtnElem = document.createElement('button');
        delBtnElem.innerHTML = 'Remove';
        delBtnElem.classList.add('del-btn');
        delBtnElem.id = index;

        const rowElement = document.createElement('li');
        rowElement.classList.add(`row`);
        rowElement.appendChild(taskElem);
        rowElement.appendChild(delBtnElem);

        listElem.appendChild(rowElement);
        return taskElem;
    });
};

function Model() {
    this.db;
    this.state = {
        tasks: []
    };
}

Model.prototype.init = function (taskChangeHandler) {
    this.db = new DB();
    this.taskChangeHandler = taskChangeHandler;
    this.state.tasks = this.db.getAll();
    this.taskChangeHandler(this.state.tasks);
};

Model.prototype.addTask = function (task) {
    this.db.save(task);
    this.state.tasks = this.db.getAll();
    this.taskChangeHandler(this.state.tasks);
};

Model.prototype.delTask = function (taskId) {
    this.db.remove(taskId);
    this.state.tasks = this.db.getAll();
    this.taskChangeHandler(this.state.tasks);
};

function Controller(view, model) {
    this.view = view;
    this.model = model;
}

Controller.prototype.init = function () {
    this.model.init(this.onTaskChange.bind(this));
    this.view.init({
        addClickHandler: this.onTaskAddClick.bind(this),
        delClickHandler: this.onTaskDelClick.bind(this)
    });
};

Controller.prototype.onTaskAddClick = function (task) {
    this.model.addTask(task);
    this.view.resetInput();
};

Controller.prototype.onTaskDelClick = function (taskId) {
    this.model.delTask(taskId);
};

Controller.prototype.onTaskChange = function (tasks) {
    this.view.onTasksChange(tasks);
};

const view = new View();
const model = new Model();
const controller = new Controller(view, model);
controller.init();

