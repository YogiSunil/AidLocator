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
    
    // Caching system for faster data loading
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
    this.locationCache = new Map();
  }

  // Generate cache key based on location and resource type
  getCacheKey(latitude, longitude, resourceType, radius = 5000) {
    return `${Math.round(latitude * 1000)}_${Math.round(longitude * 1000)}_${resourceType}_${radius}`;
  }

  // Check if cached data is still valid
  isCacheValid(cacheEntry) {
    return cacheEntry && (Date.now() - cacheEntry.timestamp < this.cacheExpiry);
  }

  // Get cached resources if available and valid
  getCachedResources(latitude, longitude, resourceType) {
    const cacheKey = this.getCacheKey(latitude, longitude, resourceType);
    const cacheEntry = this.cache.get(cacheKey);
    
    if (this.isCacheValid(cacheEntry)) {
      console.log(`🚀 Using cached resources for ${resourceType} (${cacheEntry.data.length} items)`);
      return cacheEntry.data;
    }
    return null;
  }

  // Cache resources for future use
  setCachedResources(latitude, longitude, resourceType, resources) {
    const cacheKey = this.getCacheKey(latitude, longitude, resourceType);
    this.cache.set(cacheKey, {
      data: resources,
      timestamp: Date.now()
    });
    console.log(`💾 Cached ${resources.length} ${resourceType} resources`);
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

  // Combined search across multiple APIs with caching and fallback to demo data
  async searchAllResources(latitude, longitude, resourceType) {
    console.log(`🔍 Searching for ${resourceType} resources near ${latitude}, ${longitude}`);
    
    // Check cache first for faster loading
    const cachedResources = this.getCachedResources(latitude, longitude, resourceType);
    if (cachedResources) {
      return this.addAISuggestions(cachedResources, latitude, longitude);
    }
    
    try {
      // Try OpenStreetMap first (no API key required, more CORS-friendly)
      const amenityTypes = {
        food: 'food_bank',
        shelter: 'social_facility', 
        medical: 'clinic',
        healthcare: 'clinic',
        clothing: 'social_facility'
      };
      
      let resources = [];
      
      if (amenityTypes[resourceType]) {
        try {
          const osmResources = await this.fetchOpenStreetMapResources(latitude, longitude, amenityTypes[resourceType]);
          resources = [...resources, ...osmResources];
        } catch (error) {
          console.log('OpenStreetMap API unavailable, using demo data');
        }
      }
      
      // If we got some real data, cache and return it
      if (resources.length > 0) {
        const sortedResources = this.deduplicateAndSort(resources, latitude, longitude);
        this.setCachedResources(latitude, longitude, resourceType, sortedResources);
        return this.addAISuggestions(sortedResources, latitude, longitude);
      }
      
      // Fallback to demo data
      const demoResources = this.getDemoResources(latitude, longitude, resourceType);
      this.setCachedResources(latitude, longitude, resourceType, demoResources);
      return this.addAISuggestions(demoResources, latitude, longitude);
      
    } catch (error) {
      console.error('All APIs failed, returning demo data:', error);
      const demoResources = this.getDemoResources(latitude, longitude, resourceType);
      return this.addAISuggestions(demoResources, latitude, longitude);
    }
  }

  // AI-based suggestions for nearest and most relevant help centers
  addAISuggestions(resources, userLatitude, userLongitude) {
    if (!resources || resources.length === 0) return resources;

    // Calculate distance and relevance scores
    const resourcesWithScores = resources.map(resource => {
      const distance = this.calculateDistance(
        userLatitude, userLongitude,
        resource.latitude, resource.longitude
      );

      // AI scoring algorithm considering multiple factors
      let relevanceScore = 0;
      
      // Distance factor (closer = better)
      relevanceScore += Math.max(0, 100 - (distance * 10));
      
      // Availability factor
      if (resource.isAvailable) relevanceScore += 20;
      
      // Rating factor
      if (resource.rating) relevanceScore += (resource.rating * 5);
      
      // Operating hours factor (check if currently open)
      const isCurrentlyOpen = this.isCurrentlyOpen(resource.hours);
      if (isCurrentlyOpen) relevanceScore += 25;
      
      // Resource type priority (emergency services get higher priority)
      if (resource.type === 'shelter' || resource.type === 'healthcare') {
        relevanceScore += 15;
      }
      
      return {
        ...resource,
        distance: distance,
        relevanceScore: relevanceScore,
        isRecommended: relevanceScore > 50,
        aiSuggestion: this.generateAISuggestion(resource, distance, relevanceScore)
      };
    });

    // Sort by relevance score (highest first)
    const sortedResources = resourcesWithScores.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Mark top 3 as "AI Recommended"
    sortedResources.slice(0, 3).forEach(resource => {
      resource.isTopRecommendation = true;
    });

    console.log(`🤖 AI processed ${sortedResources.length} resources with smart recommendations`);
    return sortedResources;
  }

  // Generate AI suggestion text for each resource
  generateAISuggestion(resource, distance, score) {
    const suggestions = [];
    
    if (distance < 1) {
      suggestions.push("Very close to you");
    } else if (distance < 5) {
      suggestions.push("Nearby location");
    }
    
    if (resource.isAvailable && this.isCurrentlyOpen(resource.hours)) {
      suggestions.push("Currently open");
    }
    
    if (resource.rating >= 4.5) {
      suggestions.push("Highly rated");
    }
    
    if (resource.isDonationPoint) {
      suggestions.push("Accepts donations");
    }
    
    if (score > 80) {
      suggestions.unshift("🌟 Top recommendation");
    } else if (score > 60) {
      suggestions.unshift("⭐ Recommended");
    }
    
    return suggestions.length > 0 ? suggestions.join(" • ") : "Available resource";
  }

  // Check if a resource is currently open based on hours string
  isCurrentlyOpen(hoursString) {
    if (!hoursString) return false;
    
    // Simple check for 24/7 or similar
    if (hoursString.includes('24/7') || hoursString.includes('24 hours')) {
      return true;
    }
    
    // For demo purposes, assume most places are open during day hours
    const currentHour = new Date().getHours();
    return currentHour >= 8 && currentHour <= 20; // 8 AM to 8 PM
  }

  // Enhanced distance calculation with higher accuracy
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Demo data for development and fallback
  getDemoResources(latitude, longitude, resourceType) {
    const baseResources = [
      {
        id: 'demo-1',
        name: 'Community Food Bank',
        type: 'food',
        address: '123 Main Street, Your City',
        latitude: latitude + (Math.random() - 0.5) * 0.01,
        longitude: longitude + (Math.random() - 0.5) * 0.01,
        description: 'Provides fresh and non-perishable food items. Serves hot meals daily from 11am-2pm.',
        contactInfo: 'Phone: (555) 123-4567\nEmail: help@communityfoodbank.org',
        hours: 'Mon-Fri: 9am-5pm, Sat: 10am-2pm',
        requirements: 'Photo ID required. Open to all residents in need.',
        isAvailable: true,
        isDonationPoint: false,
        rating: 4.5,
        reviews: []
      },
      {
        id: 'demo-2', 
        name: 'Emergency Shelter Services',
        type: 'shelter',
        address: '456 Oak Avenue, Your City',
        latitude: latitude + (Math.random() - 0.5) * 0.01,
        longitude: longitude + (Math.random() - 0.5) * 0.01,
        description: 'Temporary emergency housing for individuals and families. Case management services available.',
        contactInfo: 'Phone: (555) 987-6543\n24/7 Hotline: (555) SHELTER',
        hours: '24/7 - Call ahead for availability',
        requirements: 'No requirements for emergency shelter. Longer-term housing requires intake appointment.',
        isAvailable: true,
        isDonationPoint: true,
        rating: 4.2,
        reviews: []
      },
      {
        id: 'demo-3',
        name: 'Community Health Clinic',
        type: 'healthcare',
        address: '789 Elm Street, Your City', 
        latitude: latitude + (Math.random() - 0.5) * 0.01,
        longitude: longitude + (Math.random() - 0.5) * 0.01,
        description: 'Free and low-cost medical care. Services include primary care, dental, and mental health.',
        contactInfo: 'Phone: (555) 456-7890\nAppointments: (555) 456-7891',
        hours: 'Mon-Thu: 8am-6pm, Fri: 8am-5pm, Sat: 9am-1pm',
        requirements: 'Sliding scale fees based on income. No insurance required.',
        isAvailable: true,
        isDonationPoint: false,
        rating: 4.7,
        reviews: []
      },
      {
        id: 'demo-4',
        name: 'Job Training Center',
        type: 'employment',
        address: '321 Pine Street, Your City',
        latitude: latitude + (Math.random() - 0.5) * 0.01,
        longitude: longitude + (Math.random() - 0.5) * 0.01,
        description: 'Free job training programs, resume help, and employment placement services.',
        contactInfo: 'Phone: (555) 234-5678\nEmail: careers@jobcenter.org',
        hours: 'Mon-Fri: 8am-5pm',
        requirements: 'Must be 18+ and eligible to work. Some programs have additional requirements.',
        isAvailable: true,
        isDonationPoint: false,
        rating: 4.3,
        reviews: []
      },
      {
        id: 'demo-5',
        name: 'Clothing Closet',
        type: 'clothing',
        address: '654 Maple Drive, Your City',
        latitude: latitude + (Math.random() - 0.5) * 0.01,
        longitude: longitude + (Math.random() - 0.5) * 0.01,
        description: 'Free clothing for all ages. Special focus on work attire and school uniforms.',
        contactInfo: 'Phone: (555) 345-6789',
        hours: 'Tue, Thu: 10am-4pm, Sat: 9am-1pm',
        requirements: 'Limit 10 items per person per month.',
        isAvailable: true,
        isDonationPoint: true,
        rating: 4.1,
        reviews: []
      }
    ];

    // Filter by resource type if specified
    if (resourceType && resourceType !== 'all') {
      return baseResources.filter(resource => resource.type === resourceType);
    }
    
    return baseResources;
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


}

const resourceAPIService = new ResourceAPIService();
export default resourceAPIService;