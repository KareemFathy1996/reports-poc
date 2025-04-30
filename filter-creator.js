class FilterCreator {
  constructor() {
    this.availableFilters = ['academicYears', 'userTypes']; // Existing filters
    this.newFilter = {
      name: '',
      values: []
    };
  }

  initialize() {
    this.renderForm();
    this.setupEventListeners();
  }

  renderForm() {
    const container = document.querySelector('.container');
    container.innerHTML = `
      <h1>Create New Filter</h1>
      <div id="message" class="message"></div>
      
      <form id="filterForm">
        <div class="form-group">
          <label for="filterName">Filter Name</label>
          <input type="text" id="filterName" required placeholder="e.g., gradeLevel">
        </div>
        
        <div class="form-group">
          <label>Filter Values</label>
          <div id="filterValues" class="filter-input-group"></div>
          <button type="button" class="btn btn-small" id="addFilterValue">+ Add Value</button>
        </div>
        
        <div class="button-group">
          <button type="submit" class="btn btn-primary">Save Filter</button>
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
        </div>
      </form>
    `;
  }

  setupEventListeners() {
    document.getElementById('addFilterValue').addEventListener('click', () => this.addFilterValueInput());
    document.getElementById('filterForm').addEventListener('submit', (e) => this.handleSubmit(e));
    document.getElementById('cancelBtn').addEventListener('click', () => window.location.reload());
  }

  addFilterValueInput() {
    const container = document.getElementById('filterValues');
    const inputId = `filterValue-${Date.now()}`;
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
    
    this.newFilter = {
      name: document.getElementById('filterName').value,
      values: this.getFilterValues()
    };
    
    if (!this.newFilter.name || this.newFilter.values.length === 0) {
      this.showMessage('Please fill all required fields', 'error');
      return;
    }
    
    // Add to available filters (in a real app, this would be an API call)
    this.availableFilters.push(this.newFilter.name);
    
    // Update all datasets to include this new filter
    datasets.forEach(dataset => {
      dataset.filters[this.newFilter.name] = {
        required: [],
        optional: []
      };
    });
    
    this.showMessage('Filter created successfully!', 'success');
    setTimeout(() => window.location.reload(), 1500);
  }

  getFilterValues() {
    return Array.from(document.getElementById('filterValues').querySelectorAll('input'))
      .map(input => input.value)
      .filter(value => value.trim() !== '');
  }

  showMessage(text, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
  }
}