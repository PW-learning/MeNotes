// ignore the comments for now;
// below is work in progress;

// import { Toast } from "./pwToast.js"
// let x = new Toast();
// console.log(x);


// Catch Elements
let newNote = $id("note")
let lettersCount = $id("count")
let addButton = $id("add")
let totalNotesCountDiv = $id("show")
let totalNotesCount = $id("nfn");

// Fixed values
const minLettersCount = 10;
const maxLettersCount = 280;

// Check letters count in textarea
newNote.addEventListener("input", () => {
    let currentLettersCount = maxLettersCount - newNote.value.length
    lettersCount.textContent = `Only ${currentLettersCount} letters`
    if (currentLettersCount < 25) {
        lettersCount.style.color = "#f70"
        vibrate([100, 50, 100])
    }
    // TODO: red color when mor than 180
});

// Insert note to storage
addButton.addEventListener("click", () => {
    if (newNote.value.length >= minLettersCount && newNote.value.length <= maxLettersCount) {
        localStorage.setItem(randomID(), newNote.value)
        location.reload()
    } else {
        pwToast('You must type between 10 and 180 letters please', 5)
        vibError()
    }
});

// Show all notes
totalNotesCount.innerHTML = localStorage.length
for (let i = 0; i < localStorage.length; i++) {
    let newNoteToBeAdded = document.createElement("div")
    newNoteToBeAdded.innerHTML = `
        <div id="note-${i}" class="note">
            <p class="new-ne">${localStorage.getItem(localStorage.key(i))}</p>
            <hr />
            <button class="delete">Delete</button>
            <button id="pw-share-${i}" class="pw-share">Share</button>
        </div>
    `
    totalNotesCountDiv.appendChild(newNoteToBeAdded)
};

// Delete note
let allDeleteButtons = document.querySelectorAll(".delete")
allDeleteButtons.forEach((v, k) => {
    v.addEventListener("click", () => {
        if (confirm("Are you sure ? This note will go for good")) {
            localStorage.removeItem(localStorage.key(k))
            vibOnce()
            location.reload()
        } else {
            pwToast("Nothing deleted")
        }
    })
});

// TODO: Edit note
// Share when you sure
let allShareButtons = document.querySelectorAll(".pw-share")
allShareButtons.forEach((v, k) => {
    v.addEventListener("click", () => {
        let msg = v.parentElement.firstElementChild.innerHTML
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
});