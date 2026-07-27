const axios = require('axios');

async function test() {
  try {
    console.log("Logging in as admin...");
    const loginRes = await axios.post('http://127.0.0.1:3001/api/v1/admin/login', {
      email: 'admin@yopmail.com',
      password: 'Admin@123'
    });

    if (!loginRes.data.status) {
      console.log("Login failed:", loginRes.data);
      return;
    }

    const token = loginRes.data.data.token;
    console.log("Logged in successfully. Token obtained.");

    console.log("\n--- Testing Analytics Endpoint ---");
    try {
      const analyticsRes = await axios.get('http://127.0.0.1:3001/api/v1/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Analytics Status:", analyticsRes.status);
      console.log("Analytics Data:", JSON.stringify(analyticsRes.data).substring(0, 300));
    } catch (e) {
      console.error("Analytics failed with error:", e.response?.status, e.response?.data || e.message);
    }

    console.log("\n--- Testing Users Directory Endpoint ---");
    try {
      const usersRes = await axios.get('http://127.0.0.1:3001/api/v1/admin/users?page=1&limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Users Status:", usersRes.status);
      console.log("Users Data count:", usersRes.data?.data?.users?.length);
    } catch (e) {
      console.error("Users failed with error:", e.response?.status, e.response?.data || e.message);
    }

    console.log("\n--- Testing Payments Logs Endpoint ---");
    try {
      const paymentsRes = await axios.get('http://127.0.0.1:3001/api/v1/admin/payments?page=1&limit=10', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Payments Status:", paymentsRes.status);
      console.log("Payments Data count:", paymentsRes.data?.data?.payments?.length);
    } catch (e) {
      console.error("Payments failed with error:", e.response?.status, e.response?.data || e.message);
    }

    console.log("\n--- Testing Audit Logs Endpoint (audit-logs) ---");
    try {
      const logsRes = await axios.get('http://127.0.0.1:3001/api/v1/admin/audit-logs?page=1&limit=15', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Audit Logs Status:", logsRes.status);
      console.log("Audit Logs Data count:", logsRes.data?.data?.logs?.length);
    } catch (e) {
      console.error("Audit Logs failed with error:", e.response?.status, e.response?.data || e.message);
    }

  } catch (err) {
    console.error("Overall error:", err.response?.status, err.response?.data || err.message);
  }
}

test();
