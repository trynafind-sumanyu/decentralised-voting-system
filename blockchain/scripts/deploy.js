const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const Voting = await hre.ethers.getContractFactory("Voting");
    const voting = await Voting.deploy();

    // ❌ REMOVE THIS (v6 only)
    // await voting.waitForDeployment();

    // ✅ USE THIS (ethers v5)
    await voting.deployed();

    const address = voting.address;

    console.log("Contract deployed to:", address);

    const network = hre.network.name;

    const filePath = path.join(__dirname, "../deployedAddresses.json");

    let data = {};

    if (fs.existsSync(filePath)) {
        data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    data[network] = address;

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Saved address for ${network}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});