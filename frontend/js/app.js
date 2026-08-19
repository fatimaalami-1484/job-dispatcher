const API_BASE_URL = 'http://localhost:3000';

const createJobForm = document.getElementById('createJobForm');
const createMessage = document.getElementById('createMessage');

const jobIdInput = document.getElementById('jobId');
const getJobButton = document.getElementById('getJobButton');
const jobResult = document.getElementById('jobResult');


// ==========================================
// Create a new job
// ==========================================

createJobForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const agentId = document.getElementById('agentId').value;
    const fileName = document.getElementById('fileName').value;
    const timeout = Number(
        document.getElementById('timeout').value
    );

    createMessage.textContent = 'Creating job...';

    try {
        const response = await fetch(
            `${API_BASE_URL}/jobs`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    agentId,
                    fileName,
                    timeout
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.result?.message ||
                'Failed to create job'
            );
        }

        // Backend response:
        // data.result.data
        const job = data.result.data;

        createMessage.textContent =
            `Job #${job.id} created successfully.`;

        // Automatically show the created job
        jobIdInput.value = job.id;

        await getJob(job.id);

    } catch (error) {
        console.error(error);

        createMessage.textContent =
            `Error: ${error.message}`;
    }
});


// ==========================================
// Get job button
// ==========================================

getJobButton.addEventListener('click', async () => {

    const jobId = jobIdInput.value;

    if (!jobId) {
        jobResult.innerHTML = `
            <div class="empty-state">
                Please enter a Job ID.
            </div>
        `;

        return;
    }

    await getJob(jobId);
});


// ==========================================
// Get job information
// ==========================================

async function getJob(jobId) {

    jobResult.innerHTML = `
        <div class="empty-state">
            Loading job...
        </div>
    `;

    try {

        // IMPORTANT:
        // Send GET request to Central Server
        const response = await fetch(
            `${API_BASE_URL}/jobs/${jobId}`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.result?.message ||
                'Job not found'
            );
        }

        // Backend response structure:
        //
        // {
        //     "result": {
        //         "message": "...",
        //         "data": {
        //             ...
        //         }
        //     }
        // }
        //
        // Therefore:
        // data.result.data

        const job = data.result.data;

        renderJob(job);

    } catch (error) {

        console.error(error);

        jobResult.innerHTML = `
            <div class="empty-state">
                ${error.message}
            </div>
        `;
    }
}


// ==========================================
// Render job information
// ==========================================

function renderJob(job) {

    let statusClass = '';

    if (job.status === 'PENDING') {
        statusClass = 'status-pending';

    } else if (job.status === 'COMPLETED') {
        statusClass = 'status-completed';

    } else if (job.status === 'FAILED') {
        statusClass = 'status-failed';
    }

    const stdout = job.result?.stdout || '';
    const stderr = job.result?.stderr || '';

    jobResult.innerHTML = `

        <div class="job-info">

            <div class="info-row">
                <span class="info-label">
                    Job ID
                </span>

                <span>
                    ${job.id}
                </span>
            </div>


            <div class="info-row">
                <span class="info-label">
                    Agent
                </span>

                <span>
                    ${job.agentId}
                </span>
            </div>


            <div class="info-row">
                <span class="info-label">
                    File
                </span>

                <span>
                    ${job.fileName}
                </span>
            </div>


            <div class="info-row">
                <span class="info-label">
                    Timeout
                </span>

                <span>
                    ${job.timeout}s
                </span>
            </div>


            <div class="info-row">
                <span class="info-label">
                    Status
                </span>

                <span class="status-badge ${statusClass}">
                    ${job.status}
                </span>
            </div>


            <div class="info-row">
                <span class="info-label">
                    Duration
                </span>

                <span>
                    ${
                        job.duration !== null
                            ? `${job.duration} ms`
                            : '-'
                    }
                </span>
            </div>


            <div class="info-row">
                <span class="info-label">
                    Created
                </span>

                <span>
                    ${formatDate(job.createdAt)}
                </span>
            </div>


            <div class="info-row">
                <span class="info-label">
                    Started
                </span>

                <span>
                    ${formatDate(job.startedAt)}
                </span>
            </div>


            <div class="info-row">
                <span class="info-label">
                    Finished
                </span>

                <span>
                    ${formatDate(job.finishedAt)}
                </span>
            </div>

        </div>


        <div class="output">

            <h3>
                Output
            </h3>

            <pre>
${escapeHtml(stdout || 'No output')}
            </pre>


            ${
                stderr
                    ? `
                        <div class="error-output">

                            <h3>
                                Error
                            </h3>

                            <pre>
${escapeHtml(stderr)}
                            </pre>

                        </div>
                    `
                    : ''
            }

        </div>
    `;
}


// ==========================================
// Format dates
// ==========================================

function formatDate(date) {

    if (!date) {
        return '-';
    }

    return new Date(date).toLocaleString();
}


// ==========================================
// Prevent HTML injection
// ==========================================

function escapeHtml(value) {

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}