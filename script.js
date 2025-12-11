
// ============================================
// REDASH API CONFIGURATION
// ============================================
// Use empty string for local proxy, or full URL if CORS is allowed
const REDASH_URL = ''; // Changed to use local proxy
const REDASH_QUERY_ID = 288;
const REDASH_API_KEY = 'CtOocMthsRYT9QZjV0nGiHPK2wrwksSEUigAP7RN';

// Student Lookup DOM Elements
const studentIdInput = document.getElementById('studentIdInput');
const studentLookupBtn = document.getElementById('studentLookupBtn');
const studentErrorMessage = document.getElementById('studentErrorMessage');

// Main DOM Elements
const ipInput = document.getElementById('ipInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultSection = document.getElementById('resultSection');

// Single Result elements
const ipBadge = document.getElementById('ipBadge');
const cityElement = document.getElementById('city');
const regionElement = document.getElementById('region');
const countryElement = document.getElementById('country');
const postalElement = document.getElementById('postal');
const coordinatesElement = document.getElementById('coordinates');
const timezoneElement = document.getElementById('timezone');
const currencyElement = document.getElementById('currency');
const orgElement = document.getElementById('org');

// Batch Processing DOM Elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const fileUploadArea = document.getElementById('fileUploadArea');
const fileInfo = document.getElementById('fileInfo');
const batchProgress = document.getElementById('batchProgress');
const progressBar = document.getElementById('progressBar');
const progressCounter = document.getElementById('progressCounter');
const currentIPElement = document.getElementById('currentIP');
const batchResults = document.getElementById('batchResults');
const resultsTableBody = document.getElementById('resultsTableBody');
const downloadBtn = document.getElementById('downloadBtn');

// Batch results storage
let batchResultsData = [];

// ============================================
// EVENT LISTENERS
// ============================================

// Single Search
searchBtn.addEventListener('click', handleSearch);
ipInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Student Lookup
studentLookupBtn.addEventListener('click', handleStudentLookup);
studentIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleStudentLookup();
    }
});

// File Upload
uploadBtn.addEventListener('click', () => {
    fileInput.click();
});

fileUploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileSelect);

// Drag and drop events
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('dragover');
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('dragover');
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect({ target: { files } });
    }
});

// Download
downloadBtn.addEventListener('click', downloadResults);

// Optional: Load demo IP
window.addEventListener('load', () => {
    // ipInput.value = '8.8.8.8';
    // handleSearch();
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Validate IP address format
function isValidIP(ip) {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

// Show/Hide Single Search Error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 5000);
}

function hideError() {
    errorMessage.classList.remove('show');
}

// Show/Hide Student Lookup Error
function showStudentError(message) {
    studentErrorMessage.textContent = message;
    studentErrorMessage.classList.add('show');
    setTimeout(() => {
        studentErrorMessage.classList.remove('show');
    }, 5000);
}

function hideStudentError() {
    studentErrorMessage.classList.remove('show');
}

// Show/Hide Loading
function showLoading() {
    loadingSpinner.classList.add('show');
    resultSection.classList.remove('show');
    hideError();
    hideStudentError();
}

function hideLoading() {
    loadingSpinner.classList.remove('show');
}

// Show/Hide File Error
function showFileError(message) {
    fileInfo.textContent = message;
    fileInfo.style.background = 'rgba(245, 87, 108, 0.1)';
    fileInfo.style.borderColor = 'rgba(245, 87, 108, 0.3)';
    fileInfo.style.color = '#f5576c';
    fileInfo.classList.add('show');

    setTimeout(() => {
        fileInfo.classList.remove('show');
        fileInfo.style.background = 'rgba(79, 172, 254, 0.1)';
        fileInfo.style.borderColor = 'rgba(79, 172, 254, 0.3)';
        fileInfo.style.color = '#4facfe';
    }, 5000);
}

// ============================================
// SINGLE IP SEARCH LOGIC
// ============================================

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

// Fetch IP location data
async function fetchIPLocation(ip) {
    try {
        showLoading();

        const response = await fetch(`https://ipapi.co/${ip}/json/`);

        if (!response.ok) {
            throw new Error('IP 정보를 가져오는데 실패했습니다.');
        }

        const data = await response.json();

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

// Display single results
function displayResults(data) {
    ipBadge.textContent = data.ip || '-';
    cityElement.textContent = data.city || '-';
    regionElement.textContent = data.region
        ? `${data.region} (${data.region_code || ''})`
        : '-';
    countryElement.textContent = data.country_name
        ? `${data.country_name} (${data.country_code || ''})`
        : '-';
    postalElement.textContent = data.postal || '-';

    if (data.latitude && data.longitude) {
        coordinatesElement.textContent = `${data.latitude}, ${data.longitude}`;
    } else {
        coordinatesElement.textContent = '-';
    }

    timezoneElement.textContent = data.timezone
        ? `${data.timezone} (${data.utc_offset || ''})`
        : '-';

    currencyElement.textContent = data.currency
        ? `${data.currency_name || ''} (${data.currency || ''})`
        : '-';

    orgElement.textContent = data.org || '-';

    hideLoading();
    resultSection.classList.add('show');
}

// ============================================
// BATCH PROCESSING LOGIC (EXCEL & STUDENT ID)
// ============================================

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
        showFileError('Excel 파일(.xlsx)만 업로드 가능합니다.');
        return;
    }

    fileInfo.textContent = `선택된 파일: ${file.name}`;
    fileInfo.classList.add('show');

    parseExcelFile(file);
}

// Parse Excel file
function parseExcelFile(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                showFileError('Excel 파일에 데이터가 없습니다.');
                return;
            }

            const ipAddresses = extractIPAddresses(jsonData);

            if (ipAddresses.length === 0) {
                showFileError('Excel 파일에서 "ip" 필드를 찾을 수 없습니다.');
                return;
            }

            processBatchIPs(ipAddresses);

        } catch (error) {
            console.error('Excel parsing error:', error);
            showFileError('Excel 파일을 읽는 중 오류가 발생했습니다.');
        }
    };

    reader.readAsArrayBuffer(file);
}

// Extract IP addresses from Excel data
function extractIPAddresses(data) {
    const ipAddresses = [];

    for (const row of data) {
        const ipField = Object.keys(row).find(key => key.toLowerCase() === 'ip');

        if (ipField && row[ipField]) {
            const ip = String(row[ipField]).trim();
            if (isValidIP(ip)) {
                ipAddresses.push(ip);
            }
        }
    }

    return ipAddresses;
}

// Group IPs by subnet based on IP address class
// Class A (1-127): Group by first octet
// Class B (128-191): Group by first two octets
// Class C (192-223): Group by first three octets
function groupIPsBySubnet(ipAddresses) {
    const groups = new Map();

    for (const ip of ipAddresses) {
        const parts = ip.split('.');
        if (parts.length < 4) {
            groups.set(ip, [ip]);
            continue;
        }

        const firstOctet = parseInt(parts[0]);
        let subnet;

        if (firstOctet >= 1 && firstOctet <= 127) {
            // Class A: Group by first octet
            subnet = `${parts[0]}`;
        } else if (firstOctet >= 128 && firstOctet <= 191) {
            // Class B: Group by first two octets
            subnet = `${parts[0]}.${parts[1]}`;
        } else if (firstOctet >= 192 && firstOctet <= 223) {
            // Class C: Group by first three octets
            subnet = `${parts[0]}.${parts[1]}.${parts[2]}`;
        } else {
            // Other ranges: treat as individual (no grouping)
            subnet = ip;
        }

        if (!groups.has(subnet)) {
            groups.set(subnet, []);
        }
        groups.get(subnet).push(ip);
    }

    return groups;
}

// Get representative IPs from groups (only groups with 2+ IPs)
function getRepresentativeIPs(groups) {
    const representatives = new Map(); // subnet -> representative IP
    const allIPs = [];

    for (const [subnet, ips] of groups.entries()) {
        if (ips.length >= 2) {
            // Group has 2+ IPs, use first as representative
            representatives.set(subnet, ips[0]);
            allIPs.push(...ips);
        } else {
            // Single IP, query it normally
            allIPs.push(ips[0]);
        }
    }

    return { representatives, allIPs };
}

// Process batch IPs with optimization
async function processBatchIPs(ipAddresses) {
    // Reset results
    batchResultsData = [];
    resultsTableBody.innerHTML = '';

    // Show progress
    batchProgress.classList.add('show');
    batchResults.classList.add('show');

    // Group IPs by subnet (first two octets)
    const groups = groupIPsBySubnet(ipAddresses);
    const { representatives, allIPs } = getRepresentativeIPs(groups);

    // Determine which IPs to actually query
    const ipsToQuery = [];
    const ipToSubnet = new Map(); // IP -> subnet mapping

    for (const [subnet, ips] of groups.entries()) {
        if (ips.length >= 2) {
            // Only query the representative
            const rep = representatives.get(subnet);
            ipsToQuery.push(rep);
            // Map all IPs in this group to the subnet
            for (const ip of ips) {
                ipToSubnet.set(ip, subnet);
            }
        } else {
            // Query single IP normally
            ipsToQuery.push(ips[0]);
            ipToSubnet.set(ips[0], null); // No grouping
        }
    }

    // Store query results by subnet
    const subnetResults = new Map();

    const total = ipAddresses.length;
    const totalQueries = ipsToQuery.length;
    let completed = 0;
    let queriesCompleted = 0;

    // Show optimization info
    if (totalQueries < total) {
        currentIPElement.textContent = `최적화: ${total}개 IP 중 ${totalQueries}개만 조회 (${total - totalQueries}개 절약)`;
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Query representative IPs
    for (const ip of ipsToQuery) {
        // Update progress
        currentIPElement.textContent = `현재 조회 중: ${ip}`;
        progressCounter.textContent = `조회: ${queriesCompleted} / ${totalQueries}`;
        progressBar.style.width = `${(queriesCompleted / totalQueries) * 100}%`;

        try {
            // Fetch IP location data
            const response = await fetch(`https://ipapi.co/${ip}/json/`);

            if (!response.ok) {
                throw new Error('API 요청 실패');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.reason || 'IP 조회 실패');
            }

            // Store result
            const subnet = ipToSubnet.get(ip);
            if (subnet) {
                subnetResults.set(subnet, data);
            } else {
                subnetResults.set(ip, data);
            }

        } catch (error) {
            console.error(`Error fetching IP ${ip}:`, error);

            // Store error result
            const subnet = ipToSubnet.get(ip);
            if (subnet) {
                subnetResults.set(subnet, { error: true });
            } else {
                subnetResults.set(ip, { error: true });
            }
        }

        queriesCompleted++;

        // Rate limiting - wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Now create results for representative IPs only
    currentIPElement.textContent = '결과 생성 중...';

    // Track which subnets we've already displayed
    const displayedSubnets = new Set();
    const displayedIPs = new Set();

    for (const ip of ipAddresses) {
        const subnet = ipToSubnet.get(ip);

        // Skip if we've already displayed this subnet's representative
        if (subnet && displayedSubnets.has(subnet)) {
            continue;
        }

        // Skip if we've already displayed this individual IP
        if (!subnet && displayedIPs.has(ip)) {
            continue;
        }

        let data;
        let displayIP;
        let groupCount = 1;

        if (subnet) {
            // Use subnet representative's data
            data = subnetResults.get(subnet);
            // Get the representative IP for this subnet
            displayIP = representatives.get(subnet);
            // Count how many IPs are in this group
            groupCount = groups.get(subnet).length;
            displayedSubnets.add(subnet);
        } else {
            // Use individual IP's data
            data = subnetResults.get(ip);
            displayIP = ip;
            displayedIPs.add(ip);
        }

        if (data && !data.error) {
            // Add to results
            const result = {
                ip: displayIP,
                postal: data.postal || '-',
                city: data.city || '-',
                region: data.region || '-',
                country: data.country_name || '-',
                status: groupCount > 1 ? `성공 (${groupCount}개 IP)` : '성공',
                groupCount: groupCount
            };

            batchResultsData.push(result);
            addResultRow(result, true);
        } else {
            // Add error result
            const result = {
                ip: displayIP,
                postal: '-',
                city: '-',
                region: '-',
                country: '-',
                status: groupCount > 1 ? `실패 (${groupCount}개 IP)` : '실패',
                groupCount: groupCount
            };

            batchResultsData.push(result);
            addResultRow(result, false);
        }

        completed++;
    }

    // Update final progress
    const displayedCount = batchResultsData.length;
    progressCounter.textContent = `표시: ${displayedCount}개 그룹 (전체 ${total}개 IP, ${totalQueries}회 조회)`;
    progressBar.style.width = '100%';
    currentIPElement.textContent = `완료! (대표 IP ${displayedCount}개 표시, API 호출: ${totalQueries}회, 절약: ${total - totalQueries}회)`;

    // Hide progress after 3 seconds
    setTimeout(() => {
        batchProgress.classList.remove('show');
    }, 3000);
}

// Add result row to table
function addResultRow(result, success) {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${result.ip}</td>
        <td>${result.postal}</td>
        <td>${result.city}</td>
        <td>${result.region}</td>
        <td>${result.country}</td>
        <td class="${success ? 'status-success' : 'status-error'}">${result.status}</td>
    `;

    resultsTableBody.appendChild(row);
}

// Download results as Excel
function downloadResults() {
    if (batchResultsData.length === 0) {
        alert('다운로드할 결과가 없습니다.');
        return;
    }

    const ws = XLSX.utils.json_to_sheet(batchResultsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IP 조회 결과');

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `ip_lookup_results_${timestamp}.xlsx`;

    XLSX.writeFile(wb, filename);
}

// ============================================
// STUDENT ID LOOKUP FUNCTIONS
// ============================================

// Handle student ID lookup
async function handleStudentLookup() {
    const studentId = studentIdInput.value.trim();

    if (!studentId) {
        showStudentError('학생 ID를 입력해주세요.');
        return;
    }

    try {
        hideStudentError();
        showLoading();
        currentIPElement.textContent = '학생 IP 목록 조회 중...';

        const ipRecords = await fetchStudentIPsFromRedash(studentId);

        if (!ipRecords || ipRecords.length === 0) {
            hideLoading();
            showStudentError('해당 학생의 접속 기록이 없습니다.');
            return;
        }

        const ipAddresses = [...new Set(ipRecords.map(record => record.ip))];

        currentIPElement.textContent = `${ipAddresses.length}개 IP 위치 조회 중...`;

        await processBatchIPs(ipAddresses);

        hideLoading();

    } catch (error) {
        hideLoading();
        console.error('Student lookup error:', error);
        showStudentError(error.message || '학생 IP 조회 중 오류가 발생했습니다.');
    }
}

// Fetch student IPs from Redash API
async function fetchStudentIPsFromRedash(studentId) {
    try {
        const response = await fetch(
            `${REDASH_URL}/api/queries/${REDASH_QUERY_ID}/results`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Key ${REDASH_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parameters: { student_id: studentId },
                    max_age: 0
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Redash API 오류: ${response.status}`);
        }

        const data = await response.json();

        if (data.job) {
            return await waitForRedashJob(data.job.id);
        } else if (data.query_result) {
            return data.query_result.data.rows;
        } else {
            throw new Error('예상치 못한 응답 형식입니다.');
        }

    } catch (error) {
        console.error('Redash API error:', error);
        throw new Error('Redash API 호출 실패: ' + error.message);
    }
}

// Wait for Redash job to complete
async function waitForRedashJob(jobId) {
    const maxAttempts = 30;
    const pollInterval = 1000;

    for (let i = 0; i < maxAttempts; i++) {
        try {
            const jobResponse = await fetch(
                `${REDASH_URL}/api/jobs/${jobId}`,
                {
                    headers: {
                        'Authorization': `Key ${REDASH_API_KEY}`
                    }
                }
            );

            if (!jobResponse.ok) {
                throw new Error(`Job 상태 확인 실패: ${jobResponse.status}`);
            }

            const jobData = await jobResponse.json();
            const status = jobData.job.status;

            if (status === 3) {  // SUCCESS
                const resultResponse = await fetch(
                    `${REDASH_URL}/api/query_results/${jobData.job.query_result_id}`,
                    {
                        headers: {
                            'Authorization': `Key ${REDASH_API_KEY}`
                        }
                    }
                );

                if (!resultResponse.ok) {
                    throw new Error(`결과 조회 실패: ${resultResponse.status}`);
                }

                const resultData = await resultResponse.json();
                return resultData.query_result.data.rows;

            } else if (status === 4) {  // FAILURE
                throw new Error('쿼리 실행 실패');
            } else if (status === 5) {  // CANCELLED
                throw new Error('쿼리가 취소되었습니다');
            }

            currentIPElement.textContent = `쿼리 실행 중... (${i + 1}/${maxAttempts})`;
            await new Promise(resolve => setTimeout(resolve, pollInterval));

        } catch (error) {
            console.error('Job polling error:', error);
            throw error;
        }
    }

    throw new Error('쿼리 실행 시간 초과 (30초)');
}
