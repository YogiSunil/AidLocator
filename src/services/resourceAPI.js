// Real API Integration Service for AidLocator
class ResourceAPIService {
  constructor() {
    this.apiKeys = {
      findhelp: process.env.REACT_APP_FINDHELP_API_KEY,
      twoOneOne: process.env.REACT_APP_211_API_KEY,
      // OpenStreetMap APIs are free and don't require API keys!
    };
    this.baseUrls = {
      findhelp: 'https://api.findhelp.com/v1',
      nominatim: 'https://nominatim.openstreetmap.org',
      overpass: 'https://overpass-api.de/api/interpreter',
      twoOneOne: 'https://api.211.org',
      hrsa: 'https://findahealthcenter.hrsa.gov/api'
    };
  }

  // 211 API - Official social services database
  async fetch211Resources(latitude, longitude, serviceType = 'food') {
    try {
      const response = await fetch(
        `${this.baseUrls.twoOneOne}/search?latitude=${latitude}&longitude=${longitude}&radius=5&service_type=${serviceType}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.twoOneOne}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) throw new Error(`211 API Error: ${response.status}`);
      
      const data = await response.json();
      return this.normalize211Data(data);
    } catch (error) {
      console.error('211 API Error:', error);
      return [];
    }
  }

  // Findhelp.org API - Comprehensive resource directory
  async fetchFindHelpResources(zipCode, category) {
    try {
      const response = await fetch(
        `${this.baseUrls.findhelp}/search?zip_code=${zipCode}&category=${category}&per_page=50`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKeys.findhelp}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error(`FindHelp API Error: ${response.status}`);
      
      const data = await response.json();
      return this.normalizeFindHelpData(data);
    } catch (error) {
      console.error('FindHelp API Error:', error);
      return [];
    }
  }

  // OpenStreetMap Overpass API - Find amenities and services
  async fetchOpenStreetMapResources(latitude, longitude, amenityType, radius = 5000) {
    try {
      // Overpass API query to find specific amenities within radius
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="${amenityType}"](around:${radius},${latitude},${longitude});
          way["amenity"="${amenityType}"](around:${radius},${latitude},${longitude});
          relation["amenity"="${amenityType}"](around:${radius},${latitude},${longitude});
        );
        out geom;
      `;

      const response = await fetch(this.baseUrls.overpass, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: overpassQuery
      });

      if (!response.ok) throw new Error(`OpenStreetMap Overpass API Error: ${response.status}`);
      
      const data = await response.json();
      return await this.normalizeOpenStreetMapData(data, amenityType);
    } catch (error) {
      console.error('OpenStreetMap Overpass API Error:', error);
      return [];
    }
  }

  // OpenStreetMap Nominatim API - Search for places by name/type
  async fetchNominatimSearch(latitude, longitude, searchQuery, radius = 5000) {
    try {
      const response = await fetch(
        `${this.baseUrls.nominatim}/search?format=json&q=${encodeURIComponent(searchQuery)}&viewbox=${longitude-0.1},${latitude+0.1},${longitude+0.1},${latitude-0.1}&bounded=1&limit=20&addressdetails=1&extratags=1`
      );

      if (!response.ok) throw new Error(`Nominatim API Error: ${response.status}`);
      
      const data = await response.json();
      return this.normalizeNominatimData(data, searchQuery);
    } catch (error) {
      console.error('Nominatim API Error:', error);
      return [];
    }
  }

  // HRSA Health Centers API - Federal health centers
  async fetchHRSAHealthCenters(state, city) {
    try {
      const response = await fetch(
        `${this.baseUrls.hrsa}/health-centers?state=${state}&city=${city}`
      );

      if (!response.ok) throw new Error(`HRSA API Error: ${response.status}`);
      
      const data = await response.json();
      return this.normalizeHRSAData(data);
    } catch (error) {
      console.error('HRSA API Error:', error);
      return [];
    }
  }

  // Combined search across multiple APIs
  async searchAllResources(latitude, longitude, resourceType) {
    const promises = [];
    
    // Search 211 database
    promises.push(this.fetch211Resources(latitude, longitude, resourceType));
    
    // Search OpenStreetMap Overpass API
    const amenityTypes = {
      food: 'food_bank',
      shelter: 'social_facility',
      medical: 'clinic',
      clothing: 'social_facility'
    };
    
    if (amenityTypes[resourceType]) {
      promises.push(this.fetchOpenStreetMapResources(latitude, longitude, amenityTypes[resourceType]));
    }

    // Also search Nominatim for broader results
    const searchQueries = {
      food: 'food bank community kitchen soup kitchen',
      shelter: 'homeless shelter emergency housing',
      medical: 'community health center free clinic',
      clothing: 'clothing donation thrift store'
    };
    
    if (searchQueries[resourceType]) {
      promises.push(this.fetchNominatimSearch(latitude, longitude, searchQueries[resourceType]));
    }

    // If medical, also search HRSA
    if (resourceType === 'medical') {
      // You'd need to reverse geocode lat/lng to get state/city first
      // promises.push(this.fetchHRSAHealthCenters(state, city));
    }

    try {
      const results = await Promise.allSettled(promises);
      const allResources = results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value);
      
      // Remove duplicates and sort by distance
      return this.deduplicateAndSort(allResources, latitude, longitude);
    } catch (error) {
      console.error('Combined search error:', error);
      return [];
    }
  }

  // Data normalization methods
  normalize211Data(apiResponse) {
    return (apiResponse.results || []).map(item => ({
      id: `211_${item.id}`,
      name: item.name,
      type: this.mapServiceType(item.service_type),
      address: `${item.address}, ${item.city}, ${item.state} ${item.zip}`,
      latitude: parseFloat(item.latitude),
      longitude: parseFloat(item.longitude),
      isAvailable: true,
      isDonationPoint: false,
      description: item.description,
      contactInfo: item.phone,
      requirements: item.eligibility,
      hours: item.hours,
      source: '211'
    }));
  }

  normalizeFindHelpData(apiResponse) {
    return (apiResponse.organizations || []).map(org => ({
      id: `findhelp_${org.id}`,
      name: org.name,
      type: this.mapCategoryToType(org.category),
      address: org.address,
      latitude: parseFloat(org.latitude),
      longitude: parseFloat(org.longitude),
      isAvailable: org.is_accepting_new_clients,
      isDonationPoint: org.accepts_donations,
      description: org.description,
      contactInfo: org.phone,
      requirements: org.eligibility_requirements,
      hours: org.hours_of_operation,
      source: 'findhelp'
    }));
  }

  async normalizeOpenStreetMapData(apiResponse, amenityType) {
    const elements = apiResponse.elements || [];
    const resources = [];
    
    for (const element of elements) {
      const tags = element.tags || {};
      const lat = element.lat || (element.center && element.center.lat) || (element.geometry && element.geometry[0] && element.geometry[0].lat);
      const lon = element.lon || (element.center && element.center.lon) || (element.geometry && element.geometry[0] && element.geometry[0].lon);
      
      if (!lat || !lon) continue;
      
      let address = this.buildAddressFromOSM(tags);
      
      // If no address found, try reverse geocoding
      if (!address) {
        address = await this.reverseGeocode(lat, lon);
      }
      
      const resource = {
        id: `osm_${element.type}_${element.id}`,
        name: tags.name || tags.operator || tags.brand || `${amenityType.replace('_', ' ')} facility`,
        type: this.mapAmenityToType(amenityType),
        address: address,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        isAvailable: !tags.closed && tags.opening_hours !== 'closed',
        isDonationPoint: amenityType === 'social_facility' || tags.social_facility === 'donation',
        description: tags.description || tags.social_facility || tags.amenity || `${amenityType.replace('_', ' ')} services`,
        contactInfo: tags.phone || tags['contact:phone'] || tags['phone:mobile'],
        requirements: tags.requirements || (tags.fee === 'no' ? 'Free service' : null),
        hours: tags.opening_hours || tags.service_times,
        website: tags.website || tags['contact:website'],
        source: 'openstreetmap'
      };
      
      resources.push(resource);
    }
    
    return resources;
  }

  normalizeNominatimData(apiResponse, searchQuery) {
    return apiResponse.map(place => ({
      id: `nominatim_${place.place_id}`,
      name: place.display_name.split(',')[0], // First part is usually the name
      type: this.mapNominatimToType(place.type, searchQuery),
      address: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      isAvailable: true, // Assume available unless specified otherwise
      isDonationPoint: searchQuery.includes('donation') || searchQuery.includes('thrift'),
      description: `${place.type} - ${place.class}`,
      contactInfo: null,
      requirements: null,
      hours: null,
      importance: place.importance, // Nominatim provides relevance score
      source: 'nominatim'
    }));
  }

  normalizeHRSAData(apiResponse) {
    return (apiResponse.results || []).map(center => ({
      id: `hrsa_${center.id}`,
      name: center.name,
      type: 'medical',
      address: `${center.address}, ${center.city}, ${center.state} ${center.zip}`,
      latitude: parseFloat(center.latitude),
      longitude: parseFloat(center.longitude),
      isAvailable: true,
      isDonationPoint: false,
      description: 'Federally Qualified Health Center (FQHC)',
      contactInfo: center.phone,
      requirements: 'Sliding fee scale available',
      hours: center.hours,
      source: 'hrsa'
    }));
  }

  // Helper methods
  mapServiceType(serviceType) {
    const mapping = {
      'food': 'food',
      'housing': 'shelter',
      'healthcare': 'medical',
      'clothing': 'clothing',
      'emergency': 'emergency'
    };
    return mapping[serviceType] || 'other';
  }

  mapCategoryToType(category) {
    // Map FindHelp categories to your app's types
    if (category.toLowerCase().includes('food')) return 'food';
    if (category.toLowerCase().includes('housing')) return 'shelter';
    if (category.toLowerCase().includes('health')) return 'medical';
    return 'other';
  }

  mapAmenityToType(amenityType) {
    const mapping = {
      'food_bank': 'food',
      'social_facility': 'shelter',
      'clinic': 'medical',
      'hospital': 'medical',
      'pharmacy': 'medical'
    };
    return mapping[amenityType] || 'other';
  }

  mapNominatimToType(placeType, searchQuery) {
    if (searchQuery.includes('food') || placeType.includes('food')) return 'food';
    if (searchQuery.includes('shelter') || searchQuery.includes('housing')) return 'shelter';
    if (searchQuery.includes('health') || searchQuery.includes('medical') || searchQuery.includes('clinic')) return 'medical';
    if (searchQuery.includes('clothing') || searchQuery.includes('thrift')) return 'clothing';
    return 'other';
  }

  buildAddressFromOSM(tags) {
    const parts = [];
    
    // Try structured address first
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:state']) parts.push(tags['addr:state']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);
    
    // If no structured address, try other address formats
    if (parts.length === 0) {
      if (tags.address) parts.push(tags.address);
      if (tags['addr:full']) parts.push(tags['addr:full']);
      if (tags.location) parts.push(tags.location);
      
      // Try to build from area information
      const areaParts = [];
      if (tags['addr:suburb'] || tags['addr:neighbourhood']) {
        areaParts.push(tags['addr:suburb'] || tags['addr:neighbourhood']);
      }
      if (tags['addr:city'] || tags['addr:town'] || tags['addr:village']) {
        areaParts.push(tags['addr:city'] || tags['addr:town'] || tags['addr:village']);
      }
      if (tags['addr:state'] || tags['addr:province']) {
        areaParts.push(tags['addr:state'] || tags['addr:province']);
      }
      if (tags['addr:country']) {
        areaParts.push(tags['addr:country']);
      }
      
      if (areaParts.length > 0) {
        parts.push(...areaParts);
      }
    }
    
    return parts.length > 0 ? parts.join(', ') : null; // Return null to trigger reverse geocoding
  }

  // Add reverse geocoding for missing addresses
  async reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `${this.baseUrls.nominatim}/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) return 'Address not available';
      
      const data = await response.json();
      return data.display_name || 'Address not available';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Address not available';
    }
  }

  deduplicateAndSort(resources, latitude, longitude) {
    // Remove duplicates based on name and address similarity
    const unique = resources.filter((resource, index, self) => 
      index === self.findIndex(r => 
        r.name === resource.name && 
        Math.abs(r.latitude - resource.latitude) < 0.001
      )
    );

    // Sort by distance
    return unique.sort((a, b) => {
      const distA = this.calculateDistance(latitude, longitude, a.latitude, a.longitude);
      const distB = this.calculateDistance(latitude, longitude, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

const resourceAPIService = new ResourceAPIService();
export default resourceAPIService;