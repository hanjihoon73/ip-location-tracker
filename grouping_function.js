// Group IPs by subnet based on IP address class
// Class A (1-127): Group by first octet
// Class B (128-191): Group by first two octets
// Class C (192-223): Group by first three octets
function groupIPsBySubnet(ipAddresses) {
    const groups = new Map();

    for (const ip of ipAddresses) {
        const parts = ip.split('.');
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
