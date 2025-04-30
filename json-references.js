// Function to display the JSON references screen
function showJsonReferences() {
  const container = document.querySelector('.container');
  container.innerHTML = '';
  
  const header = document.createElement('h1');
  header.textContent = 'Dataset JSON References';
  container.appendChild(header);
  
  // Get the required generation filters
  const requiredFilters = window.requiredGenerationFilters || [];
  
  // Create the generation filters form
  if (requiredFilters.length > 0) {
    const filtersForm = document.createElement('div');
    filtersForm.className = 'generation-filters-form';
    
    const formTitle = document.createElement('h3');
    formTitle.textContent = 'Required Generation Filters';
    filtersForm.appendChild(formTitle);
    
    const formDesc = document.createElement('p');
    formDesc.textContent = 'Enter values for the required filters to generate the report:';
    filtersForm.appendChild(formDesc);
    
    // Create input fields for each required filter
    const inputsContainer = document.createElement('div');
    inputsContainer.className = 'filter-inputs-container';
    
    requiredFilters.forEach(filter => {
      const filterGroup = document.createElement('div');
      filterGroup.className = 'filter-input-group';
      
      const filterLabel = document.createElement('label');
      filterLabel.setAttribute('for', `filter-${filter}`);
      
      // Use human-readable labels
      if (filter === 'studentId') {
        filterLabel.textContent = 'Student ID:';
      } else if (filter === 'academicYear') {
        filterLabel.textContent = 'Academic Year:';
      } else {
        filterLabel.textContent = `${filter}:`;
      }
      
      filterGroup.appendChild(filterLabel);
      
      const filterInput = document.createElement('input');
      filterInput.type = 'text';
      filterInput.id = `filter-${filter}`;
      filterInput.className = 'generation-filter-input';
      filterInput.setAttribute('data-filter', filter);
      filterInput.required = true;
      
      // Add placeholder based on filter type
      if (filter === 'studentId') {
        filterInput.placeholder = 'Enter Student ID';
      } else if (filter === 'academicYear') {
        filterInput.placeholder = 'Enter Academic Year (e.g. 2023-2024)';
      }
      
      filterGroup.appendChild(filterInput);
      inputsContainer.appendChild(filterGroup);
    });
    
    filtersForm.appendChild(inputsContainer);
    
    // Add a generate button
    const generateButton = document.createElement('button');
    generateButton.className = 'btn btn-primary';
    generateButton.id = 'generateButton';
    generateButton.textContent = 'Generate References';
    generateButton.addEventListener('click', generateReferences);
    
    filtersForm.appendChild(generateButton);
    
    container.appendChild(filtersForm);
    
    // Add a div for displaying the generated references
    const referencesContainer = document.createElement('div');
    referencesContainer.id = 'referencesContainer';
    referencesContainer.className = 'references-container';
    referencesContainer.style.display = 'none'; // Initially hidden
    container.appendChild(referencesContainer);
  } else {
    // If no required filters, show references directly
    displayReferences(container, {});
  }
  
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

// Function to handle the generation of references based on filter inputs
function generateReferences() {
  // Collect values from the filter inputs
  const filterValues = {};
  const inputs = document.querySelectorAll('.generation-filter-input');
  let allValid = true;
  
  inputs.forEach(input => {
    const filter = input.getAttribute('data-filter');
    const value = input.value.trim();
    
    if (!value) {
      input.classList.add('input-error');
      allValid = false;
    } else {
      input.classList.remove('input-error');
      filterValues[filter] = value;
    }
  });
  
  if (!allValid) {
    alert('Please fill in all required filter values.');
    return;
  }
  
  // Display the references with the filter values
  const referencesContainer = document.getElementById('referencesContainer');
  referencesContainer.innerHTML = ''; // Clear any existing content
  referencesContainer.style.display = 'block';
  
  // Hide the filters form
  const filtersForm = document.querySelector('.generation-filters-form');
  if (filtersForm) {
    filtersForm.style.display = 'none';
  }
  
  displayReferences(referencesContainer, filterValues);
}

// Function to display the references based on filter values
function displayReferences(container, filterValues) {
  // Display the filter values that were entered
  if (Object.keys(filterValues).length > 0) {
    const filterInfo = document.createElement('div');
    filterInfo.className = 'generation-filter-info';
    
    let filterInfoContent = '<h4>Applied Filters:</h4><ul>';
    
    Object.entries(filterValues).forEach(([filter, value]) => {
      let filterLabel = filter;
      // Use human-readable labels
      if (filter === 'studentId') filterLabel = 'Student ID';
      if (filter === 'academicYear') filterLabel = 'Academic Year';
      
      filterInfoContent += `<li><strong>${filterLabel}:</strong> ${value}</li>`;
    });
    
    filterInfoContent += '</ul>';
    filterInfoContent += '<p class="note">Note: The data shown below is filtered according to these criteria.</p>';
    
    filterInfo.innerHTML = filterInfoContent;
    container.appendChild(filterInfo);
  }
  
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
    
    // Full Sample Data
    const sampleSection = document.createElement('div');
    sampleSection.className = 'sample-section';
    
    const sampleTitle = document.createElement('h4');
    sampleTitle.textContent = 'Full Data Structure:';
    sampleSection.appendChild(sampleTitle);
    
    const sampleValue = document.createElement('pre');
    sampleValue.className = 'sample-value';
    if (processedDataset.jsonReference && processedDataset.jsonReference.sampleData) {
      // Show the full data structure, not just a sample
      sampleValue.textContent = JSON.stringify(processedDataset.jsonReference.sampleData, null, 2);
    } else {
      sampleValue.textContent = 'No data available';
    }
    sampleSection.appendChild(sampleValue);
    
    jsonCard.appendChild(sampleSection);
    
    jsonGrid.appendChild(jsonCard);
  });
  
  container.appendChild(jsonGrid);
}