import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import exp from 'constants';
import { Signer } from 'ethers';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { ethers } from 'hardhat';
import { MintableToken, SanSwapPool } from '../typechain-types';

describe('SanSwapPool', function () {
  async function deployPoolFixture() {
    const [owner] = await ethers.getSigners();

    const MintableToken = await ethers.getContractFactory('MintableToken');

    const tokenA = await MintableToken.deploy('TokenA', 'A');
    const tokenB = await MintableToken.deploy('TokenB', 'B');
    const tokenC = await MintableToken.deploy('TokenC', 'C');

    const SanSwapPool = await ethers.getContractFactory('SanSwapPool');
    const pool = await SanSwapPool.deploy(
      'Pool',
      'POOL',
      tokenA.address,
      tokenB.address,
      tokenC.address
    );

    return { owner, pool, tokenA, tokenB, tokenC };
  }

  async function mintTokenAndTransferToPool(
    owner: Signer,
    pool: SanSwapPool,
    tokenA: MintableToken,
    tokenB: MintableToken,
    tokenC: MintableToken,
    amountA: number | string,
    amountB = amountA,
    amountC = amountA
  ) {
    for (const [token, amount] of [
      [tokenA, amountA],
      [tokenB, amountB],
      [tokenC, amountC],
    ] as const) {
      await token.mint(owner.getAddress(), parseEther(String(amount)));
      await token.connect(owner).transfer(pool.address, parseEther(String(amount)));
    }
  }

  async function mint(
    owner: Signer,
    pool: SanSwapPool,
    tokenA: MintableToken,
    tokenB: MintableToken,
    tokenC: MintableToken,
    amountA: number | string,
    amountB = amountA,
    amountC = amountA
  ) {
    await mintTokenAndTransferToPool(
      owner,
      pool,
      tokenA,
      tokenB,
      tokenC,
      amountA,
      amountB,
      amountC
    );
    await pool.mint(owner.getAddress());
  }

  async function swap(
    owner: Signer,
    pool: SanSwapPool,
    tokenA: MintableToken,
    tokenB: MintableToken,
    tokenC: MintableToken,
    amountAIn: number | string,
    amountBIn: number | string,
    amountCIn: number | string,
    amountAOut: number | string,
    amountBOut: number | string,
    amountCOut: number | string
  ) {
    await mintTokenAndTransferToPool(
      owner,
      pool,
      tokenA,
      tokenB,
      tokenC,
      amountAIn,
      amountBIn,
      amountCIn
    );
    await pool.swap(
      owner.getAddress(),
      parseEther(String(amountAOut)),
      parseEther(String(amountBOut)),
      parseEther(String(amountCOut))
    );
  }

  async function expectReserves(
    pool: SanSwapPool,
    tokenA: MintableToken,
    tokenB: MintableToken,
    tokenC: MintableToken,
    reserveA: string,
    reserveB: string,
    reserveC: string
  ) {
    expect(await pool.reserveA()).to.equal(parseEther(reserveA));
    expect(await pool.reserveB()).to.equal(parseEther(reserveB));
    expect(await pool.reserveC()).to.equal(parseEther(reserveC));
    expect(await tokenA.balanceOf(pool.address)).to.equal(parseEther(reserveA));
    expect(await tokenB.balanceOf(pool.address)).to.equal(parseEther(reserveB));
    expect(await tokenC.balanceOf(pool.address)).to.equal(parseEther(reserveC));
  }

  describe('Deployment', function () {
    it('Should have correct tokens', async function () {
      const { pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);

      expect(await pool.tokenA()).to.equal(tokenA.address);
      expect(await pool.tokenB()).to.equal(tokenB.address);
      expect(await pool.tokenC()).to.equal(tokenC.address);
    });

    it('Should have zero reserve and liquidity', async function () {
      const { pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);

      expect(await pool.totalSupply()).to.equal(0);
      expectReserves(pool, tokenA, tokenB, tokenC, '0', '0', '0');
    });
  });

  describe('Minting', function () {
    describe('Initial minting', function () {
      it('Should have correct balance when all amounts are the same.', async function () {
        const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
        await mint(owner, pool, tokenA, tokenB, tokenC, '1000');

        expect(await pool.totalSupply()).to.equal(parseEther('1000'));
        expect(await pool.balanceOf(owner.address)).to.equal(parseEther('1000'));

        expectReserves(pool, tokenA, tokenB, tokenC, '1000', '1000', '1000');
      });

      it('Should have correct balance when amounts are different.', async function () {
        const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
        await mint(owner, pool, tokenA, tokenB, tokenC, '1000', '2000', '3000');

        // minted liquidity should be average
        expect(await pool.totalSupply()).to.equal(parseEther('2000'));
        expect(await pool.balanceOf(owner.address)).to.equal(parseEther('2000'));

        expectReserves(pool, tokenA, tokenB, tokenC, '1000', '2000', '3000');
      });
    });

    it('Should mint proportionally', async function () {
      const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
      await mint(owner, pool, tokenA, tokenB, tokenC, '1000', '2000', '3000');

      expect(await pool.balanceOf(owner.address)).to.equal(parseEther('2000'));

      const other = await ethers.provider.getSigner(1);
      await mint(other, pool, tokenA, tokenB, tokenC, '2000', '4000', '6000');

      expect(await pool.balanceOf(other.getAddress())).to.equal(parseEther('4000'));
    });

    it('Should mint min proportion', async function () {
      const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
      await mint(owner, pool, tokenA, tokenB, tokenC, '1000', '2000', '3000');

      expect(await pool.balanceOf(owner.address)).to.equal(parseEther('2000'));

      const other = await ethers.provider.getSigner(1);
      await mint(other, pool, tokenA, tokenB, tokenC, '3000', '3000', '3000');

      expect(await pool.balanceOf(other.getAddress())).to.equal(parseEther('2000'));
    });
  });

  describe('Swapping', function () {
    it('Should swap one for one, same ratio', async function () {
      const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
      await mint(owner, pool, tokenA, tokenB, tokenC, '1000000', '1000000', '1000000');

      const [, other] = await ethers.getSigners();

      await swap(
        other,
        pool,
        tokenA,
        tokenB,
        tokenC,
        /*amountAIn=*/ '1005',
        0,
        0,
        0,
        /*amountBOut=*/ '1000',
        0
      );
      expect(await tokenB.balanceOf(other.address)).to.equal(parseEther('1000'));
      expectReserves(pool, tokenA, tokenB, tokenC, '1001005', '999000', '1000000');
    });

    it('Should swap one for one, different ratio', async function () {
      const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
      await mint(owner, pool, tokenA, tokenB, tokenC, '1000000', '2000000', '3000000');

      const [, other] = await ethers.getSigners();

      await swap(
        other,
        pool,
        tokenA,
        tokenB,
        tokenC,
        /*amountAIn=*/ '1005',
        0,
        0,
        0,
        /*amountBOut=*/ '2000',
        0
      );
      expect(await tokenB.balanceOf(other.address)).to.equal(parseEther('2000'));
      expectReserves(pool, tokenA, tokenB, tokenC, '1001005', '1998000', '3000000');
    });

    it('Should swap one for two, same ratio', async function () {
      const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
      await mint(owner, pool, tokenA, tokenB, tokenC, '1000000', '1000000', '1000000');

      const [, other] = await ethers.getSigners();

      await swap(
        other,
        pool,
        tokenA,
        tokenB,
        tokenC,
        /*amountAIn=*/ '1005',
        0,
        0,
        0,
        /*amountBOut=*/ '500',
        /*amountCOut=*/ '500'
      );
      expect(await tokenB.balanceOf(other.address)).to.equal(parseEther('500'));
      expect(await tokenC.balanceOf(other.address)).to.equal(parseEther('500'));

      expectReserves(pool, tokenA, tokenB, tokenC, '1001005', '999500', '999500');
    });

    it('Should swap one for two, different ratio', async function () {
      const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
      await mint(owner, pool, tokenA, tokenB, tokenC, '1000000', '2000000', '3000000');

      const [, other] = await ethers.getSigners();

      await swap(
        other,
        pool,
        tokenA,
        tokenB,
        tokenC,
        /*amountAIn=*/ '1005',
        0,
        0,
        0,
        /*amountBOut=*/ '1000',
        /*amountCOut=*/ '1500'
      );
      expect(await tokenB.balanceOf(other.address)).to.equal(parseEther('1000'));
      expect(await tokenC.balanceOf(other.address)).to.equal(parseEther('1500'));

      expectReserves(pool, tokenA, tokenB, tokenC, '1001005', '1999000', '2985000');
    });

    it('Should swap two for one, same ratio', async function () {
      const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
      await mint(owner, pool, tokenA, tokenB, tokenC, '1000000', '1000000', '1000000');

      const [, other] = await ethers.getSigners();

      await swap(
        other,
        pool,
        tokenA,
        tokenB,
        tokenC,
        /*amountAIn=*/ '1005',
        /*amountBIn=*/ '1005',
        0,
        0,
        0,
        /*amountCOut=*/ '2000'
      );
      expect(await tokenC.balanceOf(other.address)).to.equal(parseEther('2000'));

      expectReserves(pool, tokenA, tokenB, tokenC, '1001005', '1001005', '998000');
    });

    it('Should swap two for one, different ratio', async function () {
      const { owner, pool, tokenA, tokenB, tokenC } = await loadFixture(deployPoolFixture);
      await mint(owner, pool, tokenA, tokenB, tokenC, '1000000', '2000000', '3000000');

      const [, other] = await ethers.getSigners();

      await swap(
        other,
        pool,
        tokenA,
        tokenB,
        tokenC,
        /*amountAIn=*/ '1005',
        /*amountBIn=*/ '2010',
        0,
        0,
        0,
        /*amountCOut=*/ '6000'
      );
      expect(await tokenC.balanceOf(other.address)).to.equal(parseEther('6000'));

      expectReserves(pool, tokenA, tokenB, tokenC, '1001005', '2002010', '2994000');
    });
  });
});
