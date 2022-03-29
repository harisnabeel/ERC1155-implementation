const fs = require("fs");
const path = require("path");

async function updateContractAddresses(contractAddress = {}, network) {
  // console.log(contractAddresses);
  // console.log(network, "haris nabeel");
  try {
    const dataInFile = JSON.parse(
      fs.readFileSync(
        path.resolve(__dirname, "../contract-details.json"),
        "utf8"
      )
    );

    for (const property in contractAddress) {
      dataInFile[network][property] = contractAddress[property];
    }
    // console.log("dataInFile ", dataInFile);
    fs.writeFileSync(
      path.resolve(__dirname, "../contract-details.json"),
      JSON.stringify(dataInFile)
    );
  } catch (error) {
    console.log("error ", error);
  }
}

module.exports = {
  updateContractAddresses,
};
