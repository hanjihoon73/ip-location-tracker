
// ============================================
// STUDENT ID LOOKUP - REDASH API INTEGRATION
// ============================================

// Event Listeners for Student Lookup
studentLookupBtn.addEventListener('click', handleStudentLookup);
studentIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleStudentLookup();
    }
});

// Show student error message
function showStudentError(message) {
    studentErrorMessage.textContent = message;
    studentErrorMessage.classList.add('show');
    setTimeout(() => {
        studentErrorMessage.classList.remove('show');
    }, 5000);
}

// Hide student error message
function hideStudentError() {
    studentErrorMessage.classList.remove('show');
}

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

        // Fetch student IPs from Redash
        const ipRecords = await fetchStudentIPsFromRedash(studentId);

        if (!ipRecords || ipRecords.length === 0) {
            hideLoading();
            showStudentError('해당 학생의 접속 기록이 없습니다.');
            return;
        }

        // Extract unique IPs
        const ipAddresses = [...new Set(ipRecords.map(record => record.ip))];

        currentIPElement.textContent = `${ipAddresses.length}개 IP 위치 조회 중...`;

        // Process IPs using existing batch processing logic
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
        // Execute Redash query with student_id parameter
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
                    max_age: 0  // Always get fresh data
                })
            }
        );

        if (!response.ok) {
            throw new Error(`Redash API 오류: ${response.status}`);
        }

        const data = await response.json();

        // Check if we got a job (async execution) or immediate result
        if (data.job) {
            // Wait for job to complete
            return await waitForRedashJob(data.job.id);
        } else if (data.query_result) {
            // Immediate result (cached)
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
    const maxAttempts = 30;  // Maximum 30 seconds
    const pollInterval = 1000;  // Check every 1 second

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
                // Fetch the result
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

            // Status is PENDING (1) or STARTED (2), wait and retry
            currentIPElement.textContent = `쿼리 실행 중... (${i + 1}/${maxAttempts})`;
            await new Promise(resolve => setTimeout(resolve, pollInterval));

        } catch (error) {
            console.error('Job polling error:', error);
            throw error;
        }
    }

    throw new Error('쿼리 실행 시간 초과 (30초)');
}
