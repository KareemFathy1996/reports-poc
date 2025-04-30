// Function to update the selection summary
function updateSelectionSummary() {
  const summaryContainer = document.getElementById('selectionSummary');
  
  if (selectedDatasets.length === 0) {
    summaryContainer.style.display = 'none';
    return;
  }
  
  // Clear existing content
  summaryContainer.innerHTML = '';
  summaryContainer.style.display = 'block';
  
  // Create the header
  const header = document.createElement('h3');
  header.textContent = 'Selection Summary';
  summaryContainer.appendChild(header);
  
  // Determine required generation filters based on selected datasets
  const requiredFilters = getRequiredGenerationFilters();
  
  // Store required filters in global storage (for use in the report view)
  window.requiredGenerationFilters = requiredFilters;
  
  // Create a container for the selected datasets
  const datasetsContainer = document.createElement('div');
  datasetsContainer.className = 'selected-datasets-container';
  summaryContainer.appendChild(datasetsContainer);
  
  let allRequiredFiltersSelected = true;
  
  // Add each selected dataset with its filter information
  selectedDatasets.forEach(dataset => {
    const datasetCard = document.createElement('div');
    datasetCard.className = 'selected-dataset-card';
    
    const datasetTitle = document.createElement('h4');
    datasetTitle.textContent = dataset.name;
    datasetCard.appendChild(datasetTitle);
    
    // Academic Years
    const academicYearsSection = document.createElement('div');
    academicYearsSection.className = 'selection-filter-group';
    
    const academicYearsTitle = document.createElement('div');
    academicYearsTitle.className = 'selection-filter-group-title';
    academicYearsTitle.textContent = 'Academic Years:';
    academicYearsSection.appendChild(academicYearsTitle);
    
    const academicYearsItems = document.createElement('div');
    academicYearsItems.className = 'selection-filter-items';
    
    // Check if the dataset has filters selected
    const filters = selectedFiltersMap[dataset.id] || { academicYears: [], userTypes: [] };
    
    if (filters.academicYears.length > 0) {
      filters.academicYears.forEach(year => {
        const item = document.createElement('span');
        item.className = 'selection-filter-item';
        item.textContent = year;
        academicYearsItems.appendChild(item);
      });
    } else {
      academicYearsItems.textContent = 'None selected';
    }
    
    academicYearsSection.appendChild(academicYearsItems);
    datasetCard.appendChild(academicYearsSection);
    
    // User Types
    const userTypesSection = document.createElement('div');
    userTypesSection.className = 'selection-filter-group';
    
    const userTypesTitle = document.createElement('div');
    userTypesTitle.className = 'selection-filter-group-title';
    userTypesTitle.textContent = 'User Types:';
    userTypesSection.appendChild(userTypesTitle);
    
    const userTypesItems = document.createElement('div');
    userTypesItems.className = 'selection-filter-items';
    
    if (filters.userTypes.length > 0) {
      filters.userTypes.forEach(type => {
        const item = document.createElement('span');
        item.className = 'selection-filter-item';
        item.textContent = type;
        userTypesItems.appendChild(item);
      });
    } else {
      userTypesItems.textContent = 'None selected';
    }
    
    userTypesSection.appendChild(userTypesItems);
    datasetCard.appendChild(userTypesSection);
    
    // Example Field Reference section
    if (dataset.jsonReference && dataset.jsonReference.fieldReferences && dataset.jsonReference.fieldReferences.length > 0) {
      const exampleSection = document.createElement('div');
      exampleSection.className = 'selection-filter-group json-reference';
      
      const exampleTitle = document.createElement('div');
      exampleTitle.className = 'selection-filter-group-title';
      exampleTitle.textContent = 'Example Field Reference:';
      exampleSection.appendChild(exampleTitle);
      
      const exampleContent = document.createElement('div');
      exampleContent.className = 'json-reference-content';
      // Display the first field reference as an example
      exampleContent.textContent = dataset.jsonReference.fieldReferences[0].path;
      exampleSection.appendChild(exampleContent);
      
      datasetCard.appendChild(exampleSection);
    }
    
    // Check required filters
    const requiredFiltersSelected = checkRequiredFiltersSelected(dataset);
    if (!requiredFiltersSelected) {
      allRequiredFiltersSelected = false;
      const warningText = document.createElement('div');
      warningText.className = 'filter-warning';
      warningText.textContent = 'Missing required filters!';
      datasetCard.appendChild(warningText);
    }
    
    datasetsContainer.appendChild(datasetCard);
  });
  
  // Add information about required generation filters in the report view
  if (requiredFilters.length > 0) {
    const filterInfoSection = document.createElement('div');
    filterInfoSection.className = 'generation-filters-info';
    
    const filterInfoTitle = document.createElement('h4');
    filterInfoTitle.textContent = 'Required Generation Filters';
    filterInfoSection.appendChild(filterInfoTitle);
    
    const filterInfoText = document.createElement('p');
    filterInfoText.textContent = 'The following filters will be required in the report view:';
    filterInfoSection.appendChild(filterInfoText);
    
    const filtersList = document.createElement('div');
    filtersList.className = 'generation-filters-list';
    
    requiredFilters.forEach(filter => {
      const filterItem = document.createElement('div');
      filterItem.className = 'generation-filter-item';
      
      let filterLabel = filter;
      // Apply human-readable labels
      if (filter === 'studentId') filterLabel = 'Student ID';
      if (filter === 'academicYear') filterLabel = 'Academic Year';
      
      filterItem.textContent = filterLabel;
      filtersList.appendChild(filterItem);
    });
    
    filterInfoSection.appendChild(filtersList);
    summaryContainer.appendChild(filterInfoSection);
  }
  
  // Add the proceed button
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  
  const proceedButton = document.createElement('button');
  proceedButton.className = 'btn btn-primary';
  proceedButton.id = 'proceedButton';
  proceedButton.textContent = 'Proceed with Selection';
  proceedButton.disabled = !allRequiredFiltersSelected;
  proceedButton.addEventListener('click', showJsonReferences);
  
  buttonContainer.appendChild(proceedButton);
  summaryContainer.appendChild(buttonContainer);
  
  // Show appropriate message
  if (!allRequiredFiltersSelected) {
    showMessage('Please select all required filters for each dataset', 'error');
  } else if (selectedDatasets.length > 0) {
    showMessage('All required filters selected! You can now proceed.', 'success');
  }
}