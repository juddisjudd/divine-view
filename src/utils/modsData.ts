export interface ModData {
  name: string;
  tier: string;
  text: string;
  generationType: 'prefix' | 'suffix';
  requiredLevel: number;
  spawnWeights: string[];
}

// Parse CSV data to extract mod information
export const parseModsCSV = (csvContent: string): ModData[] => {
  const lines = csvContent.split('\n');
  const data: ModData[] = [];
  
  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma, but handle quoted values properly
    const columns = parseCSVLine(line);
    if (columns.length < 6) continue;
    
    const name = columns[0].trim();
    const tier = columns[1].trim();
    const text = columns[2].trim();
    const generationType = columns[3].trim();
    const requiredLevel = parseInt(columns[4]) || 1;
    const spawnWeightsStr = columns[5].trim();
    
    // Skip if any required field is missing
    if (!name || !generationType) continue;
    if (generationType !== 'prefix' && generationType !== 'suffix') continue;
    
    // Parse spawn weights
    const spawnWeights = parseSpawnWeights(spawnWeightsStr);
    
    data.push({
      name,
      tier,
      text,
      generationType: generationType as 'prefix' | 'suffix',
      requiredLevel,
      spawnWeights,
    });
  }
  
  return data;
};

// Parse a CSV line handling quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

// Parse spawn weights string into array
const parseSpawnWeights = (spawnWeightsStr: string): string[] => {
  // Remove quotes if present
  const cleaned = spawnWeightsStr.replace(/^"|"$/g, '');
  
  if (!cleaned || cleaned.toLowerCase() === 'unknown') {
    return [];
  }
  
  // Split by comma and clean up each weight
  return cleaned.split(',').map(weight => weight.trim()).filter(Boolean);
};

// Check if a mod can spawn on a specific item type
export const canModSpawnOnItem = (mod: ModData, itemClass: string, baseType?: string): boolean => {
  if (mod.spawnWeights.length === 0) {
    return false; // Unknown spawn weights, skip
  }
  
  // Check for "All Gear Items" which applies to everything
  if (mod.spawnWeights.some(weight => weight === 'All Gear Items')) {
    return true;
  }
  
  // Map item classes to spawn weight categories
  const classToSpawnWeight = mapItemClassToSpawnWeight(itemClass);
  
  // Check if any of the mod's spawn weights match the item
  return mod.spawnWeights.some(weight => {
    // Direct class match
    if (classToSpawnWeight.includes(weight)) {
      return true;
    }
    
    // Check for base type specific matches (if provided)
    if (baseType && weight.toLowerCase().includes(baseType.toLowerCase())) {
      return true;
    }
    
    return false;
  });
};

// Map PoE2 item classes to spawn weight categories
const mapItemClassToSpawnWeight = (itemClass: string): string[] => {
  const mappings: Record<string, string[]> = {
    'Amulets': ['Amulet', 'All Gear Items'],
    'Rings': ['Ring', 'All Gear Items'],
    'Body Armours': ['Body Armour', 'All Gear Items'],
    'Helmets': ['Helmet', 'All Gear Items'],
    'Gloves': ['Gloves', 'All Gear Items'],
    'Boots': ['Boots', 'All Gear Items'],
    'Shields': ['Shield', 'All Gear Items'],
    'Belts': ['Belt', 'All Gear Items'],
    'Bows': ['Bow', 'All Gear Items'],
    'Crossbows': ['Crossbow', 'All Gear Items'],
    'Wands': ['Wand', 'All Gear Items'],
    'Staves': ['Staff', 'All Gear Items'],
    'Quarterstaves': ['Quarterstaff', 'Staff', 'All Gear Items'],
    'Foci': ['Focus', 'All Gear Items'],
    'One Hand Maces': ['Mace', 'All Gear Items'],
    'Two Hand Maces': ['Mace', 'All Gear Items'],
    'Sceptres': ['Sceptre', 'All Gear Items'],
    'Jewels': ['Jewel', 'All Gear Items'],
    'Charms': ['Charm', 'All Gear Items'],
    'Socketable': ['Abyss-Jewel-Melee', 'Abyss-Jewel-Ranged', 'Abyss-Jewel-Caster', 'All Gear Items'],
    // Add weapon subcategories
    'Swords': ['Sword', 'All Gear Items'],
    'Axes': ['Axe', 'All Gear Items'],
    'Claws': ['Claw', 'All Gear Items'],
    'Daggers': ['Dagger', 'All Gear Items'],
  };
  
  return mappings[itemClass] || ['All Gear Items'];
};

// Filter mods by required level
export const filterModsByLevel = (mods: ModData[], itemLevel: number): ModData[] => {
  return mods.filter(mod => mod.requiredLevel <= itemLevel);
};

// Get available prefixes for an item
export const getAvailablePrefixes = (mods: ModData[], itemClass: string, itemLevel: number, baseType?: string): ModData[] => {
  return mods
    .filter(mod => mod.generationType === 'prefix')
    .filter(mod => canModSpawnOnItem(mod, itemClass, baseType))
    .filter(mod => mod.requiredLevel <= itemLevel);
};

// Get available suffixes for an item
export const getAvailableSuffixes = (mods: ModData[], itemClass: string, itemLevel: number, baseType?: string): ModData[] => {
  return mods
    .filter(mod => mod.generationType === 'suffix')
    .filter(mod => canModSpawnOnItem(mod, itemClass, baseType))
    .filter(mod => mod.requiredLevel <= itemLevel);
};

// Select random mods based on rarity
export const selectRandomMods = (
  prefixes: ModData[], 
  suffixes: ModData[], 
  rarity: 'Normal' | 'Magic' | 'Rare' | 'Unique'
): { prefix?: string; suffix?: string } => {
  const result: { prefix?: string; suffix?: string } = {};
  
  switch (rarity) {
    case 'Normal':
      // No mods
      break;
      
    case 'Magic':
      // 1 mod (either prefix or suffix)
      const magicMods = [...prefixes, ...suffixes];
      if (magicMods.length > 0) {
        const randomMod = magicMods[Math.floor(Math.random() * magicMods.length)];
        if (randomMod.generationType === 'prefix') {
          result.prefix = randomMod.name;
        } else {
          result.suffix = randomMod.name;
        }
      }
      break;
      
    case 'Rare':
      // Multiple mods (1-2 prefixes, 1-2 suffixes)
      if (prefixes.length > 0 && Math.random() > 0.3) {
        result.prefix = prefixes[Math.floor(Math.random() * prefixes.length)].name;
      }
      if (suffixes.length > 0 && Math.random() > 0.3) {
        result.suffix = suffixes[Math.floor(Math.random() * suffixes.length)].name;
      }
      break;
      
    case 'Unique':
      // Unique items have fixed mods, but we'll treat them like rare for simulation
      if (prefixes.length > 0) {
        result.prefix = prefixes[Math.floor(Math.random() * prefixes.length)].name;
      }
      if (suffixes.length > 0) {
        result.suffix = suffixes[Math.floor(Math.random() * suffixes.length)].name;
      }
      break;
  }
  
  return result;
};