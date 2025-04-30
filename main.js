// Global variables to store selected datasets and filters
let selectedDatasets = [];
let selectedFiltersMap = {}; // Map of dataset ID to selected filters
let reportFiltersInstance; // Global instance of ReportFilters

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Initialize ReportFilters globally
  reportFiltersInstance = new ReportFilters();
  
  // Process all datasets with generateFieldReferences to ensure they have field references
  datasets.forEach(dataset => generateFieldReferences(dataset));
  
  initializeDatasetGrid();
  initializeNavigation();
});

// Function to initialize the dataset grid
function initializeDatasetGrid() {
  const datasetGrid = document.getElementById('datasetGrid');
  datasetGrid.innerHTML = ''; // Clear existing content
  
  datasets.forEach(dataset => {
      const card = createDatasetCard(dataset);
      datasetGrid.appendChild(card);
  });
}

// Add navigation for different POCs
function initializeNavigation() {
  const nav = document.createElement('nav');
  nav.className = 'poc-navigation';
  nav.innerHTML = `
    <button id="datasetSelectionPoc" class="btn btn-nav active">Dataset Selection</button>
    <button id="datasetCreationPoc" class="btn btn-nav">Create Dataset</button>
    <button id="filterCreationPoc" class="btn btn-nav">Create Filter</button>
  `;
  
  document.querySelector('.container').prepend(nav);
  
  // Event listeners for navigation
  document.getElementById('datasetSelectionPoc').addEventListener('click', () => {
    window.location.reload();
  });
  
  document.getElementById('datasetCreationPoc').addEventListener('click', () => {
    const creator = new DatasetCreator();
    creator.initialize();
  });
  
  document.getElementById('filterCreationPoc').addEventListener('click', () => {
    const creator = new FilterCreator();
    creator.initialize();
  });
}

// Function to display messages
function showMessage(text, type) {
  const messageElement = document.getElementById('message');
  messageElement.textContent = text;
  messageElement.className = `message ${type}`;
}