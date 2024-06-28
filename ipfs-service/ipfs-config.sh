#!/bin/sh

echo "Configuring IPFS..."
ipfs config Gateway.NoFetch true --json
ipfs config Gateway.PublicGateways '{"localhost": {"UseSubdomains": false, "Paths": ["/ipfs", "/ipns"]}, "marketplace.arbius.ai": {"UseSubdomains": false, "Paths": ["/ipfs", "/ipns"]}}' --json
ipfs config API.HTTPHeaders.Access-Control-Allow-Origin "[\"*\"]" --json
