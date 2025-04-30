// Function to toggle a filter selection
function toggleFilter(badgeElement, filterName, filterType, isRequired, datasetId) {
  const isDatasetSelected = selectedDatasets.some(ds => ds.id === parseInt(datasetId));
  
  if (!isDatasetSelected) {
      showMessage('Please select this dataset first', 'error');
      return;
  }
  
  // Get the dataset from the ID
  const dataset = datasets.find(ds => ds.id === parseInt(datasetId));
  if (!dataset) return;
  
  // Check if this filter belongs to the dataset
  const datasetFilters = dataset.filters[filterType];
  const isValidFilter = isRequired 
      ? datasetFilters.required.includes(filterName)
      : datasetFilters.optional.includes(filterName);
      
  if (!isValidFilter) {
      return; // This should not happen in normal flow
  }
  
  // Initialize filters for this dataset if they don't exist
  if (!selectedFiltersMap[datasetId]) {
      selectedFiltersMap[datasetId] = {
          academicYears: [],
          userTypes: []
      };
  }
  
  if (badgeElement.classList.contains('selected')) {
      // Deselect the filter
      badgeElement.classList.remove('selected');
      selectedFiltersMap[datasetId][filterType] = selectedFiltersMap[datasetId][filterType].filter(f => f !== filterName);
  } else {
      // Select the filter
      badgeElement.classList.add('selected');
      if (!selectedFiltersMap[datasetId][filterType].includes(filterName)) {
          selectedFiltersMap[datasetId][filterType].push(filterName);
      }
  }
  
  updateSelectionSummary();
}

// Function to check if all required filters are selected for a dataset
function checkRequiredFiltersSelected(dataset) {
  if (!dataset) return false;
  
  const filtersForDataset = selectedFiltersMap[dataset.id];
  if (!filtersForDataset) return false;
  
  // Check academic years - at least one required academic year must be selected
  const requiredAcademicYears = dataset.filters.academicYears.required;
  // If there are required years, at least one must be selected
  const allAcademicYearsSelected = requiredAcademicYears.length === 0 || 
      requiredAcademicYears.some(year => filtersForDataset.academicYears.includes(year));
  
  // Check user types - at least one required user type must be selected
  const requiredUserTypes = dataset.filters.userTypes.required;
  // If there are required user types, at least one must be selected
  const allUserTypesSelected = requiredUserTypes.length === 0 || 
      requiredUserTypes.some(type => filtersForDataset.userTypes.includes(type));
  
  return allAcademicYearsSelected && allUserTypesSelected;
}

// Function to get required generation filters based on selected datasets
function getRequiredGenerationFilters() {
  const generationFilters = [];
  
  // Check if any dataset requires student ID
  if (selectedDatasets.some(ds => ds.id === 1 || ds.id === 6 || 
                              ds.name.includes('Student Performance') || 
                              ds.name.includes('Student Growth'))) {
    generationFilters.push('studentId');
  }
  
  // Check if any dataset requires academic year filter
  if (selectedDatasets.some(ds => ds.id === 3 || ds.id === 5 ||
                              ds.name.includes('Curriculum Coverage') ||
                              ds.name.includes('Department Performance'))) {
    generationFilters.push('academicYear');
  }
  
  return generationFilters;
}