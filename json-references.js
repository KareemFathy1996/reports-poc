// Function to display the JSON references screen
function showJsonReferences() {
  // Check if generation filter is selected and validate it
  const generationFilter = reportFiltersInstance.getGenerationFilter();
  const generationFilterValue = reportFiltersInstance.getGenerationFilterValue();
  
  // Validate the filter before proceeding
  if (!generationFilter) {
    showMessage('Please select the required generation filter', 'error');
    return;
  }
  
  // If the filter requires a value, validate that too
  if (reportFiltersInstance.filterRequiresValue(generationFilter) && 
      (!generationFilterValue || generationFilterValue.trim() === '')) {
    showMessage(`Please enter a value for the ${reportFiltersInstance.getFilterLabel(generationFilter)}`, 'error');
    return;
  }
  
  // Also get any user filters
  const userFilters = reportFiltersInstance.getUserFilters();

  const container = document.querySelector('.container');
  container.innerHTML = '';
  
  const header = document.createElement('h1');
  header.textContent = 'Dataset JSON References';
  container.appendChild(header);
  
  // Create filter controls section
  const filterControlsSection = document.createElement('div');
  filterControlsSection.className = 'filter-controls-section';
  
  const filterControlsTitle = document.createElement('h3');
  filterControlsTitle.textContent = 'Applied Filters';
  filterControlsSection.appendChild(filterControlsTitle);
  
  const filterForm = document.createElement('form');
  filterForm.className = 'filter-form';
  filterForm.onsubmit = (e) => e.preventDefault(); // Prevent form submission
  
  // Generation filter select
  const filterTypeGroup = document.createElement('div');
  filterTypeGroup.className = 'form-group';
  
  const filterTypeLabel = document.createElement('label');
  filterTypeLabel.setAttribute('for', 'dataViewFilterType');
  filterTypeLabel.textContent = 'Filter Type:';
  filterTypeGroup.appendChild(filterTypeLabel);
  
  const filterTypeSelect = document.createElement('select');
  filterTypeSelect.id = 'dataViewFilterType';
  filterTypeSelect.className = 'filter-select';
  
  // Add filter options
  const filterOptions = {
    'studentId': 'Student ID',
    'academicYear': 'Academic Year',
    'currentYear': 'Current Year Only',
    'verifiedData': 'Verified Data Only'
  };
  
  Object.entries(filterOptions).forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    if (value === generationFilter) {
      option.selected = true;
    }
    filterTypeSelect.appendChild(option);
  });
  
  filterTypeGroup.appendChild(filterTypeSelect);
  filterForm.appendChild(filterTypeGroup);
  
  // Filter value input (only shown for filters that need a value)
  const filterValueGroup = document.createElement('div');
  filterValueGroup.className = 'form-group';
  filterValueGroup.id = 'filterValueGroup';
  
  const filterValueLabel = document.createElement('label');
  filterValueLabel.setAttribute('for', 'dataViewFilterValue');
  filterValueLabel.textContent = 'Filter Value:';
  filterValueGroup.appendChild(filterValueLabel);
  
  const filterValueInput = document.createElement('input');
  filterValueInput.type = 'text';
  filterValueInput.id = 'dataViewFilterValue';
  filterValueInput.className = 'filter-input';
  
  // Set placeholder based on filter type
  if (generationFilter === 'studentId') {
    filterValueInput.placeholder = 'Enter Student ID';
  } else if (generationFilter === 'academicYear') {
    filterValueInput.placeholder = 'Enter Academic Year (e.g. 2023-2024)';
  } else {
    filterValueInput.placeholder = 'Enter filter value';
  }
  
  // Set current value if exists
  if (generationFilterValue) {
    filterValueInput.value = generationFilterValue;
  }
  
  filterValueGroup.appendChild(filterValueInput);
  
  // Add error message
  const filterValueError = document.createElement('div');
  filterValueError.id = 'dataViewFilterError';
  filterValueError.className = 'filter-value-error';
  filterValueError.textContent = 'Please enter a valid value';
  filterValueGroup.appendChild(filterValueError);
  
  filterForm.appendChild(filterValueGroup);
  
  // Only show value input for filters that need it
  if (!reportFiltersInstance.filterRequiresValue(generationFilter)) {
    filterValueGroup.style.display = 'none';
  }
  
  // Add apply button
  const applyButtonGroup = document.createElement('div');
  applyButtonGroup.className = 'form-group button-group';
  
  const applyButton = document.createElement('button');
  applyButton.type = 'button';
  applyButton.className = 'btn btn-primary';
  applyButton.textContent = 'Apply Filter';
  applyButtonGroup.appendChild(applyButton);
  
  filterForm.appendChild(applyButtonGroup);
  filterControlsSection.appendChild(filterForm);
  
  // Add success message element that will be shown when filter is applied
  const filterSuccessMessage = document.createElement('div');
  filterSuccessMessage.id = 'filterSuccessMessage';
  filterSuccessMessage.className = 'filter-success';
  filterSuccessMessage.textContent = 'Filter applied successfully';
  filterControlsSection.appendChild(filterSuccessMessage);
  
  // Add the filter controls to the container
  container.appendChild(filterControlsSection);
  
  // Display current filter info
  const currentFilterInfo = document.createElement('div');
  currentFilterInfo.id = 'currentFilterInfo';
  currentFilterInfo.className = 'generation-filter-info';
  
  updateCurrentFilterDisplay(currentFilterInfo, generationFilter, generationFilterValue);
  
  container.appendChild(currentFilterInfo);
  
  // Create a div for the references content that will be updated when filters change
  const referencesContent = document.createElement('div');
  referencesContent.id = 'referencesContent';
  container.appendChild(referencesContent);
  
  // Initial render of the references
  renderReferences(referencesContent);
  
  // Add event listeners for the filter controls
  filterTypeSelect.addEventListener('change', function() {
    const selectedFilter = this.value;
    
    // Reset error state
    filterValueInput.classList.remove('error');
    filterValueError.classList.remove('show');
    
    // Toggle visibility of the value input based on filter type
    if (reportFiltersInstance.filterRequiresValue(selectedFilter)) {
      filterValueGroup.style.display = 'block';
      
      // Update placeholder text
      if (selectedFilter === 'studentId') {
        filterValueInput.placeholder = 'Enter Student ID';
      } else if (selectedFilter === 'academicYear') {
        filterValueInput.placeholder = 'Enter Academic Year (e.g. 2023-2024)';
      } else {
        filterValueInput.placeholder = 'Enter filter value';
      }
      
      // Clear the input if switching between different filter types
      if (!reportFiltersInstance.filterRequiresValue(generationFilter) || 
          generationFilter !== selectedFilter) {
        filterValueInput.value = '';
      }
    } else {
      filterValueGroup.style.display = 'none';
    }
  });
  
  applyButton.addEventListener('click', function() {
    const selectedFilter = filterTypeSelect.value;
    let filterValue = null;
    let isValid = true;
    
    // Hide success message
    filterSuccessMessage.classList.remove('show');
    
    if (reportFiltersInstance.filterRequiresValue(selectedFilter)) {
      filterValue = filterValueInput.value.trim();
      
      if (!filterValue) {
        // Show validation error
        filterValueInput.classList.add('error');
        filterValueError.classList.add('show');
        isValid = false;
      } else {
        // Clear validation error
        filterValueInput.classList.remove('error');
        filterValueError.classList.remove('show');
      }
    }
    
    if (!isValid) {
      return;
    }
    
    // Apply loading state
    referencesContent.classList.add('loading');
    
    // Update the filter in the reportFiltersInstance
    reportFiltersInstance.generationFilter = selectedFilter;
    reportFiltersInstance.generationFilterValue = filterValue;
    
    // Update current filter display
    updateCurrentFilterDisplay(document.getElementById('currentFilterInfo'), selectedFilter, filterValue);
    
    // Re-render the references with a small delay to show loading transition
    setTimeout(() => {
      renderReferences(document.getElementById('referencesContent'));
      referencesContent.classList.remove('loading');
      
      // Show success message
      filterSuccessMessage.classList.add('show');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        filterSuccessMessage.classList.remove('show');
      }, 3000);
    }, 300);
  });
  
  // Back button
  const backButton = document.createElement('button');
  backButton.className = 'btn btn-secondary';
  backButton.textContent = 'Back to Selection';
  backButton.addEventListener('click', () => {
    // Reinitialize the page
    window.location.reload();
  });
  
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  buttonContainer.appendChild(backButton);
  container.appendChild(buttonContainer);
}

// Function to update the current filter display
function updateCurrentFilterDisplay(container, filterType, filterValue) {
  // Get human-readable filter name
  let filterLabel = filterType;
  switch (filterType) {
    case 'studentId':
      filterLabel = 'Student ID';
      break;
    case 'academicYear':
      filterLabel = 'Academic Year';
      break;
    case 'currentYear':
      filterLabel = 'Current Year Only';
      break;
    case 'verifiedData':
      filterLabel = 'Verified Data Only';
      break;
  }
  
  let html = `<p><strong>Applied Filter:</strong> ${filterLabel}</p>`;
  
  // Add value if applicable
  if (filterValue && (filterType === 'studentId' || filterType === 'academicYear')) {
    html += `<p><strong>Value:</strong> ${filterValue}</p>`;
  }
  
  html += `<p class="note">Data is filtered according to these criteria. You can change the filter above.</p>`;
  
  container.innerHTML = html;
}