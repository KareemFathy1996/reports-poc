// Updates to ensure DatasetCreator properly initializes requiredGenerationFilters

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
      },
      requiredGenerationFilters: [] // Property for required generation filters
    };
    
    // Available generation filters
    this.availableGenerationFilters = [
      { id: 'studentId', label: 'Student ID' },
      { id: 'academicYear', label: 'Academic Year' },
      { id: 'currentYear', label: 'Current Year Only' },
      { id: 'verifiedData', label: 'Verified Data Only' }
    ];
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
        
        <!-- SECTION: Required Generation Filters -->
        <h3>Required Generation Filters</h3>
        <div class="generation-filter-section">
          <p class="help-text">
            Select generation filters that are required to access this dataset's data. 
            These filters will be automatically applied when users select this dataset.
          </p>
          
          <div class="generation-filters-container" id="generationFiltersContainer">
            ${this.renderGenerationFilterCheckboxes()}
          </div>
        </div>
        
        <div class="button-group">
          <button type="submit" class="btn btn-primary">Save Dataset</button>
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
        </div>
      </form>
    `;
  }

  renderGenerationFilterCheckboxes() {
    return this.availableGenerationFilters.map(filter => `
      <div class="generation-filter-checkbox">
        <input type="checkbox" id="genFilter_${filter.id}" value="${filter.id}" class="generation-filter-input">
        <label for="genFilter_${filter.id}">${filter.label}</label>
        <span class="filter-help">
          ${this.getFilterHelpText(filter.id)}
        </span>
      </div>
    `).join('');
  }

  getFilterHelpText(filterId) {
    switch(filterId) {
      case 'studentId':
        return 'Dataset contains student-specific data that requires a Student ID to filter appropriately.';
      case 'academicYear':
        return 'Dataset contains year-specific data that requires an Academic Year to filter appropriately.';
      case 'currentYear':
        return 'Dataset should show current year data only by default.';
      case 'verifiedData':
        return 'Dataset should show verified data only by default.';
      default:
        return '';
    }
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
      },
      requiredGenerationFilters: this.getSelectedGenerationFilters()
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
    
    // Add sample data based on dataset type
    this.addSampleData(newDataset);
    
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
  
  getSelectedGenerationFilters() {
    return Array.from(document.querySelectorAll('.generation-filter-input:checked'))
      .map(checkbox => checkbox.value);
  }

  addSampleData(dataset) {
    // Create appropriate sample data based on the dataset and its required filters
    const hasStudentFilter = dataset.requiredGenerationFilters.includes('studentId');
    const hasAcademicYearFilter = dataset.requiredGenerationFilters.includes('academicYear');
    
    // Default sample data
    let sampleData = [];
    
    // Create sample data with fields that match the required filters
    if (hasStudentFilter) {
      // If student ID is required, create student-focused sample data
      sampleData = [
        {
          student_id: "ST12345",
          name: "John Smith",
          year: dataset.filters.academicYears.required[0] || "2023-2024",
          data_points: [
            { category: "Attendance", value: 95 },
            { category: "Performance", value: 87 }
          ]
        }
      ];
    } else if (hasAcademicYearFilter) {
      // If academic year is required, create year-focused sample data
      sampleData = [
        {
          year: dataset.filters.academicYears.required[0] || "2023-2024",
          department: "Science",
          metrics: [
            { name: "Completion Rate", value: 92 },
            { name: "Average Score", value: 85 }
          ]
        }
      ];
    } else {
      // Generic sample data
      sampleData = [
        {
          id: "DATA123",
          name: dataset.name.substring(0, 10) + " Sample",
          timestamp: new Date().toISOString().split('T')[0],
          values: [
            { key: "Value 1", value: 75 },
            { key: "Value 2", value: 82 }
          ]
        }
      ];
    }
    
    // Set the sample data
    dataset.jsonReference.sampleData = sampleData;
    
    // Generate field references
    this.generateFieldReferences(dataset);
    
    return dataset;
  }
  
  generateFieldReferences(dataset) {
    if (!dataset.jsonReference) {
      dataset.jsonReference = {
        placeholder: `{{DATASET_${dataset.id}_DATA}}`,
        sampleData: [],
        fieldReferences: []
      };
      return;
    }
    
    const fieldReferences = [];
    const placeholder = dataset.jsonReference.placeholder;
    const sampleData = dataset.jsonReference.sampleData;
    
    if (sampleData && sampleData.length > 0) {
      const sample = sampleData[0];
      const placeholderNoSymbols = placeholder.replace(/[{}]/g, '');
      
      // Get top-level keys
      Object.keys(sample).forEach(key => {
        const path = `{{${placeholderNoSymbols}[0].${key}}}`;
        const description = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        
        fieldReferences.push({ path, description });
        
        // Handle nested objects and arrays
        if (sample[key] && typeof sample[key] === 'object') {
          if (Array.isArray(sample[key]) && sample[key].length > 0) {
            // Array handling
            const firstItem = sample[key][0];
            
            if (typeof firstItem === 'object') {
              // Array of objects
              Object.keys(firstItem).forEach(subKey => {
                const subPath = `{{${placeholderNoSymbols}[0].${key}[0].${subKey}}}`;
                const subDesc = `${key.replace(/_/g, ' ')} ${subKey.replace(/_/g, ' ')}`
                  .replace(/\b\w/g, c => c.toUpperCase());
                
                fieldReferences.push({ path: subPath, description: subDesc });
              });
            } else {
              // Array of primitives
              const arrPath = `{{${placeholderNoSymbols}[0].${key}[0]}}`;
              const arrDesc = `First ${key.replace(/_/g, ' ')}`.replace(/\b\w/g, c => c.toUpperCase());
              fieldReferences.push({ path: arrPath, description: arrDesc });
            }
          } else {
            // Object handling
            Object.keys(sample[key]).forEach(subKey => {
              const subPath = `{{${placeholderNoSymbols}[0].${key}.${subKey}}}`;
              const subDesc = `${key.replace(/_/g, ' ')} ${subKey.replace(/_/g, ' ')}`
                .replace(/\b\w/g, c => c.toUpperCase());
              
              fieldReferences.push({ path: subPath, description: subDesc });
            });
          }
        }
      });
    }
    
    dataset.jsonReference.fieldReferences = fieldReferences;
  }

  showMessage(text, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
  }
}