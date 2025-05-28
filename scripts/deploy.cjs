const { ethers } = require('hardhat')

async function main() {
	const [deployer] = await ethers.getSigners()
	console.log('Deploying contracts with the account:', deployer.address)

	// Deploy UniVoteCoin
	const UniVoteCoin = await ethers.getContractFactory('UniVoteCoin')
	const uniVoteCoin = await UniVoteCoin.deploy()
	await uniVoteCoin.waitForDeployment()
	console.log('UniVoteCoin deployed to:', uniVoteCoin.target)

	// Deploy UniVoteChain
	const UniVoteChain = await ethers.getContractFactory('UniVoteChain')
	const uniVoteChain = await UniVoteChain.deploy(uniVoteCoin.target)
	await uniVoteChain.waitForDeployment()
	console.log('UniVoteChain deployed to:', uniVoteChain.target)

	// Transfer ownership of UniVoteCoin to UniVoteChain
	await uniVoteCoin.transferOwnership(uniVoteChain.target)
	console.log('UniVoteCoin ownership transferred to UniVoteChain')

	// Verify balances and ownership
	const deployerBalance = await uniVoteCoin.balanceOf(deployer.address)
	console.log(
		'Deployer UniVoteCoin balance:',
		ethers.formatUnits(deployerBalance, 18),
		'UVC'
	)
	const owner = await uniVoteCoin.owner()
	console.log('UniVoteCoin owner:', owner)
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error)
		process.exit(1)
	})
