// DOM Elements
const ipInput = document.getElementById('ipInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultSection = document.getElementById('resultSection');

// Result elements
const ipBadge = document.getElementById('ipBadge');
const cityElement = document.getElementById('city');
const regionElement = document.getElementById('region');
const countryElement = document.getElementById('country');
const postalElement = document.getElementById('postal');
const coordinatesElement = document.getElementById('coordinates');
const timezoneElement = document.getElementById('timezone');
const currencyElement = document.getElementById('currency');
const orgElement = document.getElementById('org');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
ipInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Validate IP address format
function isValidIP(ip) {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

// Hide error message
function hideError() {
    errorMessage.classList.remove('show');
}

// Show loading state
function showLoading() {
    loadingSpinner.classList.add('show');
    resultSection.classList.remove('show');
    hideError();
}

// Hide loading state
function hideLoading() {
    loadingSpinner.classList.remove('show');
}

// Display results
function displayResults(data) {
    // Update IP badge
    ipBadge.textContent = data.ip || '-';

    // Update location information
    cityElement.textContent = data.city || '-';
    regionElement.textContent = data.region 
        ? `${data.region} (${data.region_code || ''})` 
        : '-';
    countryElement.textContent = data.country_name 
        ? `${data.country_name} (${data.country_code || ''})` 
        : '-';
    
    // Highlight postal code
    postalElement.textContent = data.postal || '-';
    
    // Coordinates
    if (data.latitude && data.longitude) {
        coordinatesElement.textContent = `${data.latitude}, ${data.longitude}`;
    } else {
        coordinatesElement.textContent = '-';
    }
    
    // Timezone
    timezoneElement.textContent = data.timezone 
        ? `${data.timezone} (${data.utc_offset || ''})` 
        : '-';
    
    // Currency
    currencyElement.textContent = data.currency 
        ? `${data.currency_name || ''} (${data.currency || ''})` 
        : '-';
    
    // Organization
    orgElement.textContent = data.org || '-';

    // Show results
    hideLoading();
    resultSection.classList.add('show');
}

// Fetch IP location data
async function fetchIPLocation(ip) {
    try {
        showLoading();
        
        const response = await fetch(`https://ipapi.co/${ip}/json/`);
        
        if (!response.ok) {
            throw new Error('IP 정보를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        
        // Check if API returned an error
        if (data.error) {
            throw new Error(data.reason || 'IP 주소를 찾을 수 없습니다.');
        }
        
        displayResults(data);
        
    } catch (error) {
        hideLoading();
        showError(error.message || '오류가 발생했습니다. 다시 시도해주세요.');
        console.error('Error fetching IP location:', error);
    }
}

// Handle search
function handleSearch() {
    const ip = ipInput.value.trim();
    
    if (!ip) {
        showError('IP 주소를 입력해주세요.');
        return;
    }
    
    if (!isValidIP(ip)) {
        showError('올바른 IP 주소 형식이 아닙니다. (예: 8.8.8.8)');
        return;
    }
    
    fetchIPLocation(ip);
}

// Optional: Load a default IP on page load for demonstration
window.addEventListener('load', () => {
    // Uncomment the line below to auto-load a demo IP
    // ipInput.value = '8.8.8.8';
    // handleSearch();
});
