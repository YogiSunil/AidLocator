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

  // OpenStreetMap Overpass API - Find amenities and services with comprehensive search
  async fetchOpenStreetMapResources(latitude, longitude, amenityType, radius = 5000) {
    try {
      let overpassQuery;
      
      if (amenityType === 'social_facility') {
        // Comprehensive search for all social facilities and related services
        overpassQuery = `
          [out:json][timeout:25];
          (
            node["amenity"="social_facility"](around:${radius},${latitude},${longitude});
            node["amenity"="community_centre"](around:${radius},${latitude},${longitude});
            node["social_facility"](around:${radius},${latitude},${longitude});
            node["amenity"="food_bank"](around:${radius},${latitude},${longitude});
            node["social_facility:for"~"homeless|poor|unemployed|senior|child"](around:${radius},${latitude},${longitude});
            way["amenity"="social_facility"](around:${radius},${latitude},${longitude});
            way["social_facility"](around:${radius},${latitude},${longitude});
            way["amenity"="food_bank"](around:${radius},${latitude},${longitude});
            way["amenity"="community_centre"](around:${radius},${latitude},${longitude});
            relation["amenity"="social_facility"](around:${radius},${latitude},${longitude});
          );
          out geom;
        `;
      } else if (amenityType === 'clinic') {
        // Comprehensive healthcare search
        overpassQuery = `
          [out:json][timeout:25];
          (
            node["amenity"="clinic"](around:${radius},${latitude},${longitude});
            node["amenity"="hospital"](around:${radius},${latitude},${longitude});
            node["amenity"="pharmacy"](around:${radius},${latitude},${longitude});
            node["amenity"="doctors"](around:${radius},${latitude},${longitude});
            node["healthcare"="clinic"](around:${radius},${latitude},${longitude});
            node["healthcare"="community_health_centre"](around:${radius},${latitude},${longitude});
            node["healthcare"="centre"](around:${radius},${latitude},${longitude});
            way["amenity"="clinic"](around:${radius},${latitude},${longitude});
            way["healthcare"="clinic"](around:${radius},${latitude},${longitude});
            way["amenity"="hospital"](around:${radius},${latitude},${longitude});
            relation["amenity"="clinic"](around:${radius},${latitude},${longitude});
          );
          out geom;
        `;
      } else if (amenityType === 'shop') {
        // Search for thrift stores and charity shops for clothing
        overpassQuery = `
          [out:json][timeout:25];
          (
            node["shop"="charity"](around:${radius},${latitude},${longitude});
            node["shop"="second_hand"](around:${radius},${latitude},${longitude});
            node["shop"="clothes"]["second_hand"="yes"](around:${radius},${latitude},${longitude});
            node["operator"~"salvation|goodwill|thrift"](around:${radius},${latitude},${longitude});
            way["shop"="charity"](around:${radius},${latitude},${longitude});
            way["shop"="second_hand"](around:${radius},${latitude},${longitude});
            relation["shop"="charity"](around:${radius},${latitude},${longitude});
          );
          out geom;
        `;
      } else if (amenityType === 'amenity') {
        // General amenities search for water, public facilities
        overpassQuery = `
          [out:json][timeout:25];
          (
            node["amenity"="drinking_water"](around:${radius},${latitude},${longitude});
            node["amenity"="water_point"](around:${radius},${latitude},${longitude});
            node["amenity"="fountain"](around:${radius},${latitude},${longitude});
            node["amenity"="toilets"](around:${radius},${latitude},${longitude});
            node["amenity"="public_bath"](around:${radius},${latitude},${longitude});
            way["amenity"="drinking_water"](around:${radius},${latitude},${longitude});
            way["amenity"="water_point"](around:${radius},${latitude},${longitude});
            relation["amenity"="drinking_water"](around:${radius},${latitude},${longitude});
          );
          out geom;
        `;
      } else if (amenityType === 'emergency') {
        // Emergency services search
        overpassQuery = `
          [out:json][timeout:25];
          (
            node["emergency"](around:${radius},${latitude},${longitude});
            node["amenity"="fire_station"](around:${radius},${latitude},${longitude});
            node["amenity"="police"](around:${radius},${latitude},${longitude});
            node["emergency"="emergency_ward_entrance"](around:${radius},${latitude},${longitude});
            way["emergency"](around:${radius},${latitude},${longitude});
            way["amenity"="fire_station"](around:${radius},${latitude},${longitude});
            relation["emergency"](around:${radius},${latitude},${longitude});
          );
          out geom;
        `;
      } else if (amenityType === 'restaurant') {
        // Search for soup kitchens and community dining (often tagged as restaurants)
        overpassQuery = `
          [out:json][timeout:25];
          (
            node["amenity"="restaurant"]["cuisine"="soup_kitchen"](around:${radius},${latitude},${longitude});
            node["amenity"="restaurant"]["name"~"soup|kitchen|community|free"](around:${radius},${latitude},${longitude});
            node["amenity"="fast_food"]["name"~"soup|kitchen|community|free"](around:${radius},${latitude},${longitude});
            way["amenity"="restaurant"]["cuisine"="soup_kitchen"](around:${radius},${latitude},${longitude});
            relation["amenity"="restaurant"]["cuisine"="soup_kitchen"](around:${radius},${latitude},${longitude});
          );
          out geom;
        `;
      } else {
        // Standard single amenity search
        overpassQuery = `
          [out:json][timeout:25];
          (
            node["amenity"="${amenityType}"](around:${radius},${latitude},${longitude});
            way["amenity"="${amenityType}"](around:${radius},${latitude},${longitude});
            relation["amenity"="${amenityType}"](around:${radius},${latitude},${longitude});
          );
          out geom;
        `;
      }

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
    // Check cache first for faster loading
    const cachedResources = this.getCachedResources(latitude, longitude, resourceType);
    if (cachedResources) {
      return this.addAISuggestions(cachedResources, latitude, longitude);
    }
    
    try {
      // Try OpenStreetMap with multiple comprehensive searches
      let resources = [];
      
      try {
        // Multi-source OpenStreetMap search for comprehensive results
        const searchPromises = [];
        
        if (resourceType === 'food') {
          // Food-related searches - comprehensive approach
          searchPromises.push(
            this.fetchOpenStreetMapResources(latitude, longitude, 'food_bank'),
            this.fetchOpenStreetMapResources(latitude, longitude, 'social_facility'),
            this.fetchOpenStreetMapResources(latitude, longitude, 'restaurant'), // Soup kitchens often tagged as restaurants
            this.fetchNominatimSearch(latitude, longitude, 'food bank pantry soup kitchen community kitchen'),
            this.fetchNominatimSearch(latitude, longitude, 'salvation army food distribution'),
            this.fetchNominatimSearch(latitude, longitude, 'church food program community meals')
          );
        } else if (resourceType === 'shelter') {
          // Shelter-related searches
          searchPromises.push(
            this.fetchOpenStreetMapResources(latitude, longitude, 'social_facility'),
            this.fetchOpenStreetMapResources(latitude, longitude, 'tourism'), // Hostels sometimes used as shelters
            this.fetchNominatimSearch(latitude, longitude, 'homeless shelter emergency housing transitional housing'),
            this.fetchNominatimSearch(latitude, longitude, 'salvation army shelter ymca community center'),
            this.fetchNominatimSearch(latitude, longitude, 'women shelter family shelter overnight shelter')
          );
        } else if (resourceType === 'medical' || resourceType === 'healthcare') {
          // Healthcare-related searches
          searchPromises.push(
            this.fetchOpenStreetMapResources(latitude, longitude, 'clinic'),
            this.fetchOpenStreetMapResources(latitude, longitude, 'hospital'),
            this.fetchOpenStreetMapResources(latitude, longitude, 'pharmacy'),
            this.fetchNominatimSearch(latitude, longitude, 'community health center free clinic public health'),
            this.fetchNominatimSearch(latitude, longitude, 'medical clinic urgent care family health'),
            this.fetchNominatimSearch(latitude, longitude, 'dental clinic mental health counseling')
          );
        } else if (resourceType === 'clothing') {
          // Clothing-related searches
          searchPromises.push(
            this.fetchOpenStreetMapResources(latitude, longitude, 'social_facility'),
            this.fetchOpenStreetMapResources(latitude, longitude, 'shop'), // Thrift stores, charity shops
            this.fetchNominatimSearch(latitude, longitude, 'clothing bank thrift store charity shop'),
            this.fetchNominatimSearch(latitude, longitude, 'salvation army goodwill clothing donation'),
            this.fetchNominatimSearch(latitude, longitude, 'clothing closet community closet')
          );
        } else if (resourceType === 'water') {
          // Water-related searches
          searchPromises.push(
            this.fetchOpenStreetMapResources(latitude, longitude, 'amenity'), // Water fountains, taps
            this.fetchNominatimSearch(latitude, longitude, 'water fountain drinking water public water'),
            this.fetchNominatimSearch(latitude, longitude, 'water distribution emergency water'),
            this.fetchNominatimSearch(latitude, longitude, 'community center water access')
          );
        } else if (resourceType === 'emergency') {
          // Emergency services searches
          searchPromises.push(
            this.fetchOpenStreetMapResources(latitude, longitude, 'emergency'),
            this.fetchOpenStreetMapResources(latitude, longitude, 'social_facility'),
            this.fetchNominatimSearch(latitude, longitude, 'emergency services crisis center emergency assistance'),
            this.fetchNominatimSearch(latitude, longitude, 'red cross emergency shelter disaster relief'),
            this.fetchNominatimSearch(latitude, longitude, 'community emergency services crisis support')
          );
        } else {
          // Default: search for all community services
          searchPromises.push(
            this.fetchOpenStreetMapResources(latitude, longitude, 'social_facility'),
            this.fetchOpenStreetMapResources(latitude, longitude, 'community_centre'),
            this.fetchNominatimSearch(latitude, longitude, 'community services social services'),
            this.fetchNominatimSearch(latitude, longitude, 'nonprofit charity community center')
          );
        }
        
        // Execute all searches in parallel
        const allResults = await Promise.all(searchPromises);
        resources = allResults.flat();
        
      } catch (error) {
        console.error('OpenStreetMap API error:', error);
      }
      
      // If we got some real data, cache and return it
      if (resources.length > 0) {
        const sortedResources = this.deduplicateAndSort(resources, latitude, longitude);
        this.setCachedResources(latitude, longitude, resourceType, sortedResources);
        return this.addAISuggestions(sortedResources, latitude, longitude);
      }
      
      // Try to get broader search results if initial search found nothing
      try {
        const broadSearchPromises = [
          this.fetchNominatimSearch(latitude, longitude, 'community services social services'),
          this.fetchNominatimSearch(latitude, longitude, 'nonprofit charity organization'),
          this.fetchNominatimSearch(latitude, longitude, 'public services government assistance')
        ];
        
        const broadResults = await Promise.all(broadSearchPromises);
        const broadResources = broadResults.flat();
        
        if (broadResources.length > 0) {
          const sortedBroadResources = this.deduplicateAndSort(broadResources, latitude, longitude);
          this.setCachedResources(latitude, longitude, resourceType, sortedBroadResources);
          return this.addAISuggestions(sortedBroadResources, latitude, longitude);
        }
      } catch (broadError) {
        console.error('Broad search also failed:', broadError);
      }
      
      // Only return demo data as absolute last resort
      const demoResources = this.getDemoResources(latitude, longitude, resourceType);
      return this.addAISuggestions(demoResources, latitude, longitude);
      
    } catch (error) {
      console.error('All API searches failed:', error);
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
      
      // Smart resource type detection based on tags and content
      let resourceType = this.smartTypeDetection(tags, amenityType);
      
      const resource = {
        id: `osm_${element.type}_${element.id}`,
        name: tags.name || tags.operator || tags.brand || `${amenityType.replace('_', ' ')} facility`,
        type: resourceType,
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
    return apiResponse.map(place => {
      const name = place.display_name.toLowerCase();
      const searchLower = searchQuery.toLowerCase();
      
      // Smart type detection for Nominatim results
      let resourceType = 'other';
      if (searchLower.includes('food') || searchLower.includes('kitchen') || searchLower.includes('pantry') || 
          name.includes('food') || name.includes('kitchen') || name.includes('pantry') || name.includes('meal')) {
        resourceType = 'food';
      } else if (searchLower.includes('shelter') || searchLower.includes('housing') || searchLower.includes('homeless') ||
                 name.includes('shelter') || name.includes('housing') || name.includes('homeless')) {
        resourceType = 'shelter';
      } else if (searchLower.includes('health') || searchLower.includes('medical') || searchLower.includes('clinic') || 
                 searchLower.includes('dental') || name.includes('clinic') || name.includes('hospital') || 
                 name.includes('medical') || name.includes('health')) {
        resourceType = 'medical';
      } else if (searchLower.includes('clothing') || searchLower.includes('thrift') || searchLower.includes('charity') ||
                 name.includes('clothing') || name.includes('thrift') || name.includes('goodwill') || 
                 name.includes('salvation army')) {
        resourceType = 'clothing';
      } else if (searchLower.includes('water') || searchLower.includes('drinking') ||
                 name.includes('water') || name.includes('fountain')) {
        resourceType = 'water';
      } else if (searchLower.includes('emergency') || searchLower.includes('crisis') || searchLower.includes('disaster') ||
                 name.includes('emergency') || name.includes('crisis') || name.includes('fire') || name.includes('police')) {
        resourceType = 'emergency';
      } else if (searchLower.includes('community') || searchLower.includes('social') || searchLower.includes('nonprofit')) {
        // Default community resources to shelter category for now
        resourceType = 'shelter';
      }
      
      return {
        id: `nominatim_${place.place_id}`,
        name: place.display_name.split(',')[0], // First part is usually the name
        type: resourceType,
        address: place.display_name,
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        isAvailable: true, // Assume available unless specified otherwise
        isDonationPoint: searchQuery.includes('donation') || searchQuery.includes('thrift') || name.includes('donation'),
        description: `${place.type} - ${place.class}`,
        contactInfo: null,
        requirements: null,
        hours: null,
        importance: place.importance, // Nominatim provides relevance score
        source: 'nominatim'
      };
    });
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

  // Smart resource type detection based on OpenStreetMap tags
  smartTypeDetection(tags, amenityType) {
    const name = (tags.name || '').toLowerCase();
    const description = (tags.description || '').toLowerCase();
    const socialFacility = tags.social_facility || '';
    const amenity = tags.amenity || '';
    const shop = tags.shop || '';
    const healthcare = tags.healthcare || '';
    
    // Food resources
    if (amenity === 'food_bank' || 
        socialFacility === 'food_bank' || 
        socialFacility === 'soup_kitchen' ||
        name.includes('food') || name.includes('pantry') || name.includes('kitchen') ||
        name.includes('meal') || description.includes('food')) {
      return 'food';
    }
    
    // Shelter resources  
    if (socialFacility === 'homeless_shelter' || 
        socialFacility === 'emergency_shelter' ||
        socialFacility === 'housing' ||
        name.includes('shelter') || name.includes('housing') || 
        name.includes('homeless') || name.includes('hostel') ||
        amenity === 'shelter') {
      return 'shelter';
    }
    
    // Medical/Healthcare resources
    if (amenity === 'clinic' || amenity === 'hospital' || amenity === 'pharmacy' ||
        amenity === 'doctors' || healthcare === 'clinic' ||
        healthcare === 'hospital' || healthcare === 'pharmacy' ||
        name.includes('clinic') || name.includes('hospital') || name.includes('medical') ||
        name.includes('health') || name.includes('dental') || name.includes('doctor')) {
      return 'medical';
    }
    
    // Clothing resources
    if (socialFacility === 'clothing_bank' ||
        shop === 'charity' || shop === 'second_hand' || shop === 'thrift' ||
        name.includes('clothing') || name.includes('thrift') || name.includes('donation') ||
        name.includes('goodwill') || name.includes('salvation army') ||
        description.includes('clothing')) {
      return 'clothing';
    }
    
    // Water resources
    if (amenity === 'drinking_water' || amenity === 'water_point' ||
        amenity === 'fountain' || tags.drinking_water === 'yes' ||
        name.includes('water') || name.includes('fountain') ||
        description.includes('water')) {
      return 'water';
    }
    
    // Emergency resources
    if (amenity === 'fire_station' || amenity === 'police' ||
        tags.emergency || socialFacility === 'emergency' ||
        name.includes('emergency') || name.includes('crisis') || name.includes('disaster') ||
        name.includes('red cross') || description.includes('emergency')) {
      return 'emergency';
    }
    
    // Fallback to amenity-based mapping
    return this.mapAmenityToType(amenityType);
  }

  mapAmenityToType(amenityType) {
    const mapping = {
      'food_bank': 'food',
      'social_facility': 'shelter',
      'clinic': 'medical',
      'hospital': 'medical',
      'pharmacy': 'medical',
      'doctors': 'medical',
      'shop': 'clothing',
      'amenity': 'water',
      'emergency': 'emergency',
      'restaurant': 'food',
      'community_centre': 'shelter'
    };
    return mapping[amenityType] || 'other';
  }

  mapNominatimToType(placeType, searchQuery) {
    if (searchQuery.includes('food') || searchQuery.includes('kitchen') || searchQuery.includes('pantry') || placeType.includes('food')) return 'food';
    if (searchQuery.includes('shelter') || searchQuery.includes('housing') || searchQuery.includes('homeless')) return 'shelter';
    if (searchQuery.includes('health') || searchQuery.includes('medical') || searchQuery.includes('clinic') || searchQuery.includes('dental')) return 'medical';
    if (searchQuery.includes('clothing') || searchQuery.includes('thrift') || searchQuery.includes('charity shop')) return 'clothing';
    if (searchQuery.includes('water') || searchQuery.includes('drinking')) return 'water';
    if (searchQuery.includes('emergency') || searchQuery.includes('crisis') || searchQuery.includes('disaster')) return 'emergency';
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