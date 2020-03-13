const Migrations = artifacts.require("Migrations");
const Hello = artifacts.require("Hello");
const PayableHello = artifacts.require("PayableHello");
const ProposableHello = artifacts.require("ProposableHello");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Hello);
  deployer.deploy(PayableHello);
  deployer.deploy(ProposableHello);
};
