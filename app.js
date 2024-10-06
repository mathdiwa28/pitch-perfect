// Select elements from the DOM
const generateRandomPitchBtn = document.getElementById('generate-random-pitch');
const keys = document.querySelectorAll('#piano button');
const messageEl = document.getElementById('message');
const testPitchBtn = document.getElementById('test-pitch');
const replayBtn = document.getElementById('replay');
const nextTuneBtn = document.getElementById('next-tune');
const backBtn = document.getElementById('back');

let currentPitch = '';          // Pitch for the random round
let correctNotes = 0;
let testNotes = [];
let userInputNotes = [];
let currentTestNoteIndex = 0;

// Load sound files (for simplicity, use Web Audio API or any preloaded sounds)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const frequencies = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63,
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00,
    'A#4': 466.16, 'B4': 493.88
};

// Function to play a pitch
function playPitch(note) {
    const osc = audioContext.createOscillator();
    osc.frequency.value = frequencies[note];
    osc.connect(audioContext.destination);
    osc.start();
    setTimeout(() => osc.stop(), 1000);  // Play the sound for 1 second
}

// Function to generate a random note
function generateRandomNote() {
    const notes = Object.keys(frequencies);
    return notes[Math.floor(Math.random() * notes.length)];
}

// Function to check if the user played the correct pitch
function checkNotePlayed(note) {
    if (note === currentPitch) {
        messageEl.innerHTML = '<span style="font-size: 2em; color: green; text-align: center; display: block;">CORRECT!</span>';
        currentPitch = ''; // Reset currentPitch so a new one can be generated
        correctNotes++;
    } else {
        if (frequencies[note] > frequencies[currentPitch]) {
            messageEl.textContent = 'Lower!';
        } else {
            messageEl.textContent = 'Higher!';
        }
    }
}

// Function to start the test round where a sequence of notes is played for the user to replicate
function startTest() {
    messageEl.textContent = 'Play back the tune!';
    userInputNotes = [];
    currentTestNoteIndex = 0;
    testNotes = [];
    
    for (let i = 0; i < 4; i++) {
        let note = generateRandomNote();
        testNotes.push(note);
        setTimeout(() => playPitch(note), i * 1200);
    }
}

// Function to check if the user correctly replicated the notes in the test round
function checkTest() {
    if (userInputNotes.length === testNotes.length) {
        let score = 0;
        for (let i = 0; i < testNotes.length; i++) {
            if (userInputNotes[i] === testNotes[i]) score++;
        }
        messageEl.innerHTML = `${score}/${testNotes.length} notes correct!`;
        replayBtn.style.display = 'inline'; // Show replay button
        nextTuneBtn.style.display = 'inline'; // Show next tune button
    }
}

// Function to handle replaying the last tune
function replayTune() {
    userInputNotes = []; // Reset user input notes for replay
    testNotes.forEach((note, index) => {
        setTimeout(() => playPitch(note), index * 1200);
    });
    correctNotes = 0; // Reset the correct notes count for the next test
    messageEl.innerHTML = ''; // Clear previous messages after replay
}

// Function to handle playing a new tune
function nextTune() {
    startTest(); // Start a new test
}

// Function to handle going back to single-note recognition mode
function goBack() {
    messageEl.textContent = ''; // Clear messages
    currentPitch = ''; // Reset currentPitch
    correctNotes = 0; // Reset correct notes
    userInputNotes = []; // Reset user input notes
    testNotes = []; // Clear test notes

    // Hide buttons related to the test
    replayBtn.style.display = 'none';
    nextTuneBtn.style.display = 'none';
    testPitchBtn.disabled = false; // Re-enable the Test Your Pitch button
}

// Event listener for piano keys
keys.forEach(key => {
    key.addEventListener('click', () => {
        const note = key.getAttribute('data-note');
        playPitch(note);
        
        // Only clear the initial message after the first click
        if (messageEl.textContent === 'Listen to the pitch and reproduce it on the piano!') {
            messageEl.textContent = ''; // Clear the initial message
        }

        if (currentPitch) {
            // Check if the note matches the current pitch
            checkNotePlayed(note);
        } else if (testNotes.length > 0) {
            // If in test mode, capture the user input note
            userInputNotes.push(note);
            checkTest();
        }
    });
});

// Event listener for the "Test your pitch" button
testPitchBtn.addEventListener('click', () => {
    startTest();
    replayBtn.style.display = 'none'; // Hide replay button initially
    nextTuneBtn.style.display = 'none'; // Hide next tune button initially
});

// Event listener for the "Generate Random Pitch!" button
generateRandomPitchBtn.addEventListener('click', () => {
    currentPitch = generateRandomNote();
    playPitch(currentPitch);
    messageEl.textContent = 'Listen to the pitch and reproduce it on the piano!';
});

// Event listener for the "Replay" button
replayBtn.addEventListener('click', replayTune);
replayBtn.style.display = 'none'; // Hide replay button initially

// Event listener for the "Next Tune" button
nextTuneBtn.addEventListener('click', nextTune);
nextTuneBtn.style.display = 'none'; // Hide next tune button initially

// Event listener for the "Back" button
backBtn.addEventListener('click', goBack);

// Initial setup for the "Test your pitch" button to remain active
testPitchBtn.disabled = false;
