const modal_trigger = document.querySelector(".create-task-btn");
const modal = document.querySelector(".task__modal");
const modal_overlay = document.querySelector(".task__modal-overlay");
const form = document.querySelector(".form");
const task_input = form.querySelector("#title");
const task_submit_btn = form.querySelector("button");
// select the row where you will append thecreated task
const tasks_row = document.querySelector(".tasks__row");
modal_trigger.addEventListener("click", () => openModal());
modal_overlay.addEventListener("click", () => closeModal());

// we will be stroing the tasks we create in a tasks array so lets create it
// declare it with let keyword becuase we will be changing its value from time to time
let tasks = [];

let editing = false;
let editId = null;

function openModal() {
  modal.classList.add("visible");
  //   when we open modal we want the task input field to be infocus
  task_input.focus();
}

function closeModal() {
  modal.classList.remove("visible");
  reset();
}

form.addEventListener("submit", (e) => {
  // prevent the form from trying to submit data to a server which triggers page reload
  e.preventDefault();

  const title = task_input.value.trim();
  if (title) {
    createTask(title);
  }
  //   after creating the task we empty the task input field

  task_input.value = "";
});

function createTask(title) {
  // let's change the code alittle bit
  let task = {};
  if (editing) {
    const taskIndex = tasks.findIndex((t) => t.id === editId);
    // update task in the array
    tasks[taskIndex].title = title;
    // create the new task to be rendered
    // only change the title retain the id and the done status

    task = {
      title: title,
      id: tasks[taskIndex].id,
      done: tasks[taskIndex].done,
    };
    // update ls after editing

    updateLs(tasks);
  } else {
    task = {
      title: title,
      id: Date.now(),
      done: false,
    };
    //   push the newly created task to a tasks array
    tasks.push(task);
    // update ls when we create task
    updateLs(tasks);
  }
  renderTask(task);
}

function renderTask(task) {
  // create the task element
  const task_col = document.createElement("li");
  task_col.classList.add("task__col");
  //   we will use this later to delete or edit a task
  task_col.setAttribute("data-key", task.id);

  let task_class = "";
  //   if the task is done the class of the task elemnt will be "task completed" else the class will be just "task"
  task.done ? (task_class = "task completed") : (task_class = "task");
  //  let's use the template from html
  task_col.innerHTML = `
  <div class="${task_class}">
  <span class="mark-task-complete">
    <input type="checkbox" id="checkbox" />
    <label for="checkbox" class="check">
      <i class="fas fa-check"></i>
    </label>
  </span>

  <div class="task__info">
    <h2 class="task__title">${task.title}</h2>
    <div class="task__actions">
      <button class="btn delete__btn">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn edit__btn">
        <i class="fas fa-edit"></i>
      </button>
    </div>
  </div>
</div>
  
  `;
  //   lets append the newly created task to the tasks__row
  // this is to avoid duplicate elemnts after editing
  const exisitng_task = tasks_row.querySelector(`li[data-key="${editId}"]`);
  if (editing) {
    tasks_row.replaceChild(task_col, exisitng_task);
    reset();
  } else {
    tasks_row.append(task_col);
  }

  //   after creating a task we close the modal
  closeModal();
}

/* lets add an event to the row 
depending on the button that is clicked we will be able to edit delete or mark 
complete
*/

tasks_row.addEventListener("click", (e) => {
  const delete_btn = e.target.closest(".delete__btn");
  const complete_btn = e.target.closest(".check");
  const edit_btn = e.target.closest(".edit__btn");

  if (delete_btn) {
    deleteTask(delete_btn);
  } else if (complete_btn) {
    completeTask(complete_btn);
  } else if (edit_btn) {
    editTask(edit_btn);
  } else {
    // return if user doesn't click in any of theses 3 btns
    return;
  }
});

function deleteTask(delete_btn) {
  // dom traversing
  const task_col =
    delete_btn.parentElement.parentElement.parentElement.parentElement;
  const id = task_col.dataset.key;
  //   we filter out the task whose id matches the one we are deleting
  //  i'm adding the + before the id to convert it into a number else is a string
  //   tasks array befor filtering
  console.log(tasks);
  tasks = tasks.filter((task) => task.id !== +id);
  // finally remove the elemtn from the dom

  task_col.remove();
  // tasks aray after filtering
  console.log(tasks);
  // update ls after deleting task

  updateLs(tasks);
}

function completeTask(check) {
  const task_col = check.parentElement.parentElement.parentElement;
  const id = task_col.dataset.key;
  let taskIndex = tasks.findIndex((task) => task.id === +id);

  //   change the task status in the tasks array

  tasks[taskIndex].done = !tasks[taskIndex].done;

  // if the task is done add a completted class to the element else remove it
  console.log(task_col.firstElementChild);
  if (tasks[taskIndex].done) {
    task_col.firstElementChild.classList.add("completed");
  } else {
    task_col.firstElementChild.classList.remove("completed");
  }

  updateLs(tasks);
}

function editTask(edit_btn) {
  // dom traversing
  const task_col =
    edit_btn.parentElement.parentElement.parentElement.parentElement;
  const id = task_col.dataset.key;
  // once we click the edit button we set editId to this id
  // we set editing to true

  editId = +id;
  editing = true;

  let task = tasks.find((task) => task.id === editId);

  task_input.value = task.title;
  task_submit_btn.textContent = ` Edit #${editId}`;
  // open modal

  openModal();
}

// after editing a task
/*

empty input field
set editing to fal;se
editId to null

button text context back to submiut


*/

function reset() {
  editId = null;
  editing = false;
  task_submit_btn.textContent = "Submit";
  task_input.value = "";
}

// let create a function to update localstorage everytime we add edit tasks

function updateLs(tasks) {
  // we need to convert the tasks obhect into a string first
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// when we first load this page or reload
/*
check if there are tasks in the localstorage
if there are render those tasks

*/

document.addEventListener("DOMContentLoaded", () => getTasksFromLs());

function getTasksFromLs() {
  // convert the string back to an object
  const ls_tasks = JSON.parse(localStorage.getItem("tasks"));
  if (ls_tasks) {
    // set the tasks array to these tasks
    tasks = ls_tasks;
    // loop through the tasks rendering a task element in the dom in each iteration
    tasks.forEach((task) => {
      renderTask(task);
    });
  }
}
