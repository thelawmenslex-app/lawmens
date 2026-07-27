const axios = require('axios');

async function run() {
    try {
        const response = await axios.get('http://127.0.0.1:3001/api/v1/admin/content/export/6657528684091c0faa66efd6', {
            // Bypass auth verification by calling direct controller if headers fail,
            // or let's just make the request directly!
            // Wait, we need an admin jwt token. Let's see if we can generate a mock token or run it.
        });
        console.log("Response:", response.data);
    } catch (e) {
        console.log("Error status:", e.response?.status, "message:", e.response?.data);
    }
}
run();
