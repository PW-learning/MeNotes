// Samir's short selector function
let $id = id => document.getElementById(id)
    // Generate random ID
let randomID = () => Date.now().toString(36);
// set as many attributes as you want to a given html element;
function setAttributes(el, attrs) {
    for (let key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
};
// Toast support
function toastNotice(message, time = 5) {
    time *= 1000
    let toast = document.getElementById("toast");
    toast.innerHTML = message;
    toast.classList.add("show")
    setTimeout(function() {
        toast.classList.remove("show");
    }, time);
}

function toastDelete(message, time, restoreNote) {
    time *= 1000
    setTimeout(function() {
        toast.classList.remove("show");
    }, time);
    let toast = document.getElementById("toast");
    toast.innerHTML = message
    toast.classList.add("show", "delete-notice")
    let undoButton = document.createElement("button");
    undoButton.textContent = "Undo";
    toast.append(undoButton);
    undoButton.addEventListener("click", () => {
        let notes = restoreNote.currentStoredNotes;
        notes.splice(restoreNote.deletedNoteIndex, 0, restoreNote.deletedNote);
        localStorage.setItem("notes", JSON.stringify(notes));
        makeStoredNotesHTML();
        toast.classList.remove("show");
    })


}


// function pwToast(message = "", time = 5) {
//     time *= 1000;
//     let toast = document.getElementById("toast");
//     toast.innerHTML = message;
//     toast.className = "show";
//     setTimeout(function() { toast.className = toast.className.replace("show", ""); }, time);
// }
// Enable vibration support
navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;

function vibError() {
    if (navigator.vibrate) {
        window.navigator.vibrate([100, 50, 500])
    }
}

function vibOnce() {
    if (navigator.vibrate) {
        window.navigator.vibrate(500)
    }
}

function vibTwice() {
    if (navigator.vibrate) {
        window.navigator.vibrate([100, 50, 100])
    }
}

function vibrate(sec) {
    if (navigator.vibrate) {
        window.navigator.vibrate(sec)
    }
}
// Connection status
if (!navigator.onLine) {
    toastAlert("You are offline... check your internet connection", 5);
}
window.addEventListener("online", () => {
    toastAlert("You are back Online", 2);
})
window.addEventListener("offline", () => {
    toastAlert("You are working Offline", 5);
})