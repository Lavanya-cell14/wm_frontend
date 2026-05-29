// Zone classification mapping for consistent enterprise labeling
// Maps simple zone names to descriptive labels

export const zoneMapping = {
  'Zone A': 'Fast Moving Storage',
  'Zone B': 'Electronics Storage',
  'Zone C': 'Bulk Storage',
  'Zone D': 'Cold Storage'
};

export const getZoneLabel = (zoneName) => {
  return zoneMapping[zoneName] || zoneName;
};

export const getZoneId = (zoneName) => {
  // Map zone names back to IDs if needed
  const idMapping = {
    'Zone A': 'ZONE-Z1',
    'Zone B': 'ZONE-Z2',
    'Zone C': 'ZONE-Z3',
    'Zone D': 'ZONE-Z4'
  };
  return idMapping[zoneName] || zoneName;
};
