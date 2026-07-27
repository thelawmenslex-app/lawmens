const dns = require('dns');

console.log("1. Resolving with default DNS servers...");
dns.resolve('_mongodb._tcp.cluster0.u5bqmpo.mongodb.net', 'SRV', (err, addresses) => {
    if (err) {
        console.error("Default DNS failed:", err.message);
    } else {
        console.log("Default DNS resolved:", addresses);
    }

    console.log("\n2. Setting DNS to 8.8.8.8 & 1.1.1.1...");
    try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        dns.resolve('_mongodb._tcp.cluster0.u5bqmpo.mongodb.net', 'SRV', (err2, addresses2) => {
            if (err2) {
                console.error("8.8.8.8 DNS failed:", err2.message);
            } else {
                console.log("8.8.8.8 DNS resolved:", addresses2);
            }
        });
    } catch (e) {
        console.error("Failed to set servers:", e.message);
    }
});
