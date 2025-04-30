class DatasetCreator {
  constructor() {
    this.datasets = []; // Will be populated from data.js
    this.newDataset = {
      name: '',
      description: '',
      url: '',
      filters: {
        academicYears: { required: [], optional: [] },
        userTypes: { required: [], optional: [] }
      }
    };
  }

  initialize() {
    this.renderForm();
    this.setupEventListeners();
  }

  renderForm() {
    const container = document.querySelector('.container');
    container.innerHTML = `
      <h1>Create New Dataset</h1>
      <div id="message" class="message"></div>
      
      <form id="datasetForm">
        <div class="form-group">
          <label for="datasetName">Dataset Name</label>
          <input type="text" id="datasetName" required>
        </div>
        
        <div class="form-group">
          <label for="datasetDescription">Description</label>
          <textarea id="datasetDescription" required></textarea>
        </div>
        
        <div class="form-group">
          <label for="datasetUrl">Data URL (API endpoint)</label>
          <input type="text" id="datasetUrl" required>
        </div>
        
        <h3>Required Filters</h3>
        <div class="filter-section">
          <div class="form-group">
            <label>Academic Years</label>
            <div id="requiredAcademicYears" class="filter-input-group"></div>
            <button type="button" class="btn btn-small" id="addRequiredYear">+ Add Year</button>
          </div>
          
          <div class="form-group">
            <label>User Types</label>
            <div id="requiredUserTypes" class="filter-input-group"></div>
            <button type="button" class="btn btn-small" id="addRequiredUserType">+ Add User Type</button>
          </div>
        </div>
        
        <h3>Optional Filters</h3>
        <div class="filter-section">
          <div class="form-group">
            <label>Academic Years</label>
            <div id="optionalAcademicYears" class="filter-input-group"></div>
            <button type="button" class="btn btn-small" id="addOptionalYear">+ Add Year</button>
          </div>
          
          <div class="form-group">
            <label>User Types</label>
            <div id="optionalUserTypes" class="filter-input-group"></div>
            <button type="button" class="btn btn-small" id="addOptionalUserType">+ Add User Type</button>
          </div>
        </div>
        
        <div class="button-group">
          <button type="submit" class="btn btn-primary">Save Dataset</button>
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
        </div>
      </form>
    `;
  }

  setupEventListeners() {
    document.getElementById('addRequiredYear').addEventListener('click', () => this.addFilterInput('requiredAcademicYears'));
    document.getElementById('addRequiredUserType').addEventListener('click', () => this.addFilterInput('requiredUserTypes'));
    document.getElementById('addOptionalYear').addEventListener('click', () => this.addFilterInput('optionalAcademicYears'));
    document.getElementById('addOptionalUserType').addEventListener('click', () => this.addFilterInput('optionalUserTypes'));
    document.getElementById('datasetForm').addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('cancelBtn').addEventListener('click', () => window.location.reload());
  }

  addFilterInput(containerId) {
    const container = document.getElementById(containerId);
    const inputId = `${containerId}-${Date.now()}`;
    const input = document.createElement('div');
    input.className = 'filter-input-item';
    input.innerHTML = `
      <input type="text" id="${inputId}" placeholder="Enter value">
      <button type="button" class="btn btn-small btn-remove">×</button>
    `;
    container.appendChild(input);
    
    input.querySelector('.btn-remove').addEventListener('click', () => {
      container.removeChild(input);
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    
    // Collect form data
    this.newDataset = {
      name: document.getElementById('datasetName').value,
      description: document.getElementById('datasetDescription').value,
      url: document.getElementById('datasetUrl').value,
      filters: {
        academicYears: {
          required: this.getInputValues('requiredAcademicYears'),
          optional: this.getInputValues('optionalAcademicYears')
        },
        userTypes: {
          required: this.getInputValues('requiredUserTypes'),
          optional: this.getInputValues('optionalUserTypes')
        }
      }
    };
    
    // Validate
    if (!this.newDataset.name || !this.newDataset.description || !this.newDataset.url) {
      this.showMessage('Please fill all required fields', 'error');
      return;
    }
    
    // Save to datasets array (in a real app, this would be an API call)
    const newId = Math.max(...datasets.map(d => d.id), 0) + 1;
    const newDataset = {
      id: newId,
      ...this.newDataset,
      jsonReference: {
        placeholder: `{{${this.newDataset.name.toUpperCase().replace(/\s+/g, '_')}_DATA}}`,
        sampleData: []
      }
    };
    
    datasets.push(newDataset);
    this.showMessage('Dataset created successfully!', 'success');
    setTimeout(() => window.location.reload(), 1500);
  }

  getInputValues(containerId) {
    const container = document.getElementById(containerId);
    return Array.from(container.querySelectorAll('input'))
      .map(input => input.value)
      .filter(value => value.trim() !== '');
  }

  showMessage(text, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
  }
}