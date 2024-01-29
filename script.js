// Selecting the input, task list, reminder list, and completed list elements
let input = document.querySelector("input");
let list = document.querySelector("#todo-list");
const remList = document.querySelector("#rem-list");
const compList = document.querySelector("#comp-list");

// Array of icon classes for various actions
const arr = ["fa-check", "fa-pen", "fa-trash", "fa-bell"];

// Global set to keep track of tasks set for reminders
let tasksSetForReminders = new Set();

// Event listener when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Set focus on the input element if it exists
  if (input) {
    input.focus();
  }
  togglePDFButton();
});

// Event listener for adding task when the Enter key is pressed while the focus is on input
input.addEventListener("keydown", (evt) => {
  if (evt.key == "Enter") {
    addTask();
  }
});

// Function to toggle the visibility of the PDF button
function togglePDFButton() {
  let pdfBtnContainer = document.querySelector(".pdf-button");
  let list = document.getElementById("todo-list");

  if (list.children.length > 1) {
    pdfBtnContainer.style.display = "block";
  } else {
    pdfBtnContainer.style.display = "none";
  }
}

// Function to find an element by its text content
function findElementByText(parent, text) {
  const elements = parent.querySelectorAll('li');
  for (const element of elements) {
    if (element.innerText.includes(text)) {
      return element;
    }
  }
  return null;
}

// Function to add a new task to the to-do list
function addTask() {
  // Check if the input value is empty or contains only whitespace
  if (input.value === "" || input.value.trim() === "") {
    alert("You must write something");
    return;
  }

  // Check if the task with the same content already exists
  const existingTask = Array.from(list.children).find((task) => {
    const liElement = task.querySelector("li");
    return liElement && liElement.innerText.trim() === input.value.trim();
  });

  if (existingTask) {
    alert("Task with the same content already exists");
    return;
  }

  // Check if the input is not a number
  if (isNaN(input.value)) {
    // Create a new div to hold the task details
    let newDiv = document.createElement("div");
    newDiv.classList.add("list-div");

    // Create a new list element and append it to the div
    let li = document.createElement("li");
    li.innerHTML = input.value;
    newDiv.append(li);

    // Create a child div to hold icons for various actions
    let childDiv = document.createElement("div");
    childDiv.classList.add("list-child-div");

    // Iterate over icon classes and create corresponding icons
    for (let i = 0; i < arr.length; i++) {
      let icon = document.createElement("i");
      icon.classList.add("fa-solid", arr[i]);
      childDiv.append(icon);

      // Add event listeners for edit, delete, and reminder actions
      if (arr[i] === "fa-pen") {
        icon.addEventListener("click", () => editTask(newDiv));
      } else if (arr[i] === "fa-trash") {
        icon.addEventListener("click", () => delTask(newDiv));
      } else if (arr[i] === "fa-bell") {
        icon.addEventListener("click", () => setReminder(newDiv));
      } else {
        icon.addEventListener("click", () => checked(newDiv));
      }
    }

    // Append child div to the main div and add it to the task list
    newDiv.append(childDiv);
    list.append(newDiv);
  } else {
    alert("Input must not be a number");
  }

  // Show or hide paragraph tag based on the content of the task list
  let cont = document.querySelector("#todo-list");
  showParaTag(cont);
  input.value = "";

  togglePDFButton();
}

// Function to edit a task
function editTask(parentDiv) {
  // Prompt the user to enter the edited task
  const edited = prompt("Enter the edited task");

  // Update the task if input is not null and not empty after trimming
  if (edited !== null && edited.trim() !== "") {
    let reminderTask = findElementByText(remList, parentDiv.querySelector("li").innerText);

    parentDiv.querySelector("li").innerText = edited;

    if (reminderTask) {
      reminderTask.innerText = edited;
    }
  } else {
    alert("You must write something");
  }
}

// Function to delete a task
function delTask(parentDiv) {
  const taskText = parentDiv.querySelector("li").innerText;

  // Remove the parent div, representing the task
  parentDiv.remove();

  // Find the corresponding task in the reminder list
  const reminderTask = findElementByText(remList, taskText);

  // Remove the task from the reminder list if found
  if (reminderTask) {
    reminderTask.remove();
    tasksSetForReminders.delete(taskText);
  }

  // Show or hide paragraph tag based on the content of each task list
  let cont = document.querySelectorAll("ul");
  for (let i = 0; i < cont.length; i++) {
    showParaTag(cont[i]);
  }

  togglePDFButton();
}

// Function to show notifications
function showNotification(message) {
  // Check if the browser supports the Notifications API
  if ("Notification" in window) {
    // Request permission if not granted
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          // If permission is granted, show the notification
          new Notification("Task Reminder", { body: message });
        }
      });
    } else {
      // If permission is already granted, show the notification
      new Notification("Task Reminder", { body: message });
    }
  }
}

// Function to validate the entered date and time
function isValidDateTime(dateTimeString) {
  const regex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]) (20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
  const inputDate = new Date(dateTimeString);

  if (!regex.test(dateTimeString) || isNaN(inputDate) || inputDate < new Date()) {
    alert("Invalid date and time or past date. Please use the format (YYYY-MM-DD HH:mm:ss) and ensure it's not in the past.");
    return false;
  }

  return true;
}

// Function to set a reminder for the task
function setReminder(parentDiv) {
  // Get the task message
  const msg = parentDiv.querySelector("li").innerText;

  // Check if the task has already been set for a reminder
  if (tasksSetForReminders.has(msg)) {
    alert("Reminder already set for this task.");
    return;
  }

  // Clone the parent div to preserve the original state
  const parentDivCopy = parentDiv.querySelector('li').cloneNode(true);

  // Prompt the user to enter the date and time for the reminder
  let timeVal = prompt(
    "Enter the Date and Time to set a reminder for the task 'format: (YYYY-MM-DD HH:mm:ss)'"
  );

  // Validate the entered date and time
  if (timeVal === "" || timeVal.trim() === "") {
    alert(
      "You must enter the Date and Time to set a reminder for the task 'format: (YYYY-MM-DD HH:mm:ss)'"
    );
    return;
  }

  if (!isValidDateTime(timeVal)) {
    return;
  }

  // Calculate the time difference for the reminder
  const time = new Date(timeVal).getTime();
  const currTime = new Date().getTime();
  const timeDiff = time - currTime;

  // Set a timeout for the reminder
  setTimeout(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
      alert(`Time to do your task: "${msg}"`);

      // Remove the copy as soon as the notification is sent
      parentDivCopy.remove();

      // Show or hide paragraph tag based on the content of the reminder list
      showParaTag(remList);
    } else {
      // Show a notification for the reminder
      showNotification(`Time to do your task: "${msg}"`);

      // Remove the copy as soon as the notification is sent
      parentDivCopy.remove();

      // Show or hide paragraph tag based on the content of the reminder list
      showParaTag(remList);
    }

    // Remove the task from the set after the reminder is triggered
    tasksSetForReminders.delete(msg);
  }, timeDiff);

  // Add the cloned div to the reminder list and hide the original div
  const [datePart, timePart] = timeVal.split(' ');

  let timeEl = document.createElement("p");
  timeEl.classList.add('reminder-time');
  timeEl.innerText = `[Date is ${datePart} & Time is ${timePart}]`;
  parentDivCopy.append(timeEl);
  remList.append(parentDivCopy);

  // Add the task to the set of tasks set for reminders
  tasksSetForReminders.add(msg);

  // Show or hide paragraph tag based on the content of the reminder list
  showParaTag(remList);
}

// Function to move a completed task to the completed list
function checked(parentDiv) {
  // Array of icon classes to remove from the completed task
  const arr1 = ["fa-check", "fa-pen", "fa-bell"];

  // Remove specified icons from the completed task
  for (i = 0; i < 3; i++) {
    let iconToRemove = parentDiv.querySelector("." + arr1[i]);
    if (iconToRemove) {
      iconToRemove.remove();
    }
  }
  const taskText = parentDiv.querySelector("li").innerText;

  // Get the completed list and append the completed task
  compList.append(parentDiv);

  const reminderTask = findElementByText(remList, taskText);
  if (reminderTask) {
    reminderTask.remove();
    showParaTag(remList);
    showParaTag(list);
  }

  // Show or hide paragraph tag based on the content of the completed list
  showParaTag(compList);

  togglePDFButton();
}

// Function to show or hide paragraph tag based on the content of a task list
function showParaTag(ul) {
  // Get the paragraph tag within the task list
  let p = ul.querySelector("p");

  // Show or hide the paragraph tag based on the number of tasks in the list
  if (ul.children.length > 1) {
    p.style.display = "none";
  } else {
    p.style.display = "block";
  }
}

// Event listener for the download PDF button
document.getElementById("download-pdf").addEventListener("click", () => {
  // Clone the todo list element to exclude icons
  const clonedTodoList = document.getElementById("todo-list").cloneNode(true);

  // Remove icons from the cloned todo list
  const iconsToRemove = clonedTodoList.querySelectorAll(".fa-solid");
  iconsToRemove.forEach((icon) => icon.remove());

  // Create an HTML element to hold the cloned todo list (without icons)
  const element = document.createElement("div");
  element.appendChild(clonedTodoList);

  // Generate the PDF with the modified element
  html2pdf(element, {
    // Set the name of the PDF file
    filename: "To-Do-List.pdf",
    margin: 10,
  });
});
