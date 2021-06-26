// Catch Elements
let n = $id("note")
let c = $id("count")
let a = $id("add")
let s = $id("show")
let q = $id("nfn")
// Fixed values
const mn = 10
const mx = 280
// Check letters count in textarea
n.addEventListener("input", () => {
    let r = mx - n.value.length
    c.textContent = `Only ${r} letters`
    if(r < 25){
        c.style.color = "#f70"
        vibrate([100,50,100])
    }
    // TODO: red color when mor than 180
})
// Insert note to storage
a.addEventListener("click", () => {
    if(n.value.length >= mn && n.value.length <= mx){
        localStorage.setItem(rId(),n.value)
        location.reload()
    } else {
        pwToast('You must type between 10 and 180 letters please',5)
        vibError()
    }
})
// Show all notes
q.innerHTML = localStorage.length
for (let i = 0; i < localStorage.length; i++){
    console.log(localStorage.getItem(localStorage.key(i)))
    let ne = document.createElement("div")
    ne.innerHTML = `
        <div id="note-${i}" class="note">
            <p class="the-note">${localStorage.getItem(localStorage.key(i))}</p>
            <hr /><button class="del">Delete</button>
            <button id="pw-shr-${i}" class="pw-shr">Share</button>
        </div>
    `
    s.appendChild(ne)
}
// Delete note
let zzz = document.querySelectorAll(".del")
zzz.forEach((v,k) => {
    v.addEventListener("click", () => {
        if (confirm("Are you sure ? This note will go for good")) {
            localStorage.removeItem(localStorage.key(k))
            vibOnce()
            location.reload()
        } else {
            pwToast("Nothing deleted")
        }
    })
})
// TODO: Edit note
// Share when you sure
let shr = document.querySelectorAll(".pw-shr")
shr.forEach((v, k) => {
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
})