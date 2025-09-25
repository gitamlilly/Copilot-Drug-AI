/* script.js
   This file mocks a Drug Creation & Testing AI.
   All “predictions” are random and for demo purposes only.
*/

// 1. Grab references to interactive elements
const createBtn     = document.getElementById('createBtn');
const testBtn       = document.getElementById('testBtn');
const moleculeInput = document.getElementById('moleculeInput');
const resultOutput  = document.getElementById('resultOutput');

// Holds the last “created” fake drug
let currentDrug = null;

/* 
  2. Handle “Create Drug” click
  - Validate user input
  - Simulate AI designing a drug
  - Display the fake drug and enable testing
*/
createBtn.addEventListener('click', () => {
  const input = moleculeInput.value.trim();
  if (!input) {
    resultOutput.textContent = '⚠️ Please enter a molecule design first.';
    return;
  }

  // Generate a fake drug object
  currentDrug = simulateDrugCreation(input);

  // Show basic info to the user
  resultOutput.textContent =
    `🧪 Generated Drug:\n` +
    `Name: ${currentDrug.name}\n` +
    `Structure: ${currentDrug.structure}\n` +
    `Description: ${currentDrug.description}`;

  // Now allow testing
  testBtn.disabled = false;
});

/* 
  3. Handle “Test Drug” click
  - Ensure there’s a drug to test
  - Simulate AI toxicity/efficacy predictions
  - Append results to the output
*/
testBtn.addEventListener('click', () => {
  if (!currentDrug) return;

  resultOutput.textContent += '\n\n🔍 Testing drug…\n';

  const testResults = simulateDrugTesting(currentDrug);

  resultOutput.textContent +=
    `Predicted Efficacy: ${testResults.efficacy}%\n` +
    `Predicted Toxicity: ${testResults.toxicity}%\n` +
    `Predicted Side Effects: ${testResults.sideEffects.join(', ')}`;
});

/*
  simulateDrugCreation()
  - Mimics an AI algorithm that “designs” a compound based on user input.
  - Returns an object with a random name, a fake structure string, and a description.
*/
function simulateDrugCreation(input) {
  // Create a pseudo-random name (e.g., FX-AB12C)
  const name      = `FX-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  // Fake “structure” by reversing the input and appending "-mol"
  const structure = input.split('').reverse().join('') + '-mol';
  // Plain-English descriptor
  const description = `Fictional compound inspired by "${input}", for demo use only.`;

  return { name, structure, description };
}

/*
  simulateDrugTesting()
  - Generates random % efficacy and toxicity values.
  - Picks two random side-effects from a list.
*/
function simulateDrugTesting(drug) {
  // Random float 0–100 with one decimal
  const efficacy = (Math.random() * 100).toFixed(1);
  const toxicity = (Math.random() * 100).toFixed(1);

  // Some example side-effects
  const possibleEffects = [
    'Nausea', 'Headache', 'Dizziness', 'Fatigue', 'Dry mouth'
  ];

  // Shuffle and pick first two
  const sideEffects = shuffleArray(possibleEffects).slice(0, 2);

  return { efficacy, toxicity, sideEffects };
}

/*
  shuffleArray()
  - Simple Fisher-Yates shuffle to randomize an array in place.
*/
function shuffleArray(arr) {
  // Clone to avoid mutating original
  const array = arr.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
