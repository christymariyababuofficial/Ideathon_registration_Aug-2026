const ADMIN_EMAIL = "christy25bs@cce.edu.in";
let currentUser = null;
let ticketTimer = null;
let availableSlots = 50;

// Internal Storage Arrays
const registeredParticipants = [];
const participantFeedbackList = [];

function showSection(sectionId) {
    document.querySelectorAll('.page-view').forEach(sec => sec.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.classList.remove('hidden');
    
    if (sectionId === 'overviewSection') document.getElementById('btn-overview').classList.add('active');
    if (sectionId === 'registerSection') document.getElementById('btn-register').classList.add('active');
    if (sectionId === 'lookupSection') document.getElementById('btn-lookup').classList.add('active');
    if (sectionId === 'adminSection') {
        const adminBtn = document.getElementById('btn-admin');
        if (adminBtn) adminBtn.classList.add('active');
        renderAdminTable();
    }
}

function toggleAuthModal() {
    document.getElementById('authModal').classList.toggle('hidden');
}

function handleAuthLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
    if (!emailInput) return;

    currentUser = emailInput;
    document.getElementById('userStatusBadge').textContent = currentUser;
    document.getElementById('userStatusBadge').classList.remove('hidden');
    document.getElementById('authBtn').textContent = "Sign Out";
    document.getElementById('authBtn').onclick = handleSignOut;
    
    document.getElementById('authGateNotice').classList.add('hidden');
    document.getElementById('submitRegBtn').removeAttribute('disabled');

    if (currentUser === ADMIN_EMAIL) {
        document.getElementById('btn-admin').classList.remove('hidden');
        showSection('adminSection');
    }

    toggleAuthModal();
}

function handleSignOut() {
    currentUser = null;
    document.getElementById('userStatusBadge').classList.add('hidden');
    document.getElementById('authBtn').textContent = "Sign In";
    document.getElementById('authBtn').onclick = toggleAuthModal;
    
    document.getElementById('authGateNotice').classList.remove('hidden');
    document.getElementById('submitRegBtn').setAttribute('disabled', 'true');
    document.getElementById('btn-admin').classList.add('hidden');

    showSection('overviewSection');
}

function handleRegisterNav() {
    showSection('registerSection');
}

function submitRegistration(event) {
    event.preventDefault();

    if (!currentUser) {
        alert("Please sign in first!");
        return;
    }

    const fileInput = document.getElementById('pptUpload');
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please upload your pitch presentation (.pptx or .pdf).");
        return;
    }

    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const ticketNum = `TCK-${randomDigits}`;

    // Status defaults to "Under Review" upon submission
    const participantRecord = {
        ticketID: ticketNum,
        status: "Under Review", // Default status set by system
        teamName: document.getElementById('regTeamName').value,
        domain: document.getElementById('regDomain').value,
        ideaSummary: document.getElementById('ideaGlimpse').value,
        fileName: fileInput.files[0].name,
        m1Name: document.getElementById('m1Name').value,
        m1Email: document.getElementById('m1Email').value,
        m1Phone: document.getElementById('m1Phone').value,
        m1College: document.getElementById('m1College').value,
        m1Dept: document.getElementById('m1Dept').value,
        m2Name: document.getElementById('m2Name').value,
        m2Email: document.getElementById('m2Email').value,
        m2Phone: document.getElementById('m2Phone').value,
        m2College: document.getElementById('m2College').value,
        m2Dept: document.getElementById('m2Dept').value,
        m3Name: document.getElementById('m3Name').value || "N/A",
        m3Email: document.getElementById('m3Email').value || "N/A",
        m3Phone: document.getElementById('m3Phone').value || "N/A",
        m3College: document.getElementById('m3College').value || "N/A",
        m3Dept: document.getElementById('m3Dept').value || "N/A",
        m4Name: document.getElementById('m4Name').value || "N/A",
        m4Email: document.getElementById('m4Email').value || "N/A",
        m4Phone: document.getElementById('m4Phone').value || "N/A",
        m4College: document.getElementById('m4College').value || "N/A",
        m4Dept: document.getElementById('m4Dept').value || "N/A"
    };

    registeredParticipants.push(participantRecord);

    availableSlots = Math.max(0, availableSlots - 1);
    document.getElementById('displaySlots').textContent = availableSlots;

    document.getElementById('teamForm').classList.add('hidden');
    const ticketBox = document.getElementById('ticketOutputBox');
    document.getElementById('generatedTicketVal').textContent = ticketNum;
    ticketBox.classList.remove('hidden');

    let timeLeft = 60;
    document.getElementById('timerCount').textContent = timeLeft;

    if (ticketTimer) clearInterval(ticketTimer);

    ticketTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('timerCount').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(ticketTimer);
            resetRegistrationForm();
        }
    }, 1000);
}

function resetRegistrationForm() {
    if (ticketTimer) clearInterval(ticketTimer);
    document.getElementById('ticketOutputBox').classList.add('hidden');
    const form = document.getElementById('teamForm');
    form.reset();
    form.classList.remove('hidden');
}

// Check Ticket & Dynamic Feedback Logic
function checkTicketStatus(event) {
    event.preventDefault();
    const query = document.getElementById('searchTicketID').value.trim().toUpperCase();
    const resultBox = document.getElementById('ticketResultBox');

    const record = registeredParticipants.find(item => item.ticketID === query);

    if (record) {
        // Event Date Check (August 26, 2026)
        const eventEndDate = new Date("2026-08-26T23:59:59");
        const currentDate = new Date();
        const hasEventPassed = currentDate > eventEndDate;

        resultBox.className = "lookup-result status-success";

        // CASE 1: Status is "Under Review"
        if (record.status === "Under Review") {
            resultBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <span class="status-pill" style="background:rgba(234,179,8,0.2); color:#eab308;">⏳ Under Review Stage</span>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${record.ticketID}</span>
                </div>
                <h3 style="color:#fff; margin-bottom:0.3rem;">Team: ${record.teamName}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted);">Track: <strong>${record.domain}</strong></p>
                
                <div style="margin-top:1.2rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                    <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
                        Your submission is currently under review by our evaluation committee. Please check back later for selection updates.
                    </p>
                </div>
            `;
        } 
        // CASE 2: Selected, but event date has NOT passed yet
        else if (record.status === "Selected" && !hasEventPassed) {
            resultBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <span class="status-pill verified">✓ Shortlisted / Selected</span>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${record.ticketID}</span>
                </div>
                <h3 style="color:#fff; margin-bottom:0.3rem;">Team: ${record.teamName}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted);">Track: <strong>${record.domain}</strong></p>
                
                <div style="margin-top:1.2rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                    <p style="font-size:0.85rem; color:var(--text-muted); line-height:1.6;">
                        🎉 Congratulations! Your team has been selected for the final stage. The post-event feedback survey will open here after the event finishes on August 26, 2026.
                    </p>
                </div>
            `;
        } 
        // CASE 3: Selected AND Event date HAS passed -> SHOW FEEDBACK FORM
        else if (record.status === "Selected" && hasEventPassed) {
            const existingFB = participantFeedbackList.find(f => f.ticketID === record.ticketID);

            resultBox.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                    <span class="status-pill verified">✓ Finalist Participant</span>
                    <span style="font-size:0.8rem; color:var(--text-muted);">${record.ticketID}</span>
                </div>
                <h3 style="color:#fff; margin-bottom:0.3rem;">Team: ${record.teamName}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted);">Track: <strong>${record.domain}</strong></p>

                <div style="margin-top:1.2rem; padding-top:1rem; border-top:1px solid var(--border-color);">
                    <h4 style="color:var(--accent-gold); font-size:0.95rem; margin-bottom:0.5rem;">📝 Post-Event Feedback Survey</h4>
                    
                    ${existingFB ? `
                        <div class="notice warning" style="background:rgba(34,197,94,0.1); border-color:#22c55e; color:#4ade80;">
                            ✅ Thank you! Your feedback for Ideathon 2026 has been submitted.<br>
                            <strong>Rating Given:</strong> ${existingFB.rating}
                        </div>
                    ` : `
                        <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1rem;">
                            Thank you for participating in Ideathon 2026! As a selected participant, please share your event feedback below.
                        </p>

                        <form id="feedbackForm" onsubmit="submitEventFeedback(event, '${record.ticketID}', '${record.teamName}')">
                            <div class="form-group">
                                <label for="ratingSelect">Overall Event Experience *</label>
                                <select id="ratingSelect" required>
                                    <option value="">Select Rating</option>
                                    <option value="5 - Excellent">⭐⭐⭐⭐⭐ 5 - Excellent</option>
                                    <option value="4 - Good">⭐⭐⭐⭐ 4 - Good</option>
                                    <option value="3 - Average">⭐⭐⭐ 3 - Average</option>
                                    <option value="2 - Poor">⭐⭐ 2 - Poor</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label for="feedbackComments">Your Comments & Suggestions *</label>
                                <textarea id="feedbackComments" rows="3" placeholder="Tell us about your experience during the event..." required></textarea>
                            </div>

                            <button type="submit" class="btn-primary" style="width:100%; font-size:0.85rem;">Submit Feedback</button>
                        </form>

                        <div id="feedbackSuccessMsg" class="notice warning hidden" style="margin-top:1rem; background:rgba(34,197,94,0.1); border-color:#22c55e; color:#4ade80;">
                            ✅ Thank you for your feedback!
                        </div>
                    `}
                </div>
            `;
        }
    } else {
        resultBox.className = "lookup-result status-error";
        resultBox.innerHTML = `
            <span class="status-pill invalid">✕ Invalid Ticket ID</span>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.5rem;">
                No registration found for <strong>"${query}"</strong>. Please check your ticket number and try again.
            </p>
        `;
    }

    resultBox.classList.remove('hidden');
}

function submitEventFeedback(event, ticketID, teamName) {
    event.preventDefault();

    const rating = document.getElementById('ratingSelect').value;
    const comments = document.getElementById('feedbackComments').value;

    participantFeedbackList.push({
        ticketID: ticketID,
        teamName: teamName,
        rating: rating,
        comments: comments,
        submittedAt: new Date().toLocaleString()
    });

    document.getElementById('feedbackForm').classList.add('hidden');
    document.getElementById('feedbackSuccessMsg').classList.remove('hidden');
}

// Admin Table View with Status Toggle Controls
function renderAdminTable() {
    const tbody = document.getElementById('adminTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (registeredParticipants.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">No registrations recorded yet.</td></tr>`;
        return;
    }

    registeredParticipants.forEach(item => {
        const fb = participantFeedbackList.find(f => f.ticketID === item.ticketID);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.ticketID}</strong></td>
            <td>${item.teamName}</td>
            <td>${item.domain}</td>
            <td>${item.m1Name}</td>
            <td>${item.m1Email}</td>
            <td>${item.m1Phone}</td>
            <td>${item.m1College}</td>
            <td>
                <select onchange="updateParticipantStatus('${item.ticketID}', this.value)" style="padding:0.3rem; font-size:0.8rem; background:var(--bg-input); border:1px solid var(--border-color); color:var(--text-main);">
                    <option value="Under Review" ${item.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                    <option value="Selected" ${item.status === 'Selected' ? 'selected' : ''}>Selected</option>
                </select>
            </td>
            <td>${fb ? fb.rating : '<span style="color:var(--text-muted);">Pending</span>'}</td>
        `;
        tbody.appendChild(row);
    });
}

// Function for Admin to toggle team status between "Under Review" and "Selected"
function updateParticipantStatus(ticketID, newStatus) {
    const participant = registeredParticipants.find(p => p.ticketID === ticketID);
    if (participant) {
        participant.status = newStatus;
        alert(`Status for ${ticketID} updated to: ${newStatus}`);
    }
}

// Excel Export Logic
function exportParticipantsToExcel() {
    if (registeredParticipants.length === 0) {
        alert("No participant data to export!");
        return;
    }

    const excelData = registeredParticipants.map(p => {
        const fb = participantFeedbackList.find(f => f.ticketID === p.ticketID);

        return {
            "Ticket ID": p.ticketID,
            "Selection Status": p.status,
            "Team Name": p.teamName,
            "Domain Track": p.domain,
            "Idea Summary": p.ideaSummary,
            "PPT File Name": p.fileName,
            "Leader Name": p.m1Name,
            "Leader Email": p.m1Email,
            "Leader Phone": p.m1Phone,
            "Leader College": p.m1College,
            "Leader Dept": p.m1Dept,
            "Event Rating": fb ? fb.rating : "Not Submitted",
            "Event Feedback": fb ? fb.comments : "N/A"
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");

    XLSX.writeFile(workbook, `Ideathon_Participants_2026.xlsx`);
}
