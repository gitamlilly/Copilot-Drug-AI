/* 
  script.js  
  Enhanced Fake Drug AI with:
  - TensorFlow.js dummy model for predictions  
  - Chart.js visualizations  
  - Multi-step wizard UI  
  - Random molecular properties  
*/

// UI Elements
const steps = Array.from(document.querySelectorAll('.step'));
const progressBar = document.getElementById('progress');
const createBtn = document.getElementById('createBtn');
const nextToTestBtn = document.getElementById('nextToTestBtn');
const testBtn = document.getElementById('testBtn');
const moleculeInput = document.getElementById('moleculeInput');
const propertiesList = document.getElementById('propertiesList');
const spinner = document.getElementById('spinner');
const barCanvas = document.getElementById('barChart');
const radarCanvas = document.getElementById('radarChart');

// State
let currentDrug = null;
let model = null;

// Wizard control
let currentStep = 0;
function showStep(index) {
  steps.forEach((s,i) => s.classList.toggle('hidden', i !== index));
  progressBar.style.width = `${(index/(steps.length-1))*100}%`;
}
showStep(0);  // Start at step 0

/* 
  Step 1: Generate fake drug from user input.
  - Validate input  
  - Simulate structural string & random properties  
  - Advance wizard  
*/
createBtn.addEventListener('click', () => {
  const input = moleculeInput.value.trim();
  if (!input) {
    alert('Please enter a molecule design.');
    return;
  }

  // Simulate drug creation
  currentDrug = simulateDrugCreation(input);
  displayProperties(currentDrug);
  showStep(1);
});

/* 
  Step 2: Proceed to testing  
*/
nextToTestBtn.addEventListener('click', () => {
  showStep(2);
});

/* 
  Step 3: Run dummy ML model to predict efficacy/toxicity  
  - Ensure model is loaded/trained  
  - Show spinner during prediction  
  - Render charts on completion  
*/
testBtn.addEventListener('click', async () => {
  spinner.classList.remove('hidden');
  testBtn.disabled = true;

  // Lazy-load and train model if not already done
  if (!model) {
    model = await buildAndTrainModel();
  }

  // Prepare input tensor (encode string)
  const inputTensor = encodeMolecule(currentDrug.structure);

  // Predict [efficacy, toxicity]
  const [eff, tox] = model.predict(inputTensor).dataSync();
  spinner.classList.add('hidden');

  renderBarChart(eff*100, tox*100);
  renderRadarChart(currentDrug.sideEffects);
});

/* -----------------------------
   Fake Drug Creation & Display
------------------------------*/
function simulateDrugCreation(input) {
  // Random pseudo name
  const name = `FX-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  // Fake structure = reversed + "-mol"
  const structure = input.split('').reverse().join('') + '-MOL';
  // Random molecular weight (100–600 g/mol)
  const molWeight = (100 + Math.random()*500).toFixed(1);
  // Random logP (-1 to 5)
  const logP = (Math.random()*6 - 1).toFixed(2);
  // Simulate side-effects
  const sideEffects = pickRandom([
    'Nausea','Headache','Dizziness','Fatigue','Dry mouth','Insomnia'
  ], 3);

  return { name, structure, molWeight, logP, sideEffects };
}

function displayProperties(drug) {
  // Clear then list each property
  propertiesList.innerHTML = '';
  const props = {
    'Name': drug.name,
    'Structure': drug.structure,
    'Molecular Weight (g/mol)': drug.molWeight,
    'LogP (lipophilicity)': drug.logP,
    'Possible Side Effects': drug.sideEffects.join(', ')
  };
  for (let key in props) {
    const li = document.createElement('li');
    li.textContent = `${key}: ${props[key]}`;
    propertiesList.appendChild(li);
  }
}

/* -----------------------------
   Dummy ML Model with TensorFlow.js
------------------------------*/
async function buildAndTrainModel() {
  // 1. Define a simple sequential model
  const mdl = tf.sequential();
  mdl.add(tf.layers.dense({inputShape:[10], units: 16, activation:'relu'}));
  mdl.add(tf.layers.dense({units: 8, activation:'relu'}));
  // Output: 2 values (efficacy & toxicity) with sigmoid to norm 0–1
  mdl.add(tf.layers.dense({units:2, activation:'sigmoid'}));

  mdl.compile({optimizer:'adam', loss:'meanSquaredError'});

  // 2. Generate synthetic training data
  const xs = tf.randomNormal([200,10]);
  const ys = tf.randomUniform([200,2]);

  // 3. Train quickly
  await mdl.fit(xs, ys, {epochs:20, batchSize:32});
  return mdl;
}

// Encode string to fixed-length tensor
function encodeMolecule(str) {
  const maxLen = 10;
  const codes = Array(maxLen).fill(0);
  for (let i=0; i<Math.min(str.length,maxLen); i++) {
    codes[i] = str.charCodeAt(i) / 255;  // Normalize
  }
  return tf.tensor2d([codes]);
}

/* -----------------------------
   Charting with Chart.js
------------------------------*/
let barChart, radarChart;
function renderBarChart(efficacy, toxicity) {
  barCanvas.classList.remove('hidden');
  if (barChart) barChart.destroy();

  barChart = new Chart(barCanvas, {
    type: 'bar',
    data: {
      labels: ['Efficacy (%)','Toxicity (%)'],
      datasets: [{
        label: 'Prediction',
        data: [efficacy.toFixed(1), toxicity.toFixed(1)],
        backgroundColor: ['#28a745','#dc3545']
      }]
    },
    options: { scales: { y: { beginAtZero:true, max:100 } } }
  });
}

function renderRadarChart(effects) {
  radarCanvas.classList.remove('hidden');
  if (radarChart) radarChart.destroy();

  // Fake severity scores for each side effect
  const scores = effects.map(() => Math.random()*100);

  radarChart = new Chart(radarCanvas, {
    type: 'radar',
    data: {
      labels: effects,
      datasets: [{
        label: 'Side-Effect Severity',
        data: scores,
        backgroundColor: 'rgba(255,159,64,0.2)',
        borderColor: 'rgba(255,159,64,1)',
      }]
    },
    options: {
      scales: { r: { beginAtZero:true, max:100 } }
    }
  });
}

/* -----------------------------
   Utility Functions
------------------------------*/
// Pick `n` random items from `arr`
function pickRandom(arr, n) {
  return tf.util.shuffle(arr).slice(0,n);
}
