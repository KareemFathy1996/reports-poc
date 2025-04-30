// Function to get required generation filters based on selected datasets
function getRequiredGenerationFilters() {
  const generationFilters = new Set();
  
  // Check if any dataset has explicitly required generation filters
  selectedDatasets.forEach(dataset => {
    if (dataset.requiredGenerationFilters && Array.isArray(dataset.requiredGenerationFilters)) {
      dataset.requiredGenerationFilters.forEach(filter => generationFilters.add(filter));
    }
  });
  
  // If we have explicit required filters, use those
  if (generationFilters.size > 0) {
    return Array.from(generationFilters);
  }
  
  // Otherwise, use the legacy approach for backwards compatibility
  
  // Check if any dataset requires student ID
  if (selectedDatasets.some(ds => ds.id === 1 || ds.id === 6 || 
                              ds.name.includes('Student Performance') || 
                              ds.name.includes('Student Growth'))) {
    generationFilters.add('studentId');
  }
  
  // Check if any dataset requires academic year filter
  if (selectedDatasets.some(ds => ds.id === 3 || ds.id === 5 ||
                              ds.name.includes('Curriculum Coverage') ||
                              ds.name.includes('Department Performance'))) {
    generationFilters.add('academicYear');
  }
  
  return Array.from(generationFilters);
}

// Update the selection summary to show required generation filters
function updateFilterRequirements() {
  // Get the required filters
  const requiredFilters = getRequiredGenerationFilters();
  
  // Update the reportFiltersInstance with the required filter
  if (reportFiltersInstance && requiredFilters.length > 0) {
    // Set the first filter as required
    reportFiltersInstance.setRequiredGenerationFilter(requiredFilters[0]);
    
    // If there are multiple required filters, we can show a message
    if (requiredFilters.length > 1) {
      showMessage(
        `Multiple generation filters required: ${requiredFilters.map(f => reportFiltersInstance.getFilterLabel(f)).join(', ')}. 
         Using ${reportFiltersInstance.getFilterLabel(requiredFilters[0])} as the primary filter.`, 
        'warning'
      );
    }
  }
  
  // Update the UI based on the filters
  const filterInfoSection = document.querySelector('.generation-filters-info');
  if (filterInfoSection && requiredFilters.length > 0) {
    // Update the filterInfoSection content to show requirements
    const filtersList = filterInfoSection.querySelector('.generation-filters-list');
    if (filtersList) {
      filtersList.innerHTML = '';
      
      requiredFilters.forEach(filter => {
        const filterItem = document.createElement('div');
        filterItem.className = 'generation-filter-item';
        
        let filterLabel = filter;
        // Apply human-readable labels
        if (filter === 'studentId') filterLabel = 'Student ID';
        if (filter === 'academicYear') filterLabel = 'Academic Year';
        if (filter === 'currentYear') filterLabel = 'Current Year Only';
        if (filter === 'verifiedData') filterLabel = 'Verified Data Only';
        
        filterItem.textContent = filterLabel;
        filtersList.appendChild(filterItem);
      });
    }
  }
}

// Modified function to update the selection summary
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
    
    // Required Generation Filters (new section to display dataset's specific requirements)
    if (dataset.requiredGenerationFilters && dataset.requiredGenerationFilters.length > 0) {
      const genFiltersSection = document.createElement('div');
      genFiltersSection.className = 'selection-filter-group';
      
      const genFiltersTitle = document.createElement('div');
      genFiltersTitle.className = 'selection-filter-group-title';
      genFiltersTitle.textContent = 'Required Generation Filters:';
      genFiltersSection.appendChild(genFiltersTitle);
      
      const genFiltersItems = document.createElement('div');
      genFiltersItems.className = 'selection-filter-items';
      
      dataset.requiredGenerationFilters.forEach(filter => {
        const item = document.createElement('span');
        item.className = 'selection-filter-item generation-required';
        
        // Get human-readable filter name
        let filterLabel = filter;
        switch (filter) {
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
        
        item.textContent = filterLabel;
        genFiltersItems.appendChild(item);
      });
      
      genFiltersSection.appendChild(genFiltersItems);
      datasetCard.appendChild(genFiltersSection);
    }
    
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
      if (filter === 'currentYear') filterLabel = 'Current Year Only';
      if (filter === 'verifiedData') filterLabel = 'Verified Data Only';
      
      filterItem.textContent = filterLabel;
      filtersList.appendChild(filterItem);
    });
    
    filterInfoSection.appendChild(filtersList);
    summaryContainer.appendChild(filterInfoSection);
  }
  
  // Create Report Filters section after displaying required filters
  reportFiltersInstance.renderFiltersSection();
  reportFiltersInstance.setupEventListeners();
  
  // Update filter requirements in the reportFiltersInstance
  updateFilterRequirements();
  
  // Add the proceed button
  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'button-container';
  
  const proceedButton = document.createElement('button');
  proceedButton.className = 'btn btn-primary';
  proceedButton.id = 'proceedButton';
  proceedButton.textContent = 'Proceed with Selection';
  
  // Button should be disabled if required filters aren't selected or if generation filter is missing
  const generationFilter = reportFiltersInstance.getGenerationFilter();
  const generationFilterRequired = requiredFilters.length > 0;
  const generationFilterSelected = !!generationFilter;
  
  proceedButton.disabled = !allRequiredFiltersSelected || (generationFilterRequired && !generationFilterSelected);
  proceedButton.addEventListener('click', showJsonReferences);
  
  buttonContainer.appendChild(proceedButton);
  summaryContainer.appendChild(buttonContainer);
  
  // Show appropriate message
  if (!allRequiredFiltersSelected) {
    showMessage('Please select all required filters for each dataset', 'error');
  } else if (generationFilterRequired && !generationFilterSelected) {
    showMessage('Please select the required generation filter', 'error');
  } else if (selectedDatasets.length > 0) {
    showMessage('All required filters selected! You can now proceed.', 'success');
  }
}