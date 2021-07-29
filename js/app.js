// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('https://menote.pehpe.com/pw-sw.js')
//     .then(function(reg){
//         console.log("Yes, PWWW SW is registered.");
//     }).catch(function(err) {
//         console.log("This happened:", err)
//     });
// }

// Catch Elements
const noteTextArea = $id("note-text-area")
const countSpanEl = $id("letters-count")
const addNewNoteButton = $id("add-button")

const showHideLabelsButton = $id("labels-button");
const labelsContainer = $id("labels-container");
const addNewLabelButton = $id("add-new-label-button");
const labelsTextArea = $id("lables-text-area");
const labelsList = $id("labels-list")

const allNotesContainer = $id("all-notes-container")
const notesCount = $id("notes-count")
    // Fixed values
const min = 5;
const max = 280;

// create our data structure
// localStorage.clear();
// const notes = new Map();
// notes.set(rId(), {note: "some note"});
// notes.set(rId(), {note: "some other note"});

// if a new user/new machine, set this basic data;
if (!localStorage.getItem("settings")) {
    localStorage.setItem("settings", JSON.stringify({ theme: "light", font: "rubik" }));
    localStorage.setItem("notes", JSON.stringify([{obj: 1}]));
    localStorage.setItem("labels", JSON.stringify([]));
}

// working with labels;
function makeAndStoreLabels(array) {
    labelsList.innerHTML = "";
    array.forEach(label => {
        let newLabel = document.createElement("li");
        newLabel.id = label;
        newLabel.addEventListener("click", () => {
        })
        newLabel.classList.add("label-container");
        let removeLabel = document.createElement("span")
        removeLabel.classList.add("remove-label-button")
        removeLabel.textContent = "x";
        newLabel.textContent = label;
        newLabel.append(removeLabel);
        labelsList.append(newLabel);

        removeLabel.id = removeLabel.previousSibling.textContent
        removeLabel.addEventListener("click", () => {
            let labelToRemove = array.findIndex((labelName) => labelName === removeLabel.id);
            array.splice(labelToRemove, 1);
            removeLabel.parentElement.remove();
        })

    });
    
}

showHideLabelsButton.addEventListener("click", ()=>{
    labelsContainer.classList.toggle("show-labels-container")
    if (showHideLabelsButton.textContent.startsWith("L")) {
        showHideLabelsButton.textContent = "Close"
    } else {
        showHideLabelsButton.textContent = "Labels..."

    }
})
addNewLabelButton.addEventListener("click", () => {
    let label = labelsTextArea.value
    // label is empty or its just spaces
    if (label === "" || label.replace(/\s/g, "").length === 0) return
    let doesLabelExist = storedLabels.some((existingLabel) => {
        return existingLabel === label
    })
    if (!doesLabelExist) {
        labelsTextArea.value = "";
        let storedLabels = JSON.parse(localStorage.getItem("labels"));
        storedLabels.unshift(label);
        localStorage.setItem("labels", JSON.stringify(storedLabels))
        makeAndStoreLabels(storedLabels);
        addLabelsToNote();
    } else {
        addNewLabelButton.classList.add("add-new-label-button--warn")
        setTimeout(() => {
            addNewLabelButton.classList.remove("add-new-label-button--warn")
        }, 500);
    }
   
})

labelsTextArea.addEventListener("input", ()=>{
    let label = labelsTextArea.value
    if (label === "" || label.replace(/\s/g, "").length === 0) {
        addNewLabelButton.classList.add("add-new-label-button--dormant")
    } else {
        addNewLabelButton.classList.remove("add-new-label-button--dormant")
    }
})

let storedLabels = JSON.parse(localStorage.getItem("labels"));
makeAndStoreLabels(storedLabels);

// add a label from the user saved labels to the current note;
function addLabelsToNote() {
    let currentNoteLabelsContainer = $id("current-note-labels");
    console.log(currentNoteLabelsContainer);
    let availableLablesElements = Array.from(labelsList.children);
    availableLablesElements.forEach(labelElement => {
        labelElement.addEventListener("click", () => {
            let isLabelAlreadyAdded = Array.from(currentNoteLabelsContainer.children).some(alreadyExistingLabel => {
                return alreadyExistingLabel.id === labelElement.id
            })
            if (!isLabelAlreadyAdded) {
                let labelContainer = document.createElement("span");
                let removeThisLabel = document.createElement("span");
                removeThisLabel.textContent = "X"
                labelContainer.textContent = labelElement.textContent.slice(0, -1);
                labelContainer.id = labelElement.textContent.slice(0, -1);
                labelContainer.append(removeThisLabel);
                currentNoteLabelsContainer.append(labelContainer);
                removeThisLabel.addEventListener("click", () => {
                    labelContainer.remove();
                })
            }
        })

    })
}
addLabelsToNote();

// // Object { theme: "dark", font: "rubik" }
// let modifiedData = JSON.parse(localStorage.getItem("settings"));
// modifiedData.theme = "light";
// localStorage.setItem("settings", JSON.stringify(modifiedData));



// []
// let modifiedNotes = JSON.parse(localStorage.getItem("notes"));
// let incomingNote = { id: "abc123", date: "2021-07-26", note: "Hello, PW" }
// modifiedNotes.unshift(incomingNote);
// localStorage.setItem("notes", JSON.stringify(modifiedNotes))

// Check letters count in textarea
noteTextArea.addEventListener("input", () => {
        let remainingLetters = max - noteTextArea.value.length
        if (remainingLetters <= 0) {
            countSpanEl.textContent = remainingLetters
            countSpanEl.style.color = "#f00"
            vibrate([100, 50, 100])
        } else if (remainingLetters < 25) {
            countSpanEl.textContent = `Only ${remainingLetters} letters`
            countSpanEl.style.color = "#f70"
        } else {
            countSpanEl.textContent = `Only ${remainingLetters} letters`
            countSpanEl.style.color = "#000"
        }
    });
// Insert a new note to the local storage
addNewNoteButton.addEventListener("click", () => {
        if (noteTextArea.value.length >= min && noteTextArea.value.length <= max) {
            storeNewNote(noteTextArea.value);
            location.reload()
        } else {
            pwToast('Note should at least be between 5 and 180 letters', 5)
            vibError()
        }
    })
    // Show all notes
// notesCount.innerHTML = localStorage.length
// for (let i = 0; i < localStorage.length; i++) {
//     let newNote = document.createElement("div")
//     newNote.innerHTML = `
//         <div id="note-${i}" class="note-container">
//             <textarea class="new-note" readonly="true" dir="auto">${localStorage.getItem(localStorage.key(i))}</textarea>
//             <hr /><button class="delete-button">Delete</button>
//             <button id="pw-share-${i}" class="pw-share">Share</button>
//             <button id="pw-edit-${i}" class="pw-edit">Edit</button>
//             <button id="pw-save-${i}" class="pw-save">Save</button>
//         </div>
//     `
//     allNotesContainer.appendChild(newNote)
// }
// Delete note
let deleteButtons = document.querySelectorAll(".delete-button")
deleteButtons.forEach((button, key) => {
        button.addEventListener("click", () => {
            if (confirm("Are you sure ? This note will go for good")) {
                localStorage.removeItem(localStorage.key(key))
                vibOnce()
                location.reload()
            } else {
                pwToast("Nothing was deleted")
            }
        })
    })
    // Edit note
let editButtons = document.querySelectorAll(".pw-edit")
editButtons.forEach((button, key) => {
    button.addEventListener("click", () => {
        let noteBeingEdited = button.parentElement.firstElementChild
        noteBeingEdited.removeAttribute("readonly")
        button.style.display = "none"
        button.nextElementSibling.style.display = "inline-block"
    })
})

let saveButtons = document.querySelectorAll(".pw-save")
saveButtons.forEach((button, key) => {
    button.style.display = "none"
    button.addEventListener("click", () => {
        let newNoteValue = button.parentElement.firstElementChild.value;
        button.style.display = "none"
        localStorage.setItem(localStorage.key(key), newNoteValue)
        vibOnce()
        location.reload()
    })
})

// Share when you sure
let shareButtons = document.querySelectorAll(".pw-share")
shareButtons.forEach((button, key) => {
    button.addEventListener("click", () => {
        let msg = button.parentElement.firstElementChild.innerHTML
        if (navigator.share) {
            navigator.share({
                    title: 'MeNote',
                    text: msg,
                    url: 'https://menote.pehpe.com',
                })
                .then(() => console.log('Successful share'))
                .catch((error) => console.log('Error sharing', error));
        }
    })
})

// helper functions

function storeNewNote(note) {
    let currentNotes = JSON.parse(localStorage.getItem("notes"));
    let date = new Date();
    currentNotes.unshift(
        {
            id: randomID(),
            noteDate: date.toLocaleString(),
            noteContent: note,
            labels: null
        }
    )
    console.log(currentNotes);
}
