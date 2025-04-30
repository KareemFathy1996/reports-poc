class ReportFilters {
  constructor() {
    this.userFilters = [];
    this.generationFilter = null; // New property for the required generation filter
    this.generationFilterValue = null; // Value for the generation filter (e.g., student ID)
    this.requiredGenerationFilter = null; // Which filter is required based on selected datasets
    
    // Define generation filter labels
    this.filterLabels = {
      'studentId': 'Student ID',
      'currentYear': 'Current Year Only',
      'verifiedData': 'Verified Data Only'
    };
  }

  initialize() {
    // Add custom styles for filter elements
    this.addGenerationFilterStyles();
    
    // Only attempt to setup the initial UI if we're on the selection screen
    if (document.getElementById('selectionSummary')) {
      this.renderFiltersSection();
      this.setupEventListeners();
    }
  }
  
  // Set the required generation filter based on selected datasets
  setRequiredGenerationFilter(filterType) {
    this.requiredGenerationFilter = filterType;
    
    // Auto-select this filter if it's required and not already selected
    if (filterType && this.generationFilter !== filterType) {
      this.generationFilter = filterType;
    }
  }
  
  // Get the human-readable label for a filter
  getFilterLabel(filterValue) {
    return this.filterLabels[filterValue] || filterValue;
  }
  
  // Add CSS for generation filter message
  addGenerationFilterStyles() {
    // Only add styles once
    if (document.getElementById('report-filter-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'report-filter-styles';
    style.textContent = `
      .generation-filter-message {
        background-color: #fff4e5;
        color: #d46b08;
        padding: 15px;
        margin: 15px 0;
        border-radius: 4px;
        border-left: 4px solid #fa8c16;
        font-weight: bold;
      }
      
      .additional-filters {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px dashed #e8e8e8;
      }
      
      .additional-filters ul {
        margin: 8px 0 0 20px;
        padding: 0;
      }
      
      .additional-filters li {
        margin-bottom: 5px;
      }
      
      .student-id-input {
        padding: 8px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        width: 100%;
        margin-top: 5px;
      }
      
      .student-id-input:focus {
        border-color: var(--primary-color);
        outline: none;
        box-shadow: 0 0 0 2px rgba(74, 107, 175, 0.2);
      }
    `;
    document.head.appendChild(style);
  }

  renderFiltersSection() {
    const summaryContainer = document.getElementById('selectionSummary');
    if (!summaryContainer) return;
    
    // Check if filters section already exists to avoid duplication
    if (summaryContainer.querySelector('.report-filters-section')) return;
    
    const filtersSection = document.createElement('div');
    filtersSection.className = 'report-filters-section';
    
    // Create content based on whether student ID filter is required
    if (this.requiredGenerationFilter === "studentId") {
      filtersSection.innerHTML = `
        <h4>Required Student Information</h4>
        <p>Enter the Student ID to filter data for a specific student.</p>
        
        <div class="form-group">
          <label for="studentIdInput">Student ID *</label>
          <input type="text" id="studentIdInput" class="student-id-input" 
                required placeholder="Enter Student ID" 
                value="${this.generationFilterValue || ''}">
        </div>
      `;
    } else {
      // Build the filter options from our filterLabels map
      let filterOptions = '<option value="">Select a filter</option>';
      for (const [value, label] of Object.entries(this.filterLabels)) {
        // If this value is currently selected, mark it as selected
        const selected = this.generationFilter === value ? 'selected' : '';
        filterOptions += `<option value="${value}" ${selected}>${label}</option>`;
      }
      
      filtersSection.innerHTML = `
        <h4>Report-Level Filters</h4>
        <p>These filters will be applied to all selected datasets when generating the report.</p>
        
        <div class="form-group">
          <label for="generationFilter">Required Generation Filter *</label>
          <select id="generationFilter" required>
            ${filterOptions}
          </select>
        </div>
        
        <div id="filterValueContainer" class="form-group" style="display: none;">
          <label for="filterValueInput">Filter Value *</label>
          <input type="text" id="filterValueInput" class="student-id-input" placeholder="Enter filter value">
        </div>
      `;
    }
    
    // If there's a button container, insert before that, otherwise just append
    const existingButtonContainer = summaryContainer.querySelector('.button-container');
    if (existingButtonContainer) {
      summaryContainer.insertBefore(filtersSection, existingButtonContainer);
    } else {
      summaryContainer.appendChild(filtersSection);
    }

    // If the required filter is studentId, make the input visible
    this.updateFilterValueVisibility();
  }

  updateFilterValueVisibility() {
    // If we're using the Student ID UI, just return
    if (this.requiredGenerationFilter === "studentId") return;
    
    const filterValueContainer = document.getElementById('filterValueContainer');
    if (!filterValueContainer) return;
    
    // Only show the value input for student ID filter
    if (this.generationFilter === 'studentId') {
      filterValueContainer.style.display = 'block';
      
      // Set value if we have one
      const filterValueInput = document.getElementById('filterValueInput');
      if (filterValueInput && this.generationFilterValue) {
        filterValueInput.value = this.generationFilterValue;
      }
    } else {
      filterValueContainer.style.display = 'none';
    }
  }

  setupEventListeners() {
    // Setup based on whether we're using the Student ID UI or the general filter UI
    if (this.requiredGenerationFilter === "studentId") {
      const studentIdInput = document.getElementById('studentIdInput');
      if (studentIdInput) {
        // Remove existing listener if any
        const newStudentIdInput = studentIdInput.cloneNode(true);
        if (studentIdInput.parentNode) {
          studentIdInput.parentNode.replaceChild(newStudentIdInput, studentIdInput);
        }
        
        newStudentIdInput.addEventListener('input', (e) => {
          this.generationFilter = "studentId";
          this.generationFilterValue = e.target.value.trim();
          // Call the global updateSelectionSummary function if it exists
          if (typeof updateSelectionSummary === 'function') {
            updateSelectionSummary();
          }
        });
      }
    } else {
      // First remove any existing event listeners (to prevent duplicates)
      const genFilterSelect = document.getElementById('generationFilter');
      if (genFilterSelect) {
        const newGenFilterSelect = genFilterSelect.cloneNode(true);
        if (genFilterSelect.parentNode) {
          genFilterSelect.parentNode.replaceChild(newGenFilterSelect, genFilterSelect);
        }
        
        newGenFilterSelect.addEventListener('change', () => {
          this.generationFilter = newGenFilterSelect.value;
          // Update the visibility of the filter value input
          this.updateFilterValueVisibility();
          // Call the global updateSelectionSummary function if it exists
          if (typeof updateSelectionSummary === 'function') {
            updateSelectionSummary();
          }
        });
      }
      
      // Add listener for the filter value input
      const filterValueInput = document.getElementById('filterValueInput');
      if (filterValueInput) {
        const newFilterValueInput = filterValueInput.cloneNode(true);
        if (filterValueInput.parentNode) {
          filterValueInput.parentNode.replaceChild(newFilterValueInput, filterValueInput);
        }
        
        newFilterValueInput.addEventListener('input', (e) => {
          this.generationFilterValue = e.target.value.trim();
          // Call the global updateSelectionSummary function if it exists
          if (typeof updateSelectionSummary === 'function') {
            updateSelectionSummary();
          }
        });
      }
    }
  }

  getGenerationFilter() {
    return this.generationFilter;
  }
  
  getGenerationFilterValue() {
    return this.generationFilterValue;
  }

  addUserFilter() {
    // We're not using additional filters in this simplified version
    return;
  }

  getUserFilters() {
    // We're not using additional filters in this simplified version
    return [];
  }
}