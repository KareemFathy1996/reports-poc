// Global variables to store selected datasets and filters
let selectedDatasets = [];
let selectedFiltersMap = {}; // Map of dataset ID to selected filters

// Function to initialize the dataset grid
function initializeDatasetGrid() {
    const datasetGrid = document.getElementById('datasetGrid');
    datasetGrid.innerHTML = ''; // Clear existing content
    
    datasets.forEach(dataset => {
        const card = createDatasetCard(dataset);
        datasetGrid.appendChild(card);
    });
}

// Function to create a single dataset card
function createDatasetCard(dataset) {
    const card = document.createElement('div');
    card.className = 'dataset-card';
    card.dataset.id = dataset.id;
    
    const title = document.createElement('h3');
    title.textContent = dataset.name;
    
    const description = document.createElement('p');
    description.textContent = dataset.description;
    
    // Academic Years Filter Section
    const academicYearsSection = createFilterSection(
        'Academic Years', 
        dataset.filters.academicYears.required,
        dataset.filters.academicYears.optional,
        'academicYears',
        dataset.id
    );
    
    // User Types Filter Section
    const userTypesSection = createFilterSection(
        'User Types', 
        dataset.filters.userTypes.required,
        dataset.filters.userTypes.optional,
        'userTypes',
        dataset.id
    );
    
    // Button group
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    
    const selectButton = document.createElement('button');
    selectButton.className = 'btn btn-primary dataset-select-btn';
    selectButton.textContent = 'Select Dataset';
    selectButton.dataset.id = dataset.id;
    selectButton.addEventListener('click', (e) => toggleDatasetSelection(e, dataset));
    
    buttonGroup.appendChild(selectButton);
    
    // Append all elements to the card
    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(academicYearsSection);
    card.appendChild(userTypesSection);
    card.appendChild(buttonGroup);
    
    return card;
}

// Function to create a filter section
function createFilterSection(title, requiredFilters, optionalFilters, filterType, datasetId) {
    const section = document.createElement('div');
    section.className = 'filter-section';
    section.dataset.datasetId = datasetId;
    
    const titleElem = document.createElement('span');
    titleElem.className = 'filter-title';
    titleElem.textContent = title;
    
    section.appendChild(titleElem);
    
    // Required filters
    if (requiredFilters.length > 0) {
        const requiredSubtitle = document.createElement('span');
        requiredSubtitle.className = 'filter-subtitle';
        requiredSubtitle.textContent = 'Required (select at least one)';
        requiredSubtitle.innerHTML += '<span class="label-required">*</span>';
        section.appendChild(requiredSubtitle);
        
        const requiredGroup = document.createElement('div');
        requiredGroup.className = 'filter-group';
        
        requiredFilters.forEach(filter => {
            const badge = createFilterBadge(filter, true, filterType, datasetId);
            requiredGroup.appendChild(badge);
        });
        
        section.appendChild(requiredGroup);
    }
    
    // Optional filters
    if (optionalFilters.length > 0) {
        const optionalSubtitle = document.createElement('span');
        optionalSubtitle.className = 'filter-subtitle';
        optionalSubtitle.textContent = 'Optional';
        section.appendChild(optionalSubtitle);
        
        const optionalGroup = document.createElement('div');
        optionalGroup.className = 'filter-group';
        
        optionalFilters.forEach(filter => {
            const badge = createFilterBadge(filter, false, filterType, datasetId);
            optionalGroup.appendChild(badge);
        });
        
        section.appendChild(optionalGroup);
    }
    
    return section;
}

// Function to create a filter badge
function createFilterBadge(filterName, isRequired, filterType, datasetId) {
    const badge = document.createElement('span');
    badge.className = isRequired ? 'filter-badge required' : 'filter-badge';
    badge.textContent = filterName;
    badge.dataset.filter = filterName;
    badge.dataset.type = filterType;
    badge.dataset.required = isRequired;
    badge.dataset.datasetId = datasetId;
    
    badge.addEventListener('click', () => toggleFilter(badge, filterName, filterType, isRequired, datasetId));
    
    return badge;
}

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

// Function to toggle dataset selection
function toggleDatasetSelection(event, dataset) {
    const button = event.target;
    const card = button.closest('.dataset-card');
    const isSelected = selectedDatasets.some(ds => ds.id === dataset.id);
    
    if (isSelected) {
        // Deselect the dataset
        selectedDatasets = selectedDatasets.filter(ds => ds.id !== dataset.id);
        delete selectedFiltersMap[dataset.id];
        
        // Reset the card style
        card.style.borderColor = 'var(--border-color)';
        card.style.boxShadow = 'none';
        button.textContent = 'Select Dataset';
        button.classList.remove('selected');
        
        // Reset filter selections for this dataset
        card.querySelectorAll('.filter-badge.selected').forEach(badge => {
            if (parseInt(badge.dataset.datasetId) === dataset.id) {
                badge.classList.remove('selected');
            }
        });
        
        showMessage(`Dataset "${dataset.name}" removed from selection.`, 'success');
    } else {
        // Select the dataset - use the original dataset object from the datasets array
        // to ensure all properties are included
        const originalDataset = datasets.find(d => d.id === dataset.id);
        selectedDatasets.push(originalDataset);
        selectedFiltersMap[dataset.id] = {
            academicYears: [],
            userTypes: []
        };
        
        // Highlight the selected dataset card
        card.style.borderColor = 'var(--primary-color)';
        card.style.boxShadow = '0 0 0 2px rgba(74, 107, 175, 0.2)';
        button.textContent = 'Deselect Dataset';
        button.classList.add('selected');
        
        showMessage(`Dataset "${dataset.name}" selected. Please select the required filters.`, 'success');
    }
    
    updateSelectionSummary();
}

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

// Function to display the JSON references screen
function showJsonReferences() {
    const container = document.querySelector('.container');
    container.innerHTML = '';
    
    const header = document.createElement('h1');
    header.textContent = 'Dataset JSON References';
    container.appendChild(header);
    
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
    
    console.log("Complete selected datasets:", completeSelectedDatasets);
    
    completeSelectedDatasets.forEach(dataset => {
        const jsonCard = document.createElement('div');
        jsonCard.className = 'json-card';
        
        const title = document.createElement('h3');
        title.textContent = dataset.name;
        jsonCard.appendChild(title);
        
        // Selected filters summary
        const filters = selectedFiltersMap[dataset.id] || { academicYears: [], userTypes: [] };
        
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
        if (dataset.jsonReference && dataset.jsonReference.fieldReferences) {
            console.log(`Field references for ${dataset.name}:`, dataset.jsonReference.fieldReferences);
            
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
            const fieldRefs = dataset.jsonReference.fieldReferences;
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
        if (dataset.jsonReference && dataset.jsonReference.sampleData) {
            console.log(`Sample data for ${dataset.name}:`, dataset.jsonReference.sampleData);
            sampleValue.textContent = JSON.stringify(dataset.jsonReference.sampleData, null, 2);
        } else {
            sampleValue.textContent = 'No sample data available';
        }
        sampleSection.appendChild(sampleValue);
        
        jsonCard.appendChild(sampleSection);
        
        jsonGrid.appendChild(jsonCard);
    });
    
    container.appendChild(jsonGrid);
    
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

// Function to display messages
function showMessage(text, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeDatasetGrid();
});