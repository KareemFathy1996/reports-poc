function generateFieldReferences(dataset) {
  // If dataset already has field references, return it
  if (dataset.jsonReference?.fieldReferences?.length > 0) {
    return dataset;
  }

  // Ensure jsonReference exists
  if (!dataset.jsonReference) {
    dataset.jsonReference = {
      placeholder: `{{DATASET_${dataset.id}_DATA}}`,
      sampleData: [],
      fieldReferences: []
    };
    return dataset; // Return early if no sample data can exist
  }

  // Ensure sampleData exists and is valid
  if (!dataset.jsonReference.sampleData || !Array.isArray(dataset.jsonReference.sampleData)) {
    dataset.jsonReference.sampleData = [];
    dataset.jsonReference.fieldReferences = [];
    return dataset;
  }

  const sampleData = dataset.jsonReference.sampleData;
  const placeholder = dataset.jsonReference.placeholder || `{{DATASET_${dataset.id}_DATA}}`;
  const fieldReferences = [];

  // Process sample data if it exists
  if (sampleData.length > 0) {
    const sample = sampleData[0];
    
    // Safely get object keys
    const keys = sample ? Object.keys(sample) : [];
    
    keys.forEach(key => {
      // Create reference for the top-level property
      const path = `{{${placeholder.replace(/[{}]/g, '')}[0].${key}}`;
      const description = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      
      fieldReferences.push({ path, description });

      // Handle nested properties if they exist
      if (sample[key] && typeof sample[key] === 'object') {
        if (Array.isArray(sample[key])) {
          // Handle array items
          if (sample[key].length > 0) {
            const firstItem = sample[key][0];
            
            if (typeof firstItem === 'object') {
              // Handle array of objects
              Object.keys(firstItem).forEach(subKey => {
                const subPath = `{{${placeholder.replace(/[{}]/g, '')}[0].${key}[0].${subKey}}`;
                const subDesc = `${key.replace(/_/g, ' ')} ${subKey.replace(/_/g, ' ')}`
                  .replace(/\b\w/g, c => c.toUpperCase());
                
                fieldReferences.push({ path: subPath, description: subDesc });
              });
            } else {
              // Handle array of primitives
              const arrPath = `{{${placeholder.replace(/[{}]/g, '')}[0].${key}[0]}}`;
              const arrDesc = `First ${key.replace(/_/g, ' ')}`.replace(/\b\w/g, c => c.toUpperCase());
              fieldReferences.push({ path: arrPath, description: arrDesc });
            }
          }
        } else {
          // Handle plain nested objects
          Object.keys(sample[key]).forEach(subKey => {
            const subPath = `{{${placeholder.replace(/[{}]/g, '')}[0].${key}.${subKey}}}`;
            const subDesc = `${key.replace(/_/g, ' ')} ${subKey.replace(/_/g, ' ')}`
              .replace(/\b\w/g, c => c.toUpperCase());
            
            fieldReferences.push({ path: subPath, description: subDesc });
          });
        }
      }
    });
  }

  // Ensure fieldReferences exists on the jsonReference object
  dataset.jsonReference.fieldReferences = fieldReferences;
  return dataset;
}