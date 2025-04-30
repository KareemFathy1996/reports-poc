// Function to display the JSON references screen
function showJsonReferences() {
  // Check if generation filter is selected and validate it
  const generationFilter = reportFiltersInstance.getGenerationFilter();
  const generationFilterValue = reportFiltersInstance.getGenerationFilterValue();
  
  // Get required filters for validation
  const requiredFilters = getRequiredGenerationFilters();
  
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
  
  // Add filter options - use the labels from reportFiltersInstance
  const filterOptions = reportFiltersInstance.filterLabels;
  
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
  // Get human-readable filter name from reportFiltersInstance
  let filterLabel = reportFiltersInstance.getFilterLabel(filterType) || filterType;
  
  let html = `<p><strong>Applied Filter:</strong> ${filterLabel}</p>`;
  
  // Add value if applicable
  if (filterValue && reportFiltersInstance.filterRequiresValue(filterType)) {
    html += `<p><strong>Value:</strong> ${filterValue}</p>`;
  }
  
  html += `<p class="note">Data is filtered according to these criteria. You can change the filter above.</p>`;
  
  container.innerHTML = html;
}

// Function to render the references
function renderReferences(container) {
  // Get the selected datasets and their filters
  const generationFilter = reportFiltersInstance.getGenerationFilter();
  const generationFilterValue = reportFiltersInstance.getGenerationFilterValue();
  
  container.innerHTML = '';
  
  const description = document.createElement('p');
  description.className = 'json-description';
  description.textContent = 'Use these JSON references as placeholders in your tables. Each field reference can be used to display specific data points. They will be replaced with real data when generating reports.';
  container.appendChild(description);
  
  const jsonGrid = document.createElement('div');
  jsonGrid.className = 'json-grid';
  
  // For each selected dataset ID, find the complete dataset from the original array
  const completeSelectedDatasets = selectedDatasets.map(selectedDs => {
    // Check if this is already a complete dataset object with jsonReference
    if (selectedDs.jsonReference && selectedDs.jsonReference.fieldReferences) {
      return selectedDs;
    }
    
    // Otherwise, find the complete dataset in the original array
    return datasets.find(ds => ds.id === selectedDs.id) || selectedDs;
  });
  
  completeSelectedDatasets.forEach(dataset => {
    // Ensure the dataset has field references
    const processedDataset = generateFieldReferences(dataset);
    
    const jsonCard = document.createElement('div');
    jsonCard.className = 'json-card';
    
    const title = document.createElement('h3');
    title.textContent = processedDataset.name;
    jsonCard.appendChild(title);
    
    // Selected filters summary
    const filters = selectedFiltersMap[processedDataset.id] || { academicYears: [], userTypes: [] };
    
    const filtersSummary = document.createElement('div');
    filtersSummary.className = 'filters-summary';
    
    const academicYearsText = document.createElement('p');
    academicYearsText.innerHTML = `<strong>Academic Years:</strong> ${filters.academicYears.join(', ') || 'None'}`;
    filtersSummary.appendChild(academicYearsText);
    
    const userTypesText = document.createElement('p');
    userTypesText.innerHTML = `<strong>User Types:</strong> ${filters.userTypes.join(', ') || 'None'}`;
    filtersSummary.appendChild(userTypesText);
    
    // Show Required Generation Filters if they exist
    if (processedDataset.requiredGenerationFilters && processedDataset.requiredGenerationFilters.length > 0) {
      const requiredFiltersText = document.createElement('p');
      
      const filterLabels = processedDataset.requiredGenerationFilters.map(filter => {
        return reportFiltersInstance.getFilterLabel(filter);
      }).join(', ');
      
      requiredFiltersText.innerHTML = `<strong>Required Generation Filters:</strong> ${filterLabels}`;
      filtersSummary.appendChild(requiredFiltersText);
    }
    
    jsonCard.appendChild(filtersSummary);
    
    // Field references table
    if (processedDataset.jsonReference && processedDataset.jsonReference.fieldReferences) {
      const fieldReferencesSection = document.createElement('div');
      fieldReferencesSection.className = 'field-references-section';
      
      const fieldReferencesTitle = document.createElement('h4');
      fieldReferencesTitle.textContent = 'Field References:';
      fieldReferencesSection.appendChild(fieldReferencesTitle);
      
      const fieldReferencesTable = document.createElement('table');
      fieldReferencesTable.className = 'field-references-table';
      
      // Table header
      const tableHeader = document.createElement('thead');
      const headerRow = document.createElement('tr');
      
      const pathHeader = document.createElement('th');
      pathHeader.textContent = 'Reference Path';
      headerRow.appendChild(pathHeader);
      
      const descHeader = document.createElement('th');
      descHeader.textContent = 'Description';
      headerRow.appendChild(descHeader);
      
      tableHeader.appendChild(headerRow);
      fieldReferencesTable.appendChild(tableHeader);
      
      // Table body
      const tableBody = document.createElement('tbody');
      
      // Add table rows for each field reference
      const fieldRefs = processedDataset.jsonReference.fieldReferences;
      if (fieldRefs && fieldRefs.length > 0) {
        fieldRefs.forEach(fieldRef => {
          const row = document.createElement('tr');
          
          const pathCell = document.createElement('td');
          pathCell.className = 'reference-path';
          pathCell.textContent = fieldRef.path;
          pathCell.addEventListener('click', () => {
            // Copy to clipboard
            navigator.clipboard.writeText(fieldRef.path)
              .then(() => {
                // Visual feedback for copy
                pathCell.classList.add('copied');
                setTimeout(() => {
                  pathCell.classList.remove('copied');
                }, 1000);
              })
              .catch(err => {
                console.error('Could not copy text: ', err);
              });
          });
          row.appendChild(pathCell);
          
          const descCell = document.createElement('td');
          descCell.textContent = fieldRef.description;
          row.appendChild(descCell);
          
          tableBody.appendChild(row);
        });
      } else {
        // If no field references, add a message
        const emptyRow = document.createElement('tr');
        const emptyCell = document.createElement('td');
        emptyCell.colSpan = 2;
        emptyCell.textContent = 'No field references available';
        emptyCell.style.textAlign = 'center';
        emptyRow.appendChild(emptyCell);
        tableBody.appendChild(emptyRow);
      }
      
      fieldReferencesTable.appendChild(tableBody);
      fieldReferencesSection.appendChild(fieldReferencesTable);
      
      // Add copy info text
      const copyInfo = document.createElement('p');
      copyInfo.className = 'copy-info';
      copyInfo.textContent = 'Click on any reference path to copy to clipboard';
      fieldReferencesSection.appendChild(copyInfo);
      
      jsonCard.appendChild(fieldReferencesSection);
    } else {
      // Fallback if no field references available
      const noRefsMessage = document.createElement('div');
      noRefsMessage.className = 'no-refs-message';
      noRefsMessage.textContent = 'No field references available for this dataset.';
      jsonCard.appendChild(noRefsMessage);
    }
    
    // Sample data
    const sampleSection = document.createElement('div');
    sampleSection.className = 'sample-section';
    
    const sampleTitle = document.createElement('h4');
    sampleTitle.textContent = 'Sample Data Structure:';
    sampleSection.appendChild(sampleTitle);
    
    const sampleValue = document.createElement('pre');
    sampleValue.className = 'sample-value';
    if (processedDataset.jsonReference && processedDataset.jsonReference.sampleData) {
      sampleValue.textContent = JSON.stringify(processedDataset.jsonReference.sampleData, null, 2);
    } else {
      sampleValue.textContent = 'No sample data available';
    }
    sampleSection.appendChild(sampleValue);
    
    jsonCard.appendChild(sampleSection);
    
    jsonGrid.appendChild(jsonCard);
  });
  
  container.appendChild(jsonGrid);
}