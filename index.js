// IMPORT ESSENTIAL FUNCTIONS FROM FIREBASE
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js'
import { getDatabase, ref, push, onValue, update } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js'

// SET APP AND DATABASE
const appSettings = {
	databaseURL: 'https://we-are-the-champions-enhanced-default-rtdb.europe-west1.firebasedatabase.app/',
}
const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementListInDb = ref(database, 'endorsementList')

// GET ESSENTIAL ELEMENTS
const inputMessageEl = document.getElementById('endorsement-message')
const inputSenderEl = document.getElementById('endorsement-from')
const inputReceiverEl = document.getElementById('endorsement-to')
const publishBtn = document.getElementById('publish-btn')
const errorMsg = document.getElementById('error-msg')
const endorsementList = document.getElementById('endorsement-list')

// ENDORSEMENT OBJECT CONSTRUCTOR
function Endorsement(sender, receiver, message, hearts) {
	this.sender = sender
	this.receiver = receiver
	this.message = message
	this.hearts = hearts
}

// GET ENDORSEMENTS FROM FIREBASE DATABASE
onValue(endorsementListInDb, function (snapshot) {
	if (snapshot.exists()) {
		let endorsementArray = Object.entries(snapshot.val())
		clearEndorsementList()
		for (let i = 0; i < endorsementArray.length; i++) {
			let currentEndorsement = endorsementArray[i]
			appendEndorsementToList(currentEndorsement)
		}
	} else {
		endorsementList.innerHTML = 'Nobody likes me... 😔'
	}
})

// CLEAR ENDORSEMENTS IN DOM
function clearEndorsementList() {
	endorsementList.innerHTML = ''
}

// CLEAR VALUE IN ALL INPUT ELEMENTS
function clearAllInputs() {
	inputSenderEl.value = ''
	inputReceiverEl.value = ''
	inputMessageEl.value = ''
}

// CREATE ENDORSEMENT OBJECT WITH ENDORSEMENT OBJECT CONSTRUCTOR
function createEndorsementObject() {
	const senderValue = inputSenderEl.value
	const receiverValue = inputReceiverEl.value
	const messageValue = inputMessageEl.value
	const heartsValue = 0

	if (senderValue && receiverValue && messageValue) {
		return new Endorsement(senderValue, receiverValue, messageValue, heartsValue)
	} else {
		errorMsg.textContent = `Please fill all fields then click "Publish"`
	}
}

// TAKE ENDORSEMENT OBJECT FROM FIREBASE DATABASE, RECREATE ENDORSEMENT BASED ON OBJECT VALUES AND APPEND IT TO ENDORSEMENT LIST IN DOM
function appendEndorsementToList(endorsement) {
	const endorsementID = endorsement[0]
	const endorsementValue = endorsement[1]
	const newEndorsement = document.createElement('li')
	const newHeartsEl = document.createElement('p')

	newEndorsement.classList.add('endorsement', 'container', 'container--column', 'container--gap1')
	newEndorsement.innerHTML = `
	<p class="endorsement__bold-text">To: ${endorsementValue.receiver}</p>
	<p>${endorsementValue.message}</p>
	<p class="endorsement__bold-text">From: ${endorsementValue.sender}</p>`
	newHeartsEl.classList.add('endorsement__hearts', 'endorsement__bold-text', 'endorsement__bold-text--bigger')
	newHeartsEl.textContent = `❤ ${endorsementValue.hearts}`
	newHeartsEl.setAttribute('data-id', endorsementID)
	newEndorsement.id = endorsementID
	newEndorsement.append(newHeartsEl)
	endorsementList.insertBefore(newEndorsement, endorsementList.firstChild)
	errorMsg.textContent = ''

	manageHeartInEndorsement(endorsementID, endorsementValue.hearts)
	clearAllInputs()
}

// ADD OR REMOVE HEART BASED ON ENDORSEMENT ID STORED IN LOCAL STORAGE
function manageHeartInEndorsement(endorsementID, heartsNumber) {
	const endorsesmentInDB = ref(database, `endorsementList/${endorsementID}`)
	const heartsEl = document.querySelector(`[data-id = '${endorsementID}']`)
	const doesIDExistsInLocalStorage = localStorage.getItem(`${endorsementID}`)

	heartsEl.addEventListener('click', () => {
		if (doesIDExistsInLocalStorage) {
			localStorage.removeItem(`${endorsementID}`)
			heartsNumber -= 1
		} else {
			localStorage.setItem(`${endorsementID}`, endorsementID)
			heartsNumber += 1
		}
		update(endorsesmentInDB, { hearts: heartsNumber })
	})

	if (doesIDExistsInLocalStorage) {
		heartsEl.classList.add('heart-added')
	}
}

// PUSH NEW ENDORSEMENT OBJECT TO FIREBASE DATABASE
publishBtn.addEventListener('click', () => {
	push(endorsementListInDb, createEndorsementObject())
})
