const API_BASE_URL = 'http://localhost:3000';


// Elements

const createJobForm =
    document.getElementById('createJobForm');

const createMessage =
    document.getElementById('createMessage');

const fileIdSelect =
    document.getElementById('fileId');

const statusFileIdSelect =
    document.getElementById('statusFileId');

const jobResult =
    document.getElementById('jobResult');


// Load files

async function loadFiles() {

    // Form 1
    fileIdSelect.innerHTML = `  
        <option value="">
            Loading files...
        </option>
    `;


    // Form 2
    statusFileIdSelect.innerHTML = `
        <option value="">
            Loading files...
        </option>
    `;


    try {

        const response = await fetch(
            `${API_BASE_URL}/jobs`
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.result?.message ||
                'Failed to load files'
            );
        }

        const files =
            data.result.data.data.jobs;


        console.log('Files:', files);


        // Clear Form 1

        fileIdSelect.innerHTML = `
            <option value="">
                Select a file
            </option>
        `;


        // Clear Form 2

        statusFileIdSelect.innerHTML = `
            <option value="">
                Select a file
            </option>
        `;


        // Add files to both selects
        files.forEach(file => {


            // Create Job Select

            const createOption =
                document.createElement('option');


            // File ID sent to backend
            createOption.value = file.id;


            // File name shown to user
            createOption.textContent = file.name;


            fileIdSelect.appendChild(
                createOption
            );


            // Job Status Select

            const statusOption =
                document.createElement('option');


            // File ID
            statusOption.value = file.id;


            // File name
            statusOption.textContent = file.name;


            statusFileIdSelect.appendChild(
                statusOption
            );

        });


    } catch (error) {

        console.error(
            'Load files error:',
            error
        );


        // Form 1
        fileIdSelect.innerHTML = `
            <option value="">
                Failed to load files
            </option>
        `;


        // Form 2
        statusFileIdSelect.innerHTML = `
            <option value="">
                Failed to load files
            </option>
        `;
    }
}


// Create a new job
createJobForm.addEventListener(
    'submit',
    async (event) => {

        event.preventDefault();


        const agentId =
            document.getElementById(
                'agentId'
            ).value;


        const fileId =
            document.getElementById(
                'fileId'
            ).value;


        const timeout =
            Number(
                document.getElementById(
                    'timeout'
                ).value
            );


        // Validate file

        if (!fileId) {

            createMessage.textContent =
                'Please select a file.';

            return;
        }


        createMessage.textContent =
            'Creating job...';


        try {

            const response = await fetch(
                `${API_BASE_URL}/orders`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type':
                            'application/json'
                    },

                    body: JSON.stringify({

                        agentId,

                        // File ID
                        jobId: fileId,

                        timeout
                    })
                }
            );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.result?.message ||
                    'Failed to create job'
                );
            }


            const job =
                data.result.data;


            createMessage.textContent =
                `Job #${job.id} created successfully.`;


            // Automatically show created job

            await getJob(job.id);

        } catch (error) {

            console.error(
                'Create job error:',
                error
            );


            createMessage.textContent =
                `Error: ${error.message}`;
        }
    }
);


// Job Status - Select File

statusFileIdSelect.addEventListener(
    'change',
    async () => {

        const fileId =
            statusFileIdSelect.value;


        // No file selected

        if (!fileId) {

            jobResult.innerHTML = `
                <div class="empty-state">
                    Select a file to view its status.
                </div>
            `;

            return;
        }


        // Get job by selected file

        await getJob(fileId);
    }
);


// Get job information

async function getJob(jobId) {

    jobResult.innerHTML = `
        <div class="empty-state">
            Loading job...
        </div>
    `;


    try {

        const response = await fetch(
            `${API_BASE_URL}/jobs/${jobId}`
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.result?.message ||
                'Job not found'
            );
        }


        const job =
            data.result.data;


        renderJob(job);


    } catch (error) {

        console.error(
            'Get job error:',
            error
        );


        jobResult.innerHTML = `
            <div class="empty-state">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


// Render job information

function renderJob(job) {

    let statusClass = '';

    // Status class

    if (job.status === 'PENDING') {

        statusClass =
            'status-pending';

    } else if (job.status === 'RUNNING') {

        statusClass =
            'status-runnig';

    } else if (job.status === 'COMPLETED') {

        statusClass =
            'status-completed';

    } else if (job.status === 'FAILED') {

        statusClass =
            'status-failed';

    } else if (job.status === 'TIMEOUT') {

        statusClass =
            'status-timeout';
    }

    // Output

    const stdout =
        job.result?.stdout || '';


    const stderr =
        job.result?.stderr || '';


    // Render

    jobResult.innerHTML = `

        <div class="job-info">


            <!-- Job ID -->

            <div class="info-row">

                <span class="info-label">
                    Job ID
                </span>

                <span>
                    ${escapeHtml(job.id)}
                </span>

            </div>


            <!-- Agent -->

            <div class="info-row">

                <span class="info-label">
                    Agent
                </span>

                <span>
                    ${escapeHtml(job.agentId)}
                </span>

            </div>


            <!-- File -->

            <div class="info-row">

                <span class="info-label">
                    File
                </span>

                <span>
                    ${escapeHtml(
                        job.fileName ||
                        job.fileId ||
                        '-'
                    )}
                </span>

            </div>


            <!-- Timeout -->

            <div class="info-row">

                <span class="info-label">
                    Timeout
                </span>

                <span>
                    ${escapeHtml(job.timeout)}s
                </span>

            </div>


            <!-- Status -->

            <div class="info-row">

                <span class="info-label">
                    Status
                </span>

                <span
                    class="status-badge ${statusClass}"
                >
                    ${escapeHtml(job.status)}
                </span>

            </div>


            <!-- Duration -->

            <div class="info-row">

                <span class="info-label">
                    Duration
                </span>

                <span>

                    ${
                        job.duration !== null &&
                        job.duration !== undefined

                            ? `${escapeHtml(
                                job.duration
                            )} ms`

                            : '-'
                    }

                </span>

            </div>


            <!-- Created -->

            <div class="info-row">

                <span class="info-label">
                    Created
                </span>

                <span>
                    ${formatDate(job.createdAt)}
                </span>

            </div>


            <!-- Started -->

            <div class="info-row">

                <span class="info-label">
                    Started
                </span>

                <span>
                    ${formatDate(job.startedAt)}
                </span>

            </div>


            <!-- Finished -->

            <div class="info-row">

                <span class="info-label">
                    Finished
                </span>

                <span>
                    ${formatDate(job.finishedAt)}
                </span>

            </div>

        </div>


        <!-- Output -->

        <div class="output">

            <h3>
                Output
            </h3>


            <pre>
${escapeHtml(
    stdout || 'No output'
)}
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


// Format dates

function formatDate(date) {

    if (!date) {
        return '-';
    }


    return new Date(date)
        .toLocaleString();
}


// Prevent HTML injection

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            '&',
            '&amp;'
        )

        .replaceAll(
            '<',
            '&lt;'
        )

        .replaceAll(
            '>',
            '&gt;'
        )

        .replaceAll(
            '"',
            '&quot;'
        )

        .replaceAll(
            "'",
            '&#039;'
        );
}


// Initial load

loadFiles();