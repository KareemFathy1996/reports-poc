class ReportFilters {
  constructor() {
    this.userFilters = [];
    this.generationFilter = null; // Current filter type
    this.generationFilterValue = null; // Value for the generation filter (e.g., student ID)
    this.requiredGenerationFilter = null; // Which filter is required based on selected datasets
    
    // Define generation filter labels
    this.filterLabels = {
      'studentId': 'Student ID',
      'academicYear': 'Academic Year',
      'currentYear': 'Current Year Only',
      'verifiedData': 'Verified Data Only'
    };
    
    // Track which filters require values
    this.filtersRequiringValues = ['studentId', 'academicYear'];
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
      
      // Clear the filter value when switching to a different filter type
      if (this.filtersRequiringValues.includes(filterType)) {
        this.generationFilterValue = ''; // Reset to empty to force user input
      }
    }
  }
  
  // Get the human-readable label for a filter
  getFilterLabel(filterValue) {
    return this.filterLabels[filterValue] || filterValue;
  }
  
  // Check if a filter requires a value
  filterRequiresValue(filterType) {
    return this.filtersRequiringValues.includes(filterType);
  }
  
  // Validate the current filter and value
  isFilterValid() {
    // For filters requiring values, check if the value is not empty
    if (this.filterRequiresValue(this.generationFilter)) {
      return this.generationFilterValue && this.generationFilterValue.trim() !== '';
    }
    
    // For filters not requiring values, just check if a filter is selected
    return !!this.generationFilter;
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

      .student-id-input.error {
        border-color: #ff4d4f;
        background-color: #fff2f0;
      }

      .filter-value-error {
        color: #ff4d4f;
        font-size: 12px;
        margin-top: 5px;
        display: none;
      }

      .filter-value-error.show {
        display: block;
      }
    `;
    document.head.appendChild(style);
  }

  renderFiltersSection() {
    const summaryContainer = document.getElementById('selectionSummary');
    if (!summaryContainer) return;
    
    // Check if filters section already exists to avoid duplication
    const existingSection = summaryContainer.querySelector('.report-filters-section');
    if (existingSection) {
      existingSection.remove();
    }
    
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
          <div id="studentIdError" class="filter-value-error">Please enter a Student ID</div>
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
        
        <div id="filterValueContainer" class="form-group" style="display: ${this.filterRequiresValue(this.generationFilter) ? 'block' : 'none'};">
          <label for="filterValueInput">Filter Value *</label>
          <input type="text" id="filterValueInput" class="student-id-input" 
                 placeholder="Enter filter value"
                 value="${this.generationFilterValue || ''}">
          <div id="filterValueError" class="filter-value-error">Please enter a value</div>
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
    
    // Only show the value input for filters that require values
    if (this.filterRequiresValue(this.generationFilter)) {
      filterValueContainer.style.display = 'block';
      
      // Update placeholder based on filter type
      const filterValueInput = document.getElementById('filterValueInput');
      if (filterValueInput) {
        if (this.generationFilter === 'studentId') {
          filterValueInput.placeholder = 'Enter Student ID';
        } else if (this.generationFilter === 'academicYear') {
          filterValueInput.placeholder = 'Enter Academic Year (e.g. 2023-2024)';
        }
        
        // Set value if we have one
        if (this.generationFilterValue) {
          filterValueInput.value = this.generationFilterValue;
        }
      }
    } else {
      filterValueContainer.style.display = 'none';
    }
    
    // Update proceed button state
    this.updateProceedButtonState();
  }
  
  updateProceedButtonState() {
    const proceedButton = document.getElementById('proceedButton');
    if (!proceedButton) return;
    
    // Check if the current filter is valid
    const isFilterValid = this.isFilterValid();
    
    // Get validation error elements
    const studentIdError = document.getElementById('studentIdError');
    const filterValueError = document.getElementById('filterValueError');
    
    // Get input elements
    const studentIdInput = document.getElementById('studentIdInput');
    const filterValueInput = document.getElementById('filterValueInput');
    
    // Update error display for studentId specific UI
    if (this.requiredGenerationFilter === "studentId" && studentIdInput && studentIdError) {
      if (this.generationFilterValue && this.generationFilterValue.trim() !== '') {
        studentIdInput.classList.remove('error');
        studentIdError.classList.remove('show');
      } else {
        studentIdInput.classList.add('error');
        studentIdError.classList.add('show');
      }
    }
    
    // Update error display for general filter UI
    if (filterValueInput && filterValueError && this.filterRequiresValue(this.generationFilter)) {
      if (this.generationFilterValue && this.generationFilterValue.trim() !== '') {
        filterValueInput.classList.remove('error');
        filterValueError.classList.remove('show');
      } else {
        filterValueInput.classList.add('error');
        filterValueError.classList.add('show');
      }
    }
    
    // Update button state
    proceedButton.disabled = !isFilterValid;
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
          
          // Update validation state
          this.updateProceedButtonState();
          
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
          const previousFilter = this.generationFilter;
          this.generationFilter = newGenFilterSelect.value;
          
          // If switching between filter types that require values, preserve the value
          // Otherwise, reset the value
          if (!this.filterRequiresValue(previousFilter) || 
              !this.filterRequiresValue(this.generationFilter)) {
            this.generationFilterValue = '';
          }
          
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
          
          // Update validation state
          this.updateProceedButtonState();
          
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