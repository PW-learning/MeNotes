// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('https://menote.pehpe.com/pw-sw.js')
//     .then(function(reg){
//         console.log("Yes, PWWW SW is registered.");
//     }).catch(function(err) {
//         console.log("This happened:", err)
//     });
// }

// Catch Elements
const noteTextArea = $id("note-text-area");
const titleTextArea = $id("title-text-area");
const countSpanEl = $id("letters-count");
const addNewNoteButton = $id("add-button");

const showHideLabelsButton = $id("labels-button");
const labelsContainer = $id("labels-container");
const currentNoteLabels = $id("current-note-labels");
const addNewLabelButton = $id("add-new-label-button");
const labelsTextArea = $id("lables-text-area");
const labelsList = $id("labels-list");

const allNotesContainer = $id("all-notes-container");
const notesCount = $id("notes-count");
// note length values;
const min = 1;
const max = 3000;

// if a new user/new machine, set this basic data;
if (!localStorage.getItem("settings")) {
    localStorage.setItem("settings", JSON.stringify({ theme: "light", font: "rubik" }));
    localStorage.setItem("notes", JSON.stringify([]));
    localStorage.setItem("labels", JSON.stringify([]));
}

/*  ===============
    working with labels;
=============== */

// show and hide the labels list by using 'Labels...' button, change the text on that button also to signal to the user its functionality;
showHideLabelsButton.addEventListener("click", () => {
    labelsContainer.classList.toggle("show-labels-container")
    if (showHideLabelsButton.textContent.startsWith("L")) {
        showHideLabelsButton.textContent = "Close"
    } else {
        showHideLabelsButton.textContent = "Labels..."
    }
})

// make the labels list that shows up upon clicking on 'labels...' button, keep it in sync with the local storage saved labels, make the html needed for the labels in this list
function makeLabelsInLabelsList(array) {
    labelsList.innerHTML = "";
    array.forEach(label => {
        let labelContainer = document.createElement("li");
        let newLabel = document.createElement("span");
        newLabel.id = label;
        newLabel.classList.add("label-container");
        let removeLabel = document.createElement("span")
        removeLabel.classList.add("remove-label-button")
        removeLabel.textContent = "x";
        newLabel.textContent = label;

        labelContainer.append(newLabel);
        labelContainer.append(removeLabel);
        labelsList.append(labelContainer);

        removeLabel.id = removeLabel.previousSibling.textContent;
        removeALabel(removeLabel, array, "permanent");

    });

}

// a function to remove a label and it can remove in permanent, temporarily, and soft ways. the removal will be permanent only if you remove a label from the list of the available/stored labels. the removal will be soft meaning it will be only removed from that note itself and not from the list of stored user-made labels. the removal will be temporarily meaning the removal will be from the note being written right now, a visual removal/html element removal only;
function removeALabel(el, allLabels, removeType) {
    el.addEventListener("click", () => {
        el.parentElement.remove();
        if (removeType === "permanent") {
            let labelToRemove = allLabels.findIndex((labelID) => labelID === el.id);
            allLabels.splice(labelToRemove, 1);
            localStorage.setItem("labels", JSON.stringify(allLabels))
        } else if (removeType === "soft") {
            // get the id of this note, without anything else;
            let thisNoteID = el.id.slice(0, 8);

            let allNotes = JSON.parse(localStorage.getItem("notes"));
            // find the right note based on its id from the stored notes;
            let thisNote = allNotes.find(note => {
                return note.id === thisNoteID;
            });

            // get the label that has been clicked and find its index in its stored array so we can remove it;
            let thisNoteLabel = el.previousElementSibling.textContent
            let thisNoteLabelIndex = thisNote.labels.findIndex(label => {
                return label === thisNoteLabel;
            })
            thisNote.labels.splice(thisNoteLabelIndex, 1);
            // update the stored notes;
            allNotes.forEach(note => {
                if (note.id === thisNote.id) {
                    let oldObjIndx = allNotes.findIndex(oldObj => oldObj.id === note.id);
                    allNotes.splice(oldObjIndx, 1, thisNote);
                }
            });
            localStorage.setItem("notes", JSON.stringify(allNotes));
        }
    })
}
// make a new label and store it both visually and in the local storage, validate the label's name to not add an empty name label, make the html needed for the label and add it to the list of all labels, validate whether the label is already in the list of html labels;
addNewLabelButton.addEventListener("click", () => {
    let label = labelsTextArea.value;
    // label is empty or its just spaces
    if (label === "" || label.replace(/\s/g, "").length === 0) return
    let doesLabelExist = storedLabels.some((existingLabel) => {
            return existingLabel === label
        })
        // label doesn't already exist, store it to the local storage and make the html needed for it to display it visually;
    if (!doesLabelExist) {
        labelsTextArea.value = "";
        let storedLabels = JSON.parse(localStorage.getItem("labels"));
        storedLabels.unshift(label);
        localStorage.setItem("labels", JSON.stringify(storedLabels))
        makeLabelsInLabelsList(storedLabels);
        addLabelsToNote();
    } else {
        // label already exist, alret the user;
        addNewLabelButton.classList.add("add-new-label-button--warn")
        setTimeout(() => {
            addNewLabelButton.classList.remove("add-new-label-button--warn")
        }, 500);
    }

});

// trying to add a label with an empty name or name made up of empty spaces, alret the user;
labelsTextArea.addEventListener("input", () => {
    let label = labelsTextArea.value
    if (label === "" || label.replace(/\s/g, "").length === 0) {
        addNewLabelButton.classList.add("add-new-label-button--dormant")
    } else {
        addNewLabelButton.classList.remove("add-new-label-button--dormant")
    }
})

let storedLabels = JSON.parse(localStorage.getItem("labels"));
makeLabelsInLabelsList(storedLabels);

/* ====================
    validate labels, check whether a label already exist before adding it, make labels' HTML
===================== */

// add a label from the user saved labels to the current note;
function addLabelsToNote() {
    // get all available and stored labels;
    let savedLabelsElements = Array.from(labelsList.children);
    savedLabelsElements.forEach(labelFromTheList => {
        // child of 0 index is the label, which has its name, id, and all the information we need;
        labelFromTheList.children[0].addEventListener("click", () => {
            // check whether this tag has already been added to the current note or not, by comparing if an html element with the same id already exist in the labels div;
            let isLabelAlreadyAdded = Array.from(currentNoteLabels.children).some(alreadyExistingLabel => {

                    return alreadyExistingLabel.children[0].id === labelFromTheList.children[0].id
                })
                // if the label doesn't exist already, add it;
            if (!isLabelAlreadyAdded) {
                makeLabelHTMLOnNotes(labelFromTheList.textContent, currentNoteLabels, "temporarily");
            }
        })

    })
}

// removeType determines whether to remove the label completely or just temporarily  from the currently being written note;
function makeLabelHTMLOnNotes(labelText, whereToAppend, removeType, noteID) {
    let currentStoredLabels = JSON.parse(localStorage.getItem("labels"));

    let labelContainer = document.createElement("li");
    labelContainer.classList.add("label-span");
    let newLabel = document.createElement("span");
    newLabel.textContent = labelText.slice(0, -1);
    newLabel.id = labelText.slice(0, -1);

    let removeThisLabel = document.createElement("span");
    removeThisLabel.textContent = "X"
    if (noteID) removeThisLabel.id = `${noteID}-remove`

    labelContainer.append(newLabel);
    labelContainer.append(removeThisLabel);

    whereToAppend.append(labelContainer);
    removeThisLabel.addEventListener("click", () => {
        removeALabel(removeThisLabel, currentStoredLabels, removeType)
    })
}

addLabelsToNote();

/* ========================
    letters count feature
===========================*/

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

/* ===============
    listens to the event of adding a new note, make the new note html, store this new note in the local storage
=============== */

// Insert a new note to the local storage
addNewNoteButton.addEventListener("click", () => {
    // check the note's length before doing anything and alret the user if it's too short or too long;
    if (noteTextArea.value.length >= min && noteTextArea.value.length <= max) {
        storeNewNote();
        makeStoredNotesHTML();
        let pwToast = new Toast("Note Added!", 3);
        pwToast.toastAlert();
        noteTextArea.value = "";
        titleTextArea.value = "";

    } else {
        let pwToast = new Toast('Note should at least be between 5 and 280 letters', 5)
        pwToast.toastAlert();
        vibError()
    }
});

// make the needed html for each note from the local storage to display them;
function makeStoredNotesHTML() {
    allNotesContainer.innerHTML = "";
    // get all stored and saved notes and make them js objects;
    let currentNotes = JSON.parse(localStorage.getItem("notes"));
    currentNotes.forEach(note => {
        let container = document.createElement("div");
        container.classList.add("text-area-container");
        // 
        let noteUpperSection = document.createElement("div");
        noteUpperSection.classList.add("text-areas");
        let titleTextArea = document.createElement("textarea");
        setAttributes(titleTextArea, {
            name: "title",
            id: `${note.id}-title`,
            class: "generic-text-area title-text-area",
            minLength: "",
            maxLength: "32",
            autocomlpete: "off",
            autocorrect: "off",
            autocapitalize: "none",
            spellcheck: "false",
            readonly: "true",
        })
        titleTextArea.textContent = note.title
        noteUpperSection.append(titleTextArea);
        container.append(noteUpperSection);
        // 
        let noteLowerSection = document.createElement("div");
        let noteTextArea = document.createElement("textarea");
        setAttributes(noteTextArea, {
            name: "note",
            id: `${note.id}-note`,
            class: "generic-text-area note-text-area",
            autocomlpete: "off",
            autocorrect: "off",
            autocapitalize: "none",
            spellcheck: "false",
            readonly: "true"
        });
        noteTextArea.textContent = note.value
        noteLowerSection.append(noteTextArea);
        container.append(noteLowerSection);
        // 
        let currentNotesLabelsContainer = document.createElement("div");
        currentNotesLabelsContainer.classList.add("current-note-labels");
        note.labels.forEach(label => {
            makeLabelHTMLOnNotes(label + "x", currentNotesLabelsContainer, "soft", note.id);
        })
        container.append(currentNotesLabelsContainer);
        // 
        let callToActionsButtonsContainer = document.createElement("div");
        callToActionsButtonsContainer.classList.add("note-cta-buttons")

        let deleteNoteButton = document.createElement("button");
        deleteNoteButton.textContent = "Delete";
        deleteNoteButton.id = note.id;
        deleteNoteButton.addEventListener("click", deleteNote(deleteNoteButton))
        callToActionsButtonsContainer.append(deleteNoteButton);
        container.append(callToActionsButtonsContainer);
        allNotesContainer.append(container);
    })
}
// Show all notes
makeStoredNotesHTML();

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
// Delete a note button;
function deleteNote() {
    return function(button) {
        let noteToDeleteId = button.target.id;
        let currentStoredNotes = JSON.parse(localStorage.getItem("notes"))
        let noteToDeleteIndex = currentStoredNotes.findIndex(note => note.id === noteToDeleteId);
        currentStoredNotes.splice(noteToDeleteIndex, 1);
        localStorage.setItem("notes", JSON.stringify(currentStoredNotes));
        makeStoredNotesHTML();
        // allow the user to undo;
        let toast = new Toast("", 1);
        toast.toastUndoDelete(noteToDeleteId);
    }
}

// let deleteButtons = document.querySelectorAll(".delete-button")
// deleteButtons.forEach((button, key) => {
//         button.addEventListener("click", () => {
//             if (confirm("Are you sure ? This note will go for good")) {
//                 localStorage.removeItem(localStorage.key(key))
//                 vibOnce()
//                 location.reload()
//             } else {
//                 pwToast("Nothing was deleted")
//             }
//         })
//     });
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

// store a new note to the local storage, with whatever information we want to store;
function storeNewNote() {
    let currentNotes = JSON.parse(localStorage.getItem("notes"));
    let date = new Date();
    let newNote = {};
    newNote.id = randomID()
    newNote.value = noteTextArea.value;
    newNote.title = titleTextArea.value;
    newNote.date = date.toLocaleString();
    newNote.labels = [];
    Array.from(currentNoteLabels.children).forEach(label => newNote.labels.push(label.firstElementChild.id))
    currentNotes.unshift(newNote)
    localStorage.setItem("notes", JSON.stringify(currentNotes));
}