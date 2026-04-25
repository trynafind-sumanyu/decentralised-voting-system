const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  : "https://voting-system-backend-9xsy.onrender.com/api";

const ADMIN_TOKEN_KEY = "voting_admin_token";

const state = {
  currentUser: null,
  elections: [],
  selectedCandidateId: null,
  selectedCandidateName: "",
  currentElectionId: null,
  lastTxHash: "",
  currentRole: "",
  adminToken: localStorage.getItem(ADMIN_TOKEN_KEY) || "",
  adminUser: null,
  adminSelectedElectionId: "",
  adminCandidateSelections: {},
};

const views = document.querySelectorAll(".view");
const alertBox = document.getElementById("alertBox");
const registerHeading = document.getElementById("registerHeading");
const candidateList = document.getElementById("candidateList");
const castVoteButton = document.getElementById("castVoteButton");
const goToVoteButton = document.getElementById("goToVoteButton");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const modalActions = document.getElementById("modalActions");
const dashboardName = document.getElementById("dashboardName");
const dashboardRole = document.getElementById("dashboardRole");
const dashboardWallet = document.getElementById("dashboardWallet");
const voteStatusHeading = document.getElementById("voteStatusHeading");
const voteStatusCopy = document.getElementById("voteStatusCopy");
const receiptId = document.getElementById("receiptId");
const receiptCandidate = document.getElementById("receiptCandidate");
const receiptStatus = document.getElementById("receiptStatus");
const authShell = document.getElementById("authShell");
const appShell = document.getElementById("appShell");
const navItems = document.querySelectorAll(".nav-item");
const voterOnlyNavItems = document.querySelectorAll(".voter-only");
const adminOnlyNavItems = document.querySelectorAll(".admin-only");
const electionSelector = document.getElementById("electionSelector");
const electionSelectorWrap = document.getElementById("electionSelectorWrap");
const adminUsernameDisplay = document.getElementById("adminUsernameDisplay");
const adminLoginForm = document.getElementById("adminLoginForm");
const adminLogoutButton = document.getElementById("adminLogoutButton");
const adminElectionSelect = document.getElementById("adminElectionSelect");
const adminCandidateList = document.getElementById("adminCandidateList");
const saveCandidateApprovalButton = document.getElementById("saveCandidateApprovalButton");

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json()
    : { message: await res.text() };

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function getCurrentElection() {
  return state.elections.find((election) => election._id === state.currentElectionId) || null;
}

function getVoteRecordForElection(electionId = state.currentElectionId) {
  return state.currentUser?.votedElections?.find(
    (record) => String(record.electionId) === String(electionId)
  ) || null;
}

function hasVotedInElection(electionId = state.currentElectionId) {
  return Boolean(getVoteRecordForElection(electionId));
}

function getAdminHeaders() {
  return state.adminToken
    ? { Authorization: `Bearer ${state.adminToken}` }
    : {};
}

function showView(viewId) {
  views.forEach((view) => view.classList.toggle("active", view.id === viewId));
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.viewTarget === viewId);
  });
  clearAlert();
}

function showAlert(message, type) {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
}

function clearAlert() {
  alertBox.className = "alert hidden";
  alertBox.textContent = "";
}

function resetAuthForms() {
  document.getElementById("registerForm").reset();
  document.getElementById("photoPreview").style.display = "none";
  document.getElementById("signinForm").reset();
  adminLoginForm.reset();
}

function setLoading(button, loading) {
  button.disabled = loading;
  button.dataset.originalText = button.dataset.originalText || button.textContent;
  button.textContent = loading ? "Please wait..." : button.dataset.originalText;
}

function closeModal() {
  modalOverlay.classList.add("hidden");
  modalOverlay.setAttribute("aria-hidden", "true");
}

function openModal(title, message, actions) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modalActions.innerHTML = "";

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = action.variant === "secondary"
      ? "secondary-button wide-button"
      : "primary-button wide-button";
    button.textContent = action.label;
    button.addEventListener("click", () => {
      closeModal();
      if (action.onClick) {
        action.onClick();
      }
    });
    modalActions.appendChild(button);
  });

  modalOverlay.classList.remove("hidden");
  modalOverlay.setAttribute("aria-hidden", "false");
}

function showAuthenticatedApp(defaultView = "dashboardView") {
  document.body.classList.remove("auth-mode");
  authShell.classList.add("hidden");
  appShell.classList.remove("hidden");
  updateAdminUI();
  showView(defaultView);
}

function showAuthPortal(defaultView = "homeView") {
  document.body.classList.add("auth-mode");
  appShell.classList.add("hidden");
  authShell.classList.remove("hidden");
  showView(defaultView);
}

function persistAdminSession(token, admin) {
  state.adminToken = token;
  state.adminUser = admin;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  updateAdminUI();
}

function clearAdminSession() {
  state.adminToken = "";
  state.adminUser = null;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  updateAdminUI();
}

function isAdminAuthenticated() {
  return Boolean(state.adminToken && state.adminUser);
}

function updateAdminUI() {
  const adminVisible = isAdminAuthenticated();
  adminOnlyNavItems.forEach((element) => {
    element.style.display = adminVisible ? "" : "none";
  });

  voterOnlyNavItems.forEach((element) => {
    element.style.display = state.currentUser ? "" : "none";
  });

  adminUsernameDisplay.textContent = state.adminUser?.username || "-";
}

async function verifyStoredAdminSession() {
  if (!state.adminToken) {
    updateAdminUI();
    return false;
  }

  try {
    const data = await apiFetch("/admin/session", {
      headers: getAdminHeaders(),
    });
    state.adminUser = data.admin;
    updateAdminUI();
    return true;
  } catch (error) {
    clearAdminSession();
    return false;
  }
}

async function ensureElectionsLoaded() {
  const data = await apiFetch("/elections");
  state.elections = data.data || [];

  if (state.elections.length && (!state.currentElectionId || !state.elections.some((election) => election._id === state.currentElectionId))) {
    state.currentElectionId = state.elections[0]._id;
  }

  if (state.elections.length && (!state.adminSelectedElectionId || !state.elections.some((election) => election._id === state.adminSelectedElectionId))) {
    state.adminSelectedElectionId = state.elections[0]._id;
  }

  return state.elections;
}

function renderDashboard() {
  const user = state.currentUser;
  if (!user) return; // Admin portal has no voter session — skip dashboard render
  const currentElection = getCurrentElection();
  const currentVote = getVoteRecordForElection();

  dashboardName.textContent = user.name;
  dashboardRole.textContent = `Voter | Aadhar: ${user.aadharNumber}`;
  dashboardWallet.textContent = `Email: ${user.email}`;

  if (!currentElection) {
    voteStatusHeading.textContent = "No election selected";
    voteStatusCopy.textContent = "No election is available right now.";
    goToVoteButton.disabled = true;
    goToVoteButton.textContent = "No Active Election";
    return;
  }

  if (currentVote) {
    voteStatusHeading.textContent = "Vote submitted";
    voteStatusCopy.textContent = `Your ballot for ${currentElection.title} has been recorded on the blockchain.`;
    goToVoteButton.disabled = true;
    goToVoteButton.textContent = "Submission Complete";
    return;
  }

  voteStatusHeading.textContent = currentElection.status === "active" ? "Pending" : currentElection.status;
  voteStatusCopy.textContent = currentElection.status === "active"
    ? `You are eligible to vote in ${currentElection.title}.`
    : `Voting is not currently open for ${currentElection.title}.`;
  goToVoteButton.disabled = currentElection.status !== "active";
  goToVoteButton.textContent = currentElection.status === "active" ? "Go to Official Ballot" : "Voting Unavailable";
}

function renderReceipt() {
  const currentVote = getVoteRecordForElection();

  if (state.lastTxHash) {
    receiptId.textContent = state.lastTxHash;
    receiptCandidate.textContent = state.selectedCandidateName || "--";
    receiptStatus.textContent = "Recorded on blockchain";
  } else if (currentVote?.txHash) {
    receiptId.textContent = currentVote.txHash;
    receiptCandidate.textContent = "--";
    receiptStatus.textContent = "Recorded on blockchain";
  } else {
    receiptId.textContent = "--";
    receiptCandidate.textContent = "--";
    receiptStatus.textContent = "Pending";
  }
}

async function loadElections() {
  return ensureElectionsLoaded();
}

async function renderCandidates(electionId) {
  candidateList.innerHTML = "<p style='padding:1rem;color:var(--muted)'>Loading candidates...</p>";

  try {
    const data = await apiFetch(`/candidates?electionId=${encodeURIComponent(electionId)}`);
    const candidates = data.candidates || [];

    if (!candidates.length) {
      candidateList.innerHTML = "<p style='padding:1rem;color:var(--muted)'>No approved candidates are available for this election yet.</p>";
      return;
    }

    candidateList.innerHTML = "";
    candidateList.classList.toggle("scrollable", candidates.length > 4);

    candidates.forEach((candidate) => {
      const isNOTA = candidate.isNOTA || candidate.name === "None of the Above";
      const symbol = candidate.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

      const card = document.createElement("button");
      card.type = "button";
      card.className = "candidate-card";
      if (isNOTA) {
        card.classList.add("nota");
      }
      card.dataset.candidateId = candidate._id;

      if (candidate._id === state.selectedCandidateId) {
        card.classList.add("selected");
      }

      card.innerHTML = `
        <div class="candidate-top">
          <div class="candidate-meta">
            <span class="card-overline">${isNOTA ? "Option" : "Candidate"}</span>
            <h3>${candidate.name}</h3>
            <p>${candidate.party || "Independent"}</p>
          </div>
          <div class="candidate-symbol" style="${candidate.photoUrl ? "padding:0;overflow:hidden;" : ""}">
            ${candidate.photoUrl
              ? `<img src="${candidate.photoUrl}" alt="${candidate.name}" style="width:100%;height:100%;object-fit:cover;">`
              : (symbol || "CA")
            }
          </div>
        </div>
        <div class="selection-row">
          <div class="selection-dot" aria-hidden="true"></div>
        </div>
      `;

      card.addEventListener("click", () => {
        state.selectedCandidateId = candidate._id;
        state.selectedCandidateName = `${candidate.name} (${candidate.party || "Independent"})`;
        document.querySelectorAll(".candidate-card").forEach((candidateCard) => {
          candidateCard.classList.toggle(
            "selected",
            candidateCard.dataset.candidateId === state.selectedCandidateId
          );
        });
      });

      candidateList.appendChild(card);
    });
  } catch (error) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--danger);margin-bottom:1rem">Could not load candidates: ${error.message}</p>
        <button type="button" id="retryCandidatesButton" class="primary-button" style="padding:10px 24px;border-radius:12px">
          Retry
        </button>
      </div>
    `;
    document.getElementById("retryCandidatesButton").addEventListener("click", () => {
      renderCandidates(electionId);
    });
  }
}

async function loadBallot() {
  candidateList.innerHTML = `
    <div style="padding:2rem;text-align:center;color:var(--muted)">
      <p style="font-size:1rem;margin-bottom:0.5rem">Loading ballot...</p>
      <p style="font-size:0.8rem">This may take a moment if the server is waking up.</p>
    </div>
  `;

  let elections = [];
  try {
    elections = await ensureElectionsLoaded();
  } catch (error) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--danger);margin-bottom:1rem">Could not load elections. The server may be starting up.</p>
        <button type="button" id="retryBallotButton" class="primary-button" style="padding:10px 24px;border-radius:12px">
          Retry
        </button>
      </div>
    `;
    document.getElementById("retryBallotButton").addEventListener("click", loadBallot);
    return;
  }

  if (!elections.length) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--muted);margin-bottom:1rem">No elections found. Please check back later.</p>
      </div>
    `;
    renderDashboard();
    return;
  }

  if (elections.length > 1) {
    electionSelectorWrap.style.display = "block";
    electionSelector.innerHTML = elections
      .map((election) => `<option value="${election._id}">${election.title}</option>`)
      .join("");
    electionSelector.value = state.currentElectionId;
  } else {
    electionSelectorWrap.style.display = "none";
    state.currentElectionId = elections[0]._id;
  }

  renderDashboard();

  if (hasVotedInElection()) {
    candidateList.innerHTML = `
      <div style="padding:2rem;text-align:center">
        <p style="color:var(--muted);margin-bottom:1rem">You have already voted in this election.</p>
      </div>
    `;
    return;
  }

  await renderCandidates(state.currentElectionId);
}

async function setRole(role) {
  state.currentRole = role;
  registerHeading.textContent = role === "candidate" ? "Register Candidate" : "Register Voter";
  document.getElementById("registerForm").reset();
  document.getElementById("photoPreview").style.display = "none";

  document.getElementById("aadharField").style.display = role === "voter" ? "" : "none";
  document.getElementById("dobField").style.display = role === "voter" ? "" : "none";
  document.getElementById("emailField").style.display = role === "voter" ? "" : "none";
  document.getElementById("partyField").style.display = role === "candidate" ? "" : "none";
  document.getElementById("electionField").style.display = role === "candidate" ? "" : "none";
  document.getElementById("photoField").style.display = role === "candidate" ? "" : "none";
  document.getElementById("photoField").style.display = role === "candidate" ? "" : "none";

  document.getElementById("registerAadhar").required = role === "voter";
  document.getElementById("registerDOB").required = role === "voter";
  document.getElementById("registerEmail").required = role === "voter";
  document.getElementById("registerParty").required = role === "candidate";
  document.getElementById("registerElection").required = role === "candidate";

  if (role === "candidate") {
    const elections = await loadElections();
    const select = document.getElementById("registerElection");
    if (elections.length) {
      select.innerHTML = elections
        .map((election) => `<option value="${election._id}">${election.title}</option>`)
        .join("");
    } else {
      select.innerHTML = "<option value=''>No elections available</option>";
    }
  }

  showView("registerFormView");
}

function renderAdminElectionSummary(elections) {
  const list = document.getElementById("adminElectionList");

  if (!elections.length) {
    list.innerHTML = "<p style='color:var(--muted);font-size:0.9rem'>No elections yet. Create one above.</p>";
    return;
  }

  list.innerHTML = elections.map((election) => `
    <div style="padding:12px 0;border-bottom:1px solid var(--line)">
      <strong style="font-size:1rem">${election.title}</strong>
      <p style="margin:4px 0 0;font-size:0.82rem;color:var(--muted)">
        Status: <b>${election.status}</b> | ${new Date(election.startDate).toLocaleDateString()} to ${new Date(election.endDate).toLocaleDateString()}
      </p>
      <p style="margin:6px 0 0;font-size:0.82rem;color:var(--muted)">${election.description || "No description provided."}</p>
    </div>
  `).join("");
}

function renderAdminElectionSelect(elections) {
  if (!elections.length) {
    adminElectionSelect.innerHTML = "<option value=''>No elections available</option>";
    state.adminSelectedElectionId = "";
    return;
  }

  if (!state.adminSelectedElectionId || !elections.some((election) => election._id === state.adminSelectedElectionId)) {
    state.adminSelectedElectionId = elections[0]._id;
  }

  adminElectionSelect.innerHTML = elections
    .map((election) => `<option value="${election._id}">${election.title}</option>`)
    .join("");
  adminElectionSelect.value = state.adminSelectedElectionId;
}

async function updateCandidateApproval(candidateId, approvalStatus) {
  await apiFetch(`/candidates/${candidateId}/approval`, {
    method: "PATCH",
    headers: getAdminHeaders(),
    body: JSON.stringify({ approvalStatus }),
  });

  await Promise.all([
    loadAdminCandidates(),
    ensureElectionsLoaded(),
  ]);

  if (state.currentElectionId === state.adminSelectedElectionId) {
    await loadBallot();
  }
}

async function loadAdminCandidates() {
  if (!state.adminSelectedElectionId) {
    adminCandidateList.innerHTML = "<p style='color:var(--muted);font-size:0.9rem'>Select an election to review candidates.</p>";
    state.adminCandidateSelections = {};
    saveCandidateApprovalButton.disabled = true;
    return;
  }

  adminCandidateList.innerHTML = "<p style='color:var(--muted);font-size:0.9rem'>Loading candidates...</p>";
  state.adminCandidateSelections = {};
  saveCandidateApprovalButton.disabled = true;

  try {
    const data = await apiFetch(`/candidates/admin?electionId=${encodeURIComponent(state.adminSelectedElectionId)}`, {
      headers: getAdminHeaders(),
    });

    const candidates = data.candidates || [];
    const reviewCandidates = candidates.filter((candidate) => !candidate.isNOTA);

    if (!reviewCandidates.length) {
      adminCandidateList.innerHTML = "<p style='color:var(--muted);font-size:0.9rem'>No registered candidates were found for this election yet.</p>";
      saveCandidateApprovalButton.disabled = true;
      return;
    }

    adminCandidateList.innerHTML = "";
    state.adminCandidateSelections = Object.fromEntries(
      reviewCandidates.map((candidate) => [candidate._id, candidate.approvalStatus === "approved"])
    );

    reviewCandidates.forEach((candidate) => {
      const item = document.createElement("article");
      item.className = "admin-candidate-item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "admin-candidate-checkbox";
      checkbox.checked = candidate.approvalStatus === "approved";
      checkbox.addEventListener("change", () => {
        state.adminCandidateSelections[candidate._id] = checkbox.checked;
      });

      const meta = document.createElement("div");
      meta.className = "admin-candidate-meta";
      meta.innerHTML = `
        <h4>${candidate.name}</h4>
        <p>${candidate.party || "Independent"}</p>
        <p>Current status: <span class="admin-status-badge ${candidate.approvalStatus}">${candidate.approvalStatus}</span></p>
      `;

      item.appendChild(checkbox);
      item.appendChild(meta);
      adminCandidateList.appendChild(item);
    });
    saveCandidateApprovalButton.disabled = false;
  } catch (error) {
    adminCandidateList.innerHTML = `<p style='color:var(--danger);font-size:0.9rem'>Error: ${error.message}</p>`;
    state.adminCandidateSelections = {};
    saveCandidateApprovalButton.disabled = true;
  }
}

async function loadAdminElections() {
  try {
    const elections = await ensureElectionsLoaded();
    renderAdminElectionSummary(elections);
    renderAdminElectionSelect(elections);
    await loadAdminCandidates();
  } catch (error) {
    document.getElementById("adminElectionList").innerHTML = `<p style='color:var(--danger);font-size:0.9rem'>Error: ${error.message}</p>`;
    adminCandidateList.innerHTML = `<p style='color:var(--danger);font-size:0.9rem'>Error: ${error.message}</p>`;
  }
}

document.getElementById("registerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitBtn = event.target.querySelector("[type=submit]");
  setLoading(submitBtn, true);
  clearAlert();

  const name = document.getElementById("registerName").value.trim();

  try {
    if (state.currentRole === "voter") {
      const aadharNumber = document.getElementById("registerAadhar").value.trim();
      const dateOfBirth = document.getElementById("registerDOB").value;
      const email = document.getElementById("registerEmail").value.trim();

      if (!/^\d{12}$/.test(aadharNumber)) {
        throw new Error("Aadhar number must be exactly 12 digits");
      }

      if (!dateOfBirth) {
        throw new Error("Date of birth is required");
      }

      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
      }

      if (age < 18) {
        throw new Error("You must be at least 18 years old to register as a voter");
      }

      if (dob > today) {
        throw new Error("Date of birth cannot be in the future");
      }

      await apiFetch("/voters", {
        method: "POST",
        body: JSON.stringify({ name, email, aadharNumber, dateOfBirth }),
      });
    } else {
      const party = document.getElementById("registerParty").value.trim();
      const electionId = document.getElementById("registerElection").value;

      // Use FormData so photo file can be sent with text fields
      const photoFile = document.getElementById("registerPhoto").files[0];
      const formData = new FormData();
      formData.append("name", name);
      formData.append("party", party);
      formData.append("electionId", electionId);
      if (photoFile) formData.append("photo", photoFile);

      const uploadRes = await fetch(`${API_BASE}/candidates`, {
        method: "POST",
        body: formData,
        // Do NOT set Content-Type — browser sets multipart boundary automatically
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.message || "Registration failed");
    }

    const registeredRole = state.currentRole;
    event.target.reset();
    openModal(
      "Registration Complete",
      registeredRole === "candidate"
        ? "Candidate registered successfully and sent for admin review."
        : "Voter registered successfully.",
      [
        {
          label: registeredRole === "voter" ? "Register Another Voter" : "Register Another Candidate",
          onClick: () => {
            state.currentRole = registeredRole;
            document.getElementById("registerForm").reset();
  document.getElementById("photoPreview").style.display = "none";
            showView("registerFormView");
          },
        },
        {
          label: "Return to Welcome Page",
          variant: "secondary",
          onClick: () => showAuthPortal("homeView"),
        },
      ]
    );
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    setLoading(submitBtn, false);
  }
});

document.getElementById("signinForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitBtn = event.target.querySelector("[type=submit]");
  setLoading(submitBtn, true);
  clearAlert();

  const aadharNumber = document.getElementById("signinAadhar").value.trim();

  try {
    if (!/^\d{12}$/.test(aadharNumber)) {
      throw new Error("Aadhar number must be exactly 12 digits");
    }

    const data = await apiFetch(`/voters/lookup?aadharNumber=${encodeURIComponent(aadharNumber)}`);
    state.currentUser = data.voter;
    state.selectedCandidateId = null;
    state.selectedCandidateName = "";
    state.lastTxHash = "";
    await ensureElectionsLoaded();
    renderDashboard();
    showAuthenticatedApp("dashboardView");
    loadBallot().catch(() => {});
  } catch (error) {
    showAlert(
      error.message === "Voter not found with this Aadhar number"
        ? "No voter found with this Aadhar number. Please register first."
        : error.message,
      "error"
    );
  } finally {
    setLoading(submitBtn, false);
  }
});

adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitBtn = event.target.querySelector("[type=submit]");
  setLoading(submitBtn, true);
  clearAlert();

  try {
    const username = document.getElementById("adminUsername").value.trim();
    const password = document.getElementById("adminPassword").value;
    const data = await apiFetch("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    persistAdminSession(data.token, data.admin);
    await loadAdminElections();
    showAuthenticatedApp("adminView");
  } catch (error) {
    showAlert(error.message, "error");
  } finally {
    setLoading(submitBtn, false);
  }
});

document.querySelectorAll("[data-view-target]").forEach((button) => {
  button.addEventListener("click", async () => {
    const targetView = button.dataset.viewTarget;

    if (["homeView", "registerChoiceView", "registerFormView", "signinView", "adminLoginView"].includes(targetView)) {
      closeModal();
      if (targetView === "homeView" || targetView === "registerChoiceView") {
        state.currentRole = "";
      }
    }

    if (targetView === "dashboardView" && state.currentUser) {
      renderDashboard();
      showAuthenticatedApp(targetView);
      return;
    }

    if (targetView === "ballotView" && state.currentUser) {
      state.selectedCandidateId = null;
      await loadBallot();
      showAuthenticatedApp(targetView);
      return;
    }

    if (targetView === "receiptView") {
      renderReceipt();
      showAuthenticatedApp(targetView);
      return;
    }

    if (targetView === "adminView") {
      const validSession = await verifyStoredAdminSession();
      if (!validSession) {
        showAuthPortal("adminLoginView");
        showAlert("Please sign in as admin to continue.", "error");
        return;
      }
      await loadAdminElections();
      showAuthenticatedApp("adminView");
      return;
    }

    showView(targetView);
  });
});

document.querySelectorAll(".role-button").forEach((button) => {
  button.addEventListener("click", () => setRole(button.dataset.role));
});

electionSelector.addEventListener("change", async () => {
  state.currentElectionId = electionSelector.value;
  state.selectedCandidateId = null;
  state.selectedCandidateName = "";
  state.lastTxHash = "";
  renderDashboard();
  await loadBallot();
});

adminElectionSelect.addEventListener("change", async () => {
  state.adminSelectedElectionId = adminElectionSelect.value;
  await loadAdminCandidates();
});

saveCandidateApprovalButton.addEventListener("click", async () => {
  const candidateIds = Object.keys(state.adminCandidateSelections);

  if (!candidateIds.length) {
    openModal("No Candidates Found", "There are no registered candidates to update for this election.", [
      { label: "Close", variant: "secondary", onClick: () => {} },
    ]);
    return;
  }

  setLoading(saveCandidateApprovalButton, true);

  try {
    await Promise.all(candidateIds.map(async (candidateId) => {
      const approvalStatus = state.adminCandidateSelections[candidateId] ? "approved" : "rejected";
      await updateCandidateApproval(candidateId, approvalStatus);
    }));

    await loadAdminCandidates();

    openModal("Candidate Access Saved", "The selected candidates are now the ones allowed to appear on the ballot.", [
      { label: "OK", onClick: () => showAuthenticatedApp("adminView") },
    ]);
  } catch (error) {
    openModal("Update Failed", error.message, [
      { label: "Close", variant: "secondary", onClick: () => {} },
    ]);
  } finally {
    setLoading(saveCandidateApprovalButton, false);
  }
});

goToVoteButton.addEventListener("click", async () => {
  if (!state.currentUser || hasVotedInElection() || getCurrentElection()?.status !== "active") {
    return;
  }

  state.selectedCandidateId = null;
  await loadBallot();
  showAuthenticatedApp("ballotView");
});

castVoteButton.addEventListener("click", async () => {
  if (!state.selectedCandidateId) {
    openModal("Selection Required", "Please select one candidate before submitting the ballot.", [
      { label: "Return to Ballot", onClick: () => showAuthenticatedApp("ballotView") },
    ]);
    return;
  }

  setLoading(castVoteButton, true);

  try {
    const data = await apiFetch("/votes", {
      method: "POST",
      body: JSON.stringify({
        voterId: state.currentUser._id,
        candidateId: state.selectedCandidateId,
        electionId: state.currentElectionId,
      }),
    });

    state.currentUser.votedElections = [
      ...(state.currentUser.votedElections || []),
      {
        electionId: state.currentElectionId,
        txHash: data.txHash,
        votedAt: new Date().toISOString(),
      },
    ];
    state.lastTxHash = data.txHash;

    receiptId.textContent = data.txHash;
    receiptCandidate.textContent = state.selectedCandidateName || "--";
    receiptStatus.textContent = "Recorded on blockchain";

    renderDashboard();

    openModal("Vote Recorded Successfully", "Your vote has been submitted to the blockchain for this election.", [
      { label: "View Receipt", onClick: () => showAuthenticatedApp("receiptView") },
      { label: "Back to Dashboard", variant: "secondary", onClick: () => showAuthenticatedApp("dashboardView") },
    ]);
  } catch (error) {
    openModal("Vote Failed", error.message, [
      { label: "Close", variant: "secondary", onClick: () => {} },
    ]);
  } finally {
    setLoading(castVoteButton, false);
  }
});

document.getElementById("createElectionBtn").addEventListener("click", async () => {
  const btn = document.getElementById("createElectionBtn");
  const title = document.getElementById("electionTitle").value.trim();
  const description = document.getElementById("electionDesc").value.trim();
  const startDate = document.getElementById("electionStart").value;
  const endDate = document.getElementById("electionEnd").value;

  if (!isAdminAuthenticated()) {
    openModal("Admin Sign-In Required", "Please sign in again before creating an election.", [
      { label: "Open Admin Login", onClick: () => showAuthPortal("adminLoginView") },
    ]);
    return;
  }

  if (!title || !startDate || !endDate) {
    openModal("Missing Details", "Please fill in the title, start date, and end date.", [
      { label: "Back", variant: "secondary", onClick: () => showAuthenticatedApp("adminView") },
    ]);
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    openModal("Invalid Dates", "End date must be after start date.", [
      { label: "Back", variant: "secondary", onClick: () => showAuthenticatedApp("adminView") },
    ]);
    return;
  }

  setLoading(btn, true);
  try {
    await apiFetch("/elections", {
      method: "POST",
      headers: getAdminHeaders(),
      body: JSON.stringify({ title, description, startDate, endDate }),
    });

    ["electionTitle", "electionDesc", "electionStart", "electionEnd"].forEach((id) => {
      document.getElementById(id).value = "";
    });

    await loadAdminElections();
    renderDashboard();
    openModal("Election Created", `"${title}" is now available for candidate registration.`, [
      { label: "Stay Here", onClick: () => showAuthenticatedApp("adminView") },
    ]);
  } catch (error) {
    if (error.message.includes("Admin session")) {
      clearAdminSession();
    }
    openModal("Creation Failed", error.message, [
      { label: "Back", variant: "secondary", onClick: () => showAuthenticatedApp("adminView") },
    ]);
  } finally {
    setLoading(btn, false);
  }
});

adminLogoutButton.addEventListener("click", () => {
  clearAdminSession();
  if (!state.currentUser) {
    showAuthPortal("homeView");
    return;
  }
  showAuthenticatedApp("dashboardView");
});

document.getElementById("signOutButton").addEventListener("click", () => {
  state.currentUser = null;
  state.elections = [];
  state.selectedCandidateId = null;
  state.selectedCandidateName = "";
  state.lastTxHash = "";
  state.currentElectionId = null;
  state.currentRole = "";
  state.adminSelectedElectionId = "";
  closeModal();
  resetAuthForms();
  if (isAdminAuthenticated()) {
    showAuthenticatedApp("adminView");
    return;
  }
  showAuthPortal("homeView");
});

closeModal();
showAuthPortal("homeView");
verifyStoredAdminSession();

// ─── Candidate Photo Preview ──────────────────────────────────────────────────
document.getElementById("registerPhoto").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("photoPreview");
  const previewImg = document.getElementById("photoPreviewImg");

  if (!file) {
    preview.style.display = "none";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("Photo must be under 2MB.");
    this.value = "";
    preview.style.display = "none";
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    preview.style.display = "block";
  };
  reader.readAsDataURL(file);
});