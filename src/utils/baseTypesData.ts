export interface BaseTypeData {
  class: string;
  baseType: string;
  dropLevel: number;
}

// Parse CSV data to extract BaseType information
export const parseBaseTypesCSV = (csvContent: string): BaseTypeData[] => {
  const lines = csvContent.split('\n');
  const data: BaseTypeData[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const columns = line.split(',');
    if (columns.length < 3) continue;
    
    const itemClass = columns[0].trim();
    const baseType = columns[1].trim();
    const dropLevel = parseInt(columns[2]) || 1;
    
    // Skip if any required field is missing
    if (!itemClass || !baseType) continue;
    
    data.push({
      class: itemClass,
      baseType: baseType,
      dropLevel: dropLevel,
    });
  }
  
  return data;
};

// Group base types by class
export const groupBaseTypesByClass = (baseTypes: BaseTypeData[]): Record<string, BaseTypeData[]> => {
  return baseTypes.reduce((groups, item) => {
    if (!groups[item.class]) {
      groups[item.class] = [];
    }
    groups[item.class].push(item);
    return groups;
  }, {} as Record<string, BaseTypeData[]>);
};

// Get unique classes
export const getUniqueClasses = (baseTypes: BaseTypeData[]): string[] => {
  const classes = new Set(baseTypes.map(item => item.class));
  return Array.from(classes).sort();
};

// Get base types for a specific class
export const getBaseTypesForClass = (baseTypes: BaseTypeData[], itemClass: string): BaseTypeData[] => {
  return baseTypes.filter(item => item.class === itemClass).sort((a, b) => a.baseType.localeCompare(b.baseType));
};

// Find a specific base type
export const findBaseType = (baseTypes: BaseTypeData[], itemClass: string, baseTypeName: string): BaseTypeData | undefined => {
  return baseTypes.find(item => item.class === itemClass && item.baseType === baseTypeName);
};