if ("serviceWorker" in navigator) {
    navigator.serviceWorker
        .register("https://menote.pehpe.com/pw-sw.js")
        .then(function (reg) {
            console.log("Yes, PWWW SW is registered.");
        })
        .catch(function (err) {
            console.log("This happened:", err);
        });
}

// Catch Elements
const body = document.body;
const themeOptions = document.querySelector(".themes-options");
const themeOptionsTogglers = Array.from(themeOptions.children);

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
    localStorage.setItem(
        "settings",
        JSON.stringify([{ theme: "light" }, { isUserLoggedIn: false }])
    );
    localStorage.setItem("notes", JSON.stringify([]));
    localStorage.setItem("labels", JSON.stringify([]));
}
body.className = JSON.parse(localStorage.getItem("settings"))[0].theme;
indicateWhichThemeIsActive();

/*  ===============
    working with labels;
=============== */

// show and hide the labels list by using 'Labels...' button, change the text on that button also to signal to the user its functionality;
showHideLabelsButton.addEventListener("click", () => {
    labelsContainer.classList.toggle("show-labels-container");
    if ((showHideLabelsButton.textContent = "Labels...")) {
        showHideLabelsButton.textContent = "Close";
    } else {
        showHideLabelsButton.textContent = "Labels...";
        labelsTextArea.value = "";
    }
});

// make the labels list that shows up upon clicking on 'labels...' button, keep it in sync with the local storage saved labels, make the html needed for the labels in this list
function makeLabelsInLabelsList(array) {
    labelsList.innerHTML = "";
    array.forEach((label) => {
        let labelContainer = document.createElement("li");
        let newLabel = document.createElement("span");
        newLabel.id = label;
        newLabel.classList.add("label-container");
        let removeLabel = document.createElement("span");
        removeLabel.classList.add("remove-label-button");
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
            let labelToRemove = allLabels.findIndex(
                (labelID) => labelID === el.id
            );
            allLabels.splice(labelToRemove, 1);
            localStorage.setItem("labels", JSON.stringify(allLabels));
        } else if (removeType === "soft") {
            // get the id of this note, without anything else;
            let thisNoteID = el.id.slice(0, 8);

            let allNotes = JSON.parse(localStorage.getItem("notes"));
            // find the right note based on its id from the stored notes;
            let thisNote = allNotes.find((note) => {
                return note.id === thisNoteID;
            });

            // get the label that has been clicked and find its index in its stored array so we can remove it;
            let thisNoteLabel = el.previousElementSibling.textContent;
            let thisNoteLabelIndex = thisNote.labels.findIndex((label) => {
                return label === thisNoteLabel;
            });
            thisNote.labels.splice(thisNoteLabelIndex, 1);
            // update the stored notes;
            allNotes.forEach((note) => {
                if (note.id === thisNote.id) {
                    let oldObjIndx = allNotes.findIndex(
                        (oldObj) => oldObj.id === note.id
                    );
                    allNotes.splice(oldObjIndx, 1, thisNote);
                }
            });
            localStorage.setItem("notes", JSON.stringify(allNotes));
        }
    });
}
// make a new label and store it both visually and in the local storage, validate the label's name to not add an empty name label, make the html needed for the label and add it to the list of all labels, validate whether the label is already in the list of html labels;
addNewLabelButton.addEventListener("click", () => {
    let label = labelsTextArea.value;
    // label is empty or its just spaces
    if (label === "" || label.replace(/\s/g, "").length === 0) return;
    let doesLabelExist = storedLabels.some((existingLabel) => {
        return existingLabel === label;
    });
    // label doesn't already exist, store it to the local storage and make the html needed for it to display it visually;
    if (!doesLabelExist) {
        labelsTextArea.value = "";
        let storedLabels = JSON.parse(localStorage.getItem("labels"));
        storedLabels.unshift(label);
        localStorage.setItem("labels", JSON.stringify(storedLabels));
        makeLabelsInLabelsList(storedLabels);
        addLabelsToNote();
    } else {
        // label already exist, alret the user;
        addNewLabelButton.classList.add("add-new-label-button--warn");
        setTimeout(() => {
            addNewLabelButton.classList.remove("add-new-label-button--warn");
        }, 500);
    }
});

// trying to add a label with an empty name or name made up of empty spaces, alret the user;
labelsTextArea.addEventListener("input", () => {
    let label = labelsTextArea.value;
    if (label === "" || label.replace(/\s/g, "").length === 0) {
        addNewLabelButton.classList.add("add-new-label-button--dormant");
    } else {
        addNewLabelButton.classList.remove("add-new-label-button--dormant");
    }
});

let storedLabels = JSON.parse(localStorage.getItem("labels"));
makeLabelsInLabelsList(storedLabels);

/* ====================
    validate labels, check whether a label already exist before adding it, make labels' HTML
===================== */

// add a label from the user saved labels to the current note;
function addLabelsToNote() {
    // get all available and stored labels;
    let savedLabelsElements = Array.from(labelsList.children);
    savedLabelsElements.forEach((labelFromTheList) => {
        // child of 0 index is the label, which has its name, id, and all the information we need;
        labelFromTheList.children[0].addEventListener("click", () => {
            // check whether this tag has already been added to the current note or not, by comparing if an html element with the same id already exist in the labels div;
            let isLabelAlreadyAdded = Array.from(
                currentNoteLabels.children
            ).some((alreadyExistingLabel) => {
                return (
                    alreadyExistingLabel.children[0].id ===
                    labelFromTheList.children[0].id
                );
            });
            // if the label doesn't exist already, add it;
            if (!isLabelAlreadyAdded) {
                makeLabelHTMLOnNotes(
                    labelFromTheList.textContent,
                    currentNoteLabels,
                    "temporarily"
                );
            }
        });
    });
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
    removeThisLabel.textContent = "X";
    if (noteID) removeThisLabel.id = `${noteID}-remove`;

    labelContainer.append(newLabel);
    labelContainer.append(removeThisLabel);

    whereToAppend.append(labelContainer);
    removeThisLabel.addEventListener("click", () => {
        removeALabel(removeThisLabel, currentStoredLabels, removeType);
    });
}

addLabelsToNote();

/* ========================
    letters count feature
===========================*/

// upadte characters count live in textareas
function charactersCount(el, showCount) {
    el.addEventListener("input", () => {
        let charactersCount = el.value.length;
        showCount.innerHTML = charactersCount + " Character(s)";
    });
}

charactersCount(noteTextArea, countSpanEl);
/* ===============
        listens to the event of adding a new note, make the new note html, store this new note in the local storage
    =============== */

// Insert a new note to the local storage
addNewNoteButton.addEventListener("click", () => {
    // check the note's length before doing anything and alret the user if it's too short or too long;
    if (noteTextArea.value.length >= min && noteTextArea.value.length <= max) {
        storeNewNote();
        makeStoredNotesHTML();
        toastNotice("Note Added!", 3);
        titleTextArea.value = "";
        noteTextArea.value = "";
        noteTextArea.value.length = 0;
        countSpanEl.textContent = "0 Character(s)";
    } else {
        toastNotice("Notes can't be empty", 5);
        vibError();
    }
});

// make note date;

function makeNoteDateHTML(note) {
    let noteDateContainer = document.createElement("div");

    function makeNoteDate(note, noteDate) {
        noteDate = noteDate || note.date;
        let containerElement = document.createElement("div");
        let yearMonthDayPara = document.createElement("p");
        let hourOfTheDayPara = document.createElement("p");

        let yearMonthDay = noteDate.slice(0, 15);
        let hourOfTheDay = noteDate.slice(16, 21);
        let periodOfTheDay;
        hourOfTheDayPara.textContent = `${hourOfTheDay} ${
            hourOfTheDay.slice(0, 2) > 12
                ? (periodOfTheDay = "PM")
                : (periodOfTheDay = "AM")
        }`;
        yearMonthDayPara.textContent = yearMonthDay;

        containerElement.append(hourOfTheDayPara);
        containerElement.append(yearMonthDayPara);
        return containerElement;
    }
    if (note.isEdited) {
        let isEditedPara = document.createElement("p");
        isEditedPara.textContent = `Last Edited at:`;
        let dateNow = new Date().toString();
        noteDateContainer.append(makeNoteDate(note, dateNow));

        noteDateContainer.append(isEditedPara);
    } else {
        noteDateContainer.append(makeNoteDate(note));
    }
    return noteDateContainer;
}

// make the needed html for each note from the local storage to display them;
function makeStoredNotesHTML() {
    allNotesContainer.innerHTML = "";
    // get all stored and saved notes and make them js objects;
    let currentNotes = JSON.parse(localStorage.getItem("notes"));
    currentNotes.forEach((note) => {
        let container = document.createElement("div");
        container.classList.add("note-wrapper");
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
            dir: "auto",
        });
        if (note.title) {
            titleTextArea.textContent = note.title;
        } else {
            titleTextArea.placeholder = "Untitled note:";
        }
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
            readonly: "true",
            dir: "auto",
        });
        noteTextArea.textContent = note.value;
        noteLowerSection.append(noteTextArea);
        container.append(noteLowerSection);
        //
        let currentNotesLabelsContainer = document.createElement("div");
        currentNotesLabelsContainer.classList.add("current-note-labels");
        note.labels.forEach((label) => {
            makeLabelHTMLOnNotes(
                label + "x",
                currentNotesLabelsContainer,
                "soft",
                note.id
            );
        });
        container.append(currentNotesLabelsContainer);
        //
        let noteInformationContainer = document.createElement("div");
        noteInformationContainer.classList.add("note-info");

        let noteCharactersLengthContainer = document.createElement("div");
        let noteCharactersCountPara = document.createElement("p");
        noteCharactersCountPara.textContent = `${note.charCount} Character(s)`;
        noteCharactersLengthContainer.append(noteCharactersCountPara);

        noteInformationContainer.append(makeNoteDateHTML(note));
        noteInformationContainer.append(noteCharactersLengthContainer);

        container.append(noteInformationContainer);
        //
        let callToActionsButtonsContainer = document.createElement("div");
        callToActionsButtonsContainer.classList.add("note-cta-buttons");

        let deleteNoteButton = document.createElement("button");
        deleteNoteButton.textContent = "Delete";
        deleteNoteButton.id = `${note.id}-delete`;
        deleteNoteButton.addEventListener(
            "click",
            deleteNote(deleteNoteButton)
        );

        let editNoteButton = document.createElement("button");
        editNoteButton.textContent = "Edit";
        editNoteButton.id = `${note.id}-edit`;

        let saveEditedNoteButton = document.createElement("button");
        saveEditedNoteButton.textContent = "Save";
        saveEditedNoteButton.id = `${note.id}-save`;
        saveEditedNoteButton.classList.add("hide-button");

        editNoteButton.addEventListener(
            "click",
            editNote(
                editNoteButton,
                noteTextArea,
                noteCharactersCountPara,
                saveEditedNoteButton,
                note
            )
        );

        saveEditedNoteButton.addEventListener(
            "click",
            saveNoteAfterEdit(
                saveEditedNoteButton,
                noteTextArea,
                titleTextArea,
                noteCharactersCountPara
            )
        );

        let shareButton = document.createElement("button");
        shareButton.textContent = "Share";
        shareButton.id = `${note.id}-share`;
        shareButton.addEventListener("click", shareANote(note));
        callToActionsButtonsContainer.append(deleteNoteButton);
        callToActionsButtonsContainer.append(editNoteButton);
        callToActionsButtonsContainer.append(saveEditedNoteButton);
        callToActionsButtonsContainer.append(shareButton);

        container.append(callToActionsButtonsContainer);
        allNotesContainer.append(container);
    });
}
// Show all notes
makeStoredNotesHTML();

/* ===============
    call to action functions 
=============== */

// Delete a note function;
function deleteNote() {
    return function (button) {
        let currentStoredNotes = JSON.parse(localStorage.getItem("notes"));
        let noteToDeleteId = button.target.id.slice(0, 8);
        let noteToDeleteIndex = currentStoredNotes.findIndex(
            (note) => note.id === noteToDeleteId
        );
        // allow the user to undo;
        toastDelete("Note Deleted", 7, {
            deletedNote: currentStoredNotes[noteToDeleteIndex],
            deletedNoteIndex: noteToDeleteIndex,
            currentStoredNotes: currentStoredNotes,
        });
        currentStoredNotes.splice(noteToDeleteIndex, 1);
        localStorage.setItem("notes", JSON.stringify(currentStoredNotes));
        makeStoredNotesHTML();
    };
}

// Edit a note function;
function editNote(...theArgs) {
    return function () {
        let targetButton = theArgs[0];
        let targetTextArea = theArgs[1];
        let charactersCountParagraph = theArgs[2];
        let saveButtonToBeShown = theArgs[3];
        let storedNoteBeforeEditing = theArgs[4];
        let currentContainer = targetButton.offsetParent;
        let currentNoteTitle = currentContainer.children[0].children[0];
        let currentNoteBody = currentContainer.children[1].children[0];

        currentNoteTitle.classList.add("edit-note");
        currentNoteTitle.style.borderTopLeftRadius = "1rem";
        currentNoteBody.classList.add("edit-note");

        currentNoteTitle.removeAttribute("readonly");
        currentNoteBody.removeAttribute("readonly");
        currentNoteBody.focus();
        currentNoteBody.select();

        charactersCount(targetTextArea, charactersCountParagraph);
        targetButton.classList.toggle("hide-button");
        saveButtonToBeShown.classList.toggle("hide-button");
        toastNotice("Editing Mode", 3);
    };
}

function saveNoteAfterEdit(...theArgs) {
    return function () {
        let currentStoredNotes = JSON.parse(localStorage.getItem("notes"));
        let targetButton = theArgs[0];
        let newNoteValueFromTargetTextArea = theArgs[1];
        let newTitleValueFromTargetTextArea = theArgs[2];
        let noteCountPara = theArgs[3];
        let noteToBeEditedId = targetButton.id.slice(0, 8);
        currentStoredNotes.forEach((currentlyStoredNote) => {
            if (currentlyStoredNote.id === noteToBeEditedId) {
                // flag edited notes;
                if (
                    currentlyStoredNote.value !==
                        newNoteValueFromTargetTextArea.value ||
                    currentlyStoredNote.value !==
                        newTitleValueFromTargetTextArea
                ) {
                    currentlyStoredNote.isEdited = true;
                }
                currentlyStoredNote.value =
                    newNoteValueFromTargetTextArea.value;
                currentlyStoredNote.title =
                    newTitleValueFromTargetTextArea.value;
                currentlyStoredNote.charCount =
                    currentlyStoredNote.value.length;
                localStorage.setItem(
                    "notes",
                    JSON.stringify(currentStoredNotes)
                );
                makeStoredNotesHTML();
                toastNotice("Note Saved", 3);
            }
        });
    };
}

function shareANote(note) {
    return function () {
        let message = note.value;
        if (navigator.share) {
            navigator
                .share({
                    tite: message,
                    text: message,
                })
                .then(() => console.log("Successful share"))
                .catch((error) => console.log("Error sharing", error));
        }
    };
}

// store a new note to the local storage, with whatever information we want to store;
function storeNewNote() {
    let currentNotes = JSON.parse(localStorage.getItem("notes"));
    let newNote = {};
    newNote.id = randomID();
    newNote.value = noteTextArea.value;
    newNote.title = titleTextArea.value;
    newNote.date = new Date().toString();
    newNote.labels = [];
    newNote.charCount = noteTextArea.value.length;
    newNote.isEdited = false;
    Array.from(currentNoteLabels.children).forEach((label) =>
        newNote.labels.push(label.firstElementChild.id)
    );
    currentNoteLabels.innerHTML = "";
    currentNotes.unshift(newNote);
    localStorage.setItem("notes", JSON.stringify(currentNotes));
}

/* ===============
    the app settings 
=============== */

// the 'clear storage' options;
function toggleConfirmationPopups(disabler, el) {
    disabler.addEventListener("click", () => {
        el.classList.remove("clearing-confirmation-active");
    });
}

const clearNotesOption = document.querySelector("#clear-notes");
const clearNotesConfirmEl = document.querySelector("#clear-notes-confirm");
const clearNotesFalseButton = document.querySelector("#clear-notes-false");
const clearNotesTrueButton = document.querySelector("#clear-notes-true");

const clearLabelsOption = document.querySelector("#clear-labels");
const clearLabelsConfirmEl = document.querySelector("#clear-labels-confirm");
const clearLabelsFalseButton = document.querySelector("#clear-labels-false");
const clearLabelsTrueButton = document.querySelector("#clear-labels-true");

const resetAppOption = document.querySelector("#reset-app");
const resetAppConfirmEl = document.querySelector("#reset-app-confirm");
const resetAppFalseButton = document.querySelector("#reset-app-false");
const resetAppTrueButton = document.querySelector("#reset-app-true");

// visibility of deletion confirmation popups;
// clear all notes;
clearNotesTrueButton.addEventListener("click", () => {
    localStorage.setItem("notes", JSON.stringify([]));
    makeStoredNotesHTML();
    toastNotice("Notes Deleted", 5);
    clearNotesConfirmEl.classList.remove("clearing-confirmation-active");
    clearLabelsConfirmEl.classList.remove("clearing-confirmation-active");
});
clearNotesOption.addEventListener("click", () => {
    clearNotesConfirmEl.classList.add("clearing-confirmation-active");
});
clearNotesFalseButton.addEventListener("click", () => {
    clearNotesConfirmEl.classList.remove("clearing-confirmation-active");
});

// clear all labels;
clearLabelsTrueButton.addEventListener("click", () => {
    localStorage.setItem("labels", JSON.stringify([]));
    let storedLabels = JSON.parse(localStorage.getItem("labels"));
    makeLabelsInLabelsList(storedLabels);
    makeStoredNotesHTML();
    toastNotice("Labels Deleted", 5);
    clearNotesConfirmEl.classList.remove("clearing-confirmation-active");
    clearLabelsConfirmEl.classList.remove("clearing-confirmation-active");
});
clearLabelsOption.addEventListener("click", () => {
    clearLabelsConfirmEl.classList.add("clearing-confirmation-active");
});
clearLabelsFalseButton.addEventListener("click", () => {
    clearLabelsConfirmEl.classList.remove("clearing-confirmation-active");
});

// reset app;
resetAppTrueButton.addEventListener("click", () => {
    localStorage.clear();
    allNotesContainer.innerHTML = "";
    toastNotice("App has been reset to its factory state", 5);
    resetAppConfirmEl.classList.remove("clearing-confirmation-active");
});
resetAppOption.addEventListener("click", () => {
    resetAppConfirmEl.classList.add("clearing-confirmation-active");
});
resetAppFalseButton.addEventListener("click", () => {
    resetAppConfirmEl.classList.remove("clearing-confirmation-active");
});

// hide/show the settings menu;
const settingsICon = document.querySelector("#settings-icon");
const settingsMenu = document.querySelector("#settings-menu-container");
settingsICon.addEventListener("click", () => {
    if (!settingsICon.classList.contains("settings-icon-animate")) {
        settingsICon.classList.add("settings-icon-moved");
        labelsContainer.classList.remove("show-labels-container");
        showHideLabelsButton.textContent = "Labels...";
        setTimeout(() => {
            settingsICon.classList.add("settings-icon-animate");
        }, 10);
    } else {
        settingsICon.classList.toggle("settings-icon-moved");
        setTimeout(() => {
            settingsICon.classList.toggle("settings-icon-animate");
        }, 400);
    }
    if (!settingsMenu.classList.contains("settings-menu-moved")) {
        settingsMenu.classList.add("settings-menu-moved");
    } else {
        setTimeout(() => {
            settingsMenu.classList.remove("settings-menu-moved");
        }, 10);
    }
    // in case those popups where visible;
    clearNotesConfirmEl.classList.remove("clearing-confirmation-active");
    clearLabelsConfirmEl.classList.remove("clearing-confirmation-active");
});

// change color theme of the app;
function indicateWhichThemeIsActive() {
    themeOptionsTogglers.forEach((toggler) => {
        if (toggler.id === body.className) {
            toggler.classList.add("current-theme-highlight");
        }
        if (toggler.id !== body.className) {
            toggler.classList.remove("current-theme-highlight");
        }
    });
}
themeOptionsTogglers.forEach((optionButton) => {
    optionButton.addEventListener("click", () => {
        let classToSwitchTo = optionButton.id;
        body.className = classToSwitchTo;
        let settings = JSON.parse(localStorage.getItem("settings"));
        settings[0].theme = classToSwitchTo;
        localStorage.setItem("settings", JSON.stringify(settings));
        indicateWhichThemeIsActive();
    });
});
