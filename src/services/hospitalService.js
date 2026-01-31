// Hospital Service - Uses browser geolocation and fetches real nearby hospitals

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';

// Get user's current location
export const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes cache
            }
        );
    });
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
};

// Fetch nearby hospitals using Overpass API (OpenStreetMap) - Free alternative
export const fetchNearbyHospitals = async (lat, lng, radius = 5000) => {
    try {
        // Use Overpass API for OpenStreetMap data - free and no API key needed
        const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="clinic"](around:${radius},${lat},${lng});
        way["amenity"="clinic"](around:${radius},${lat},${lng});
        node["healthcare"="hospital"](around:${radius},${lat},${lng});
        way["healthcare"="hospital"](around:${radius},${lat},${lng});
      );
      out center;
    `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        if (!response.ok) {
            throw new Error('Failed to fetch hospitals');
        }

        const data = await response.json();

        // Process and format the results
        const hospitals = data.elements
            .map((element) => {
                const hospLat = element.lat || element.center?.lat;
                const hospLng = element.lon || element.center?.lon;

                if (!hospLat || !hospLng) return null;

                const distance = calculateDistance(lat, lng, hospLat, hospLng);

                return {
                    id: element.id,
                    name: element.tags?.name || 'Healthcare Facility',
                    type: element.tags?.amenity || element.tags?.healthcare || 'hospital',
                    address: formatAddress(element.tags),
                    phone: element.tags?.phone || element.tags?.['contact:phone'] || null,
                    website: element.tags?.website || element.tags?.['contact:website'] || null,
                    emergency: element.tags?.emergency === 'yes' || element.tags?.['healthcare:speciality']?.includes('emergency'),
                    openingHours: element.tags?.opening_hours || 'Call for hours',
                    distance: distance,
                    distanceText: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`,
                    lat: hospLat,
                    lng: hospLng,
                    isOpen: checkIfOpen(element.tags?.opening_hours)
                };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 10); // Return top 10 nearest

        return hospitals;
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        throw error;
    }
};

// Format address from OSM tags
const formatAddress = (tags) => {
    if (!tags) return 'Address not available';

    const parts = [];
    if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
    if (tags['addr:street']) parts.push(tags['addr:street']);
    if (tags['addr:city']) parts.push(tags['addr:city']);
    if (tags['addr:postcode']) parts.push(tags['addr:postcode']);

    return parts.length > 0 ? parts.join(', ') : (tags.address || 'Address not available');
};

// Check if facility is currently open (simplified)
const checkIfOpen = (openingHours) => {
    if (!openingHours) return null; // Unknown
    if (openingHours === '24/7') return true;

    // For complex opening hours, return null (unknown)
    // A full implementation would parse the opening_hours format
    return null;
};

// Get Google Maps URL for directions
export const getDirectionsUrl = (destLat, destLng, hospitalName) => {
    const encodedName = encodeURIComponent(hospitalName);
    return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&destination_place_id=${encodedName}`;
};

// Get Google Maps embed URL for displaying location
export const getMapEmbedUrl = (lat, lng) => {
    return `https://maps.google.com/maps?q=${lat},${lng}&z=14&output=embed`;
};

// Fallback hospitals if API fails (based on general location)
export const getFallbackHospitals = (lat, lng) => {
    // These are placeholder hospitals - will show when API fails
    // In production, you might want to cache previously fetched results
    return [
        {
            id: 'fallback-1',
            name: 'Nearest Hospital',
            type: 'hospital',
            address: 'Search for hospitals in your area',
            phone: '108', // Emergency number in India
            emergency: true,
            openingHours: '24/7',
            distance: 0,
            distanceText: 'Enable location',
            lat: lat,
            lng: lng,
            isOpen: true,
            isFallback: true
        }
    ];
};
