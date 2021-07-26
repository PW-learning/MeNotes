if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('https://menote.pehpe.com/pw-sw.js')
    .then(function(reg){
        console.log("Yes, PWWW SW is registered.");
    }).catch(function(err) {
        console.log("This happened:", err)
    });
}

// Catch Elements
let noteTextArea = $id("note-text-area")
let countSpanEl = $id("letters-count")
let addNewNoteButton = $id("add-button")
let allNotesContainer = $id("all-notes-container")
let notesCount = $id("notes-count")
// Fixed values
const min = 5
const max = 280
// Check letters count in textarea
noteTextArea.addEventListener("input", () => {
    let remainingLetters = max - noteTextArea.value.length
    if(remainingLetters<= 0){
        countSpanEl.textContent = remainingLetters
        countSpanEl.style.color = "#f00"
        vibrate([100,50,100])
    } else if(remainingLetters< 25){
        countSpanEl.textContent = `Only ${remainingLetters} letters`
        countSpanEl.style.color = "#f70"
    } else {
        countSpanEl.textContent = `Only ${remainingLetters} letters`
        countSpanEl.style.color = "#000"
    }
})
// Insert note to storage
addNewNoteButton.addEventListener("click", () => {
    if(noteTextArea.value.length >= min && noteTextArea.value.length <= max){
        localStorage.setItem(rId(),noteTextArea.value)
        location.reload()
    } else {
        pwToast('Note should at least be between 5 and 180 letters',5)
        vibError()
    }
})
// Show all notes
notesCount.innerHTML = localStorage.length
for (let i = 0; i < localStorage.length; i++){
    console.log(localStorage.getItem(localStorage.key(i)))
    let newNote = document.createElement("div")
    newNote.innerHTML = `
        <div id="note-${i}" class="note-container">
            <textarea class="new-note" readonly="true" dir="auto">${localStorage.getItem(localStorage.key(i))}</textarea>
            <hr /><button class="delete-button">Delete</button>
            <button id="pw-share-${i}" class="pw-share">Share</button>
            <button id="pw-edit-${i}" class="pw-edit">Edit</button>
            <button id="pw-save-${i}" class="pw-save">Save</button>
        </div>
    `
    allNotesContainer.appendChild(newNote)
}
// Delete note
let deleteButtons = document.querySelectorAll(".delete-button")
deleteButtons.forEach((button,key) => {
    button.addEventListener("click", () => {
        debugger
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
editButtons.forEach((button,key) => {
    button.addEventListener("click", () => {
        let noteBeingEdited = button.parentElement.firstElementChild
        noteBeingEdited.removeAttribute("readonly")
        button.style.display = "none"
        button.nextElementSibling.style.display = "inline-block"
    })
})

let saveButtons = document.querySelectorAll(".pw-save")
saveButtons.forEach((button,key) => {
    button.style.display = "none"
    button.addEventListener("click", () => {
        let newNoteValue = button.parentElement.firstElementChild.value;
        button.style.display = "none"
        localStorage.setItem(localStorage.key(key),newNoteValue)
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