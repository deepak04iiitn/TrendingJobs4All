import axios from 'axios';

export async function fetchAdminOverview() {
  const res = await axios.get('/backend/admin/overview');
  return res.data;
}

export async function fetchUsers(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const res = await axios.get(`/backend/user/getusers?${search}`);
  return res.data;
}

export async function deleteUser(userId) {
  await axios.delete(`/backend/user/delete/${userId}`);
}

export async function fetchComments(params = {}) {
  const search = new URLSearchParams(params);
  const res = await axios.get(`/backend/comment/getComments?${search}`);
  return res.data;
}

export async function deleteComment(id) {
  await axios.delete(`/backend/comment/deleteComment/${id}`);
}

export async function fetchInterviews(params = {}) {
  const search = new URLSearchParams(params);
  const res = await axios.get(`/backend/interviews/getInterviewExp?${search}`);
  return res.data;
}

export async function deleteInterview(id) {
  await axios.delete(`/backend/interviews/delete/${id}`);
}

export async function fetchSalaries(params = {}) {
  const search = new URLSearchParams(params);
  const res = await axios.get(`/backend/salary/getSalary?${search}`);
  return res.data;
}

export async function deleteSalary(id) {
  await axios.delete(`/backend/salary/delete/${id}`);
}

export async function fetchBugs(params = {}) {
  const search = new URLSearchParams(params);
  const res = await axios.get(`/backend/bugs?${search}`);
  return res.data;
}

export async function updateBugStatus(id, status) {
  const res = await axios.patch(`/backend/bugs/${id}/status`, { status });
  return res.data;
}

export async function fetchFeatures(params = {}) {
  const search = new URLSearchParams(params);
  const res = await axios.get(`/backend/feature-requests?${search}`);
  return res.data;
}

export async function updateFeatureStatus(id, status) {
  const res = await axios.patch(`/backend/feature-requests/${id}/status`, { status });
  return res.data;
}

export async function fetchDsaUsersStats(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const res = await axios.get(`/backend/dsa-problems/admin/users-stats?${search}`);
  return res.data;
}

export async function fetchDsaLeaderboard(limit = 20) {
  const res = await axios.get(`/backend/dsa-problems/admin/leaderboard?limit=${limit}`);
  return res.data;
}

export async function fetchInterviewQuestions(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const res = await axios.get(`/backend/interview-questions/get?${search}`);
  return res.data;
}

export async function deleteInterviewQuestion(id) {
  await axios.delete(`/backend/interview-questions/delete/${id}`);
}

export async function createInterviewQuestion(formData) {
  const res = await axios.post('/backend/interview-questions/create', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function fetchRoadmaps() {
  const res = await axios.get('/backend/roadmaps/roadmaps');
  return res.data;
}

export async function deleteRoadmap(id) {
  await axios.delete(`/backend/roadmaps/admin/${id}`);
}

export async function fetchPremiumOverview() {
  const res = await axios.get('/backend/admin/premium-jobs/overview');
  return res.data;
}

export async function fetchPremiumSubscribers(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const res = await axios.get(`/backend/admin/premium-jobs/subscribers?${search}`);
  return res.data;
}

export async function updatePremiumSubscriber(id, updates) {
  const res = await axios.patch(`/backend/admin/premium-jobs/subscribers/${id}`, updates);
  return res.data;
}

export async function cancelPremiumSubscriber(id) {
  const res = await axios.post(`/backend/admin/premium-jobs/subscribers/${id}/cancel`);
  return res.data;
}

export async function syncPremiumSubscriber(id) {
  const res = await axios.post(`/backend/admin/premium-jobs/subscribers/${id}/sync`);
  return res.data;
}

export async function sendPremiumEmailNow(id) {
  const res = await axios.post(`/backend/admin/premium-jobs/subscribers/${id}/send-now`);
  return res.data;
}

export async function triggerPremiumBatch() {
  const res = await axios.post('/backend/admin/premium-jobs/trigger-batch');
  return res.data;
}

export async function fetchPremiumEmailLogs(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.append(k, v);
  });
  const res = await axios.get(`/backend/admin/premium-jobs/email-logs?${search}`);
  return res.data;
}
