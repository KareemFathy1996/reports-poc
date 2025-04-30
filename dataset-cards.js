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