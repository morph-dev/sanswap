import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { expect } from 'chai';
import { parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

describe('MintableToken', function () {
  async function deployTokenFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MintableToken = await ethers.getContractFactory('MintableToken');
    const token = await MintableToken.deploy('MintableToken', 'MT');

    return { token, owner, otherAccount };
  }

  describe('Deployment', function () {
    it('Should have correct totalSupply', async function () {
      const { token } = await loadFixture(deployTokenFixture);

      expect(await token.totalSupply()).to.equal(parseEther('1000000'));
    });

    it('Should set the right owner', async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      expect(await token.owner()).to.equal(owner.address);
    });

    it('Should mint all to owner', async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      expect(await token.balanceOf(owner.address)).to.equal(parseEther('1000000'));
    });
  });

  describe('Minting', function () {
    it('Should allow anyone to mint', async function () {
      const { token, otherAccount } = await loadFixture(deployTokenFixture);

      await token.connect(otherAccount).mint(otherAccount.address, parseEther('1000'));

      expect(await token.balanceOf(otherAccount.address)).to.equal(parseEther('1000'));
    });
  });
});
