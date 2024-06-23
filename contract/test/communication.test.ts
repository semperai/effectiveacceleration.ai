import { expect } from "chai";
import { ethers, config, upgrades } from "hardhat";
import { HardhatNetworkHDAccountsConfig } from "hardhat/types";
import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { utf8ToBytes } from '@noble/ciphers/utils';
import { randomBytes } from '@noble/ciphers/webcrypto';
import { MarketplaceDataV1, MarketplaceV1 } from "../typechain-types";

let marketplace: MarketplaceV1;
let marketplaceData: MarketplaceDataV1;

describe("EOA, private key available", () => {
describe("Encrypted communication tests", async () => {
  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory(
      "MarketplaceV1"
    );
    marketplace = (await upgrades.deployProxy(Marketplace, [
      await deployer.getAddress(),
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      0,
    ])) as unknown as MarketplaceV1;
    await marketplace.waitForDeployment();

    const MarketplaceData = await ethers.getContractFactory(
      "MarketplaceDataV1"
    );
    marketplaceData = (await upgrades.deployProxy(MarketplaceData, [
      ethers.ZeroAddress,
    ])) as unknown as MarketplaceDataV1;
    await marketplaceData.waitForDeployment();
  });

  it("Should be able to send an encrypted message, signature workflow", async () => {
    const accounts = config.networks.hardhat.accounts as HardhatNetworkHDAccountsConfig;
    const index = 1;
    const alice = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index}`);
    const bob = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 1}`);
    const arbitrator = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 2}`);

    // alice and bob agree on the common handshake phrase
    const handshakeMessage = "handshake";
    // alice and bob compute the message digest
    const handshakeDigest = ethers.hashMessage(handshakeMessage);

    // alice signs the handshake digest and shares it with bob
    const aliceSignature = await alice.signMessage(handshakeMessage);

    // bob verifies the signature and recovers alice's uncompressed public key
    const aliceAddress = ethers.verifyMessage(handshakeMessage, aliceSignature);
    expect(aliceAddress).to.equal(alice.address);
    const alicePublicKeyCompressed = ethers.SigningKey.computePublicKey(ethers.SigningKey.recoverPublicKey(handshakeDigest, aliceSignature), true);
    expect(alicePublicKeyCompressed).to.equal(alice.publicKey);

    // bob signs the handshake digest and shares it with alice
    const bobSignature = await bob.signMessage(handshakeMessage);

    // alice verifies the signature and recovers bob's compressed public key
    const bobAddress = ethers.verifyMessage(handshakeMessage, bobSignature);
    expect(bobAddress).to.equal(bob.address);
    const bobPublicKeyCompressed = ethers.SigningKey.computePublicKey(ethers.SigningKey.recoverPublicKey(handshakeDigest, bobSignature), true);
    expect(bobPublicKeyCompressed).to.equal(bob.publicKey);


    // bob and alice compute the ECDH shared secret
    const sharedAB = alice.signingKey.computeSharedSecret(bobPublicKeyCompressed);
    const sharedBA = bob.signingKey.computeSharedSecret(alicePublicKeyCompressed);
    expect(sharedAB).to.equal(sharedBA);

    const hashedSharedSecret = ethers.keccak256(sharedAB);
    const threadId = ethers.randomBytes(32);
    const sessionKey = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes32"], [hashedSharedSecret, threadId]));


    // start encrypted message exchange
    const key = ethers.getBytes(sessionKey);

    // get random nonce for every message
    const nonce = randomBytes(24);
    // instantiate the cipher engine
    const chacha = xchacha20poly1305(key, nonce);
    const data = utf8ToBytes('hello, noble');

    // prepend the nonce to the ciphertext for counterparty to use it
    const ciphertext = Uint8Array.from([...nonce, ...chacha.encrypt(data)]);
    let decryptedData;
    {
      // bob reuses the agreed session key to decrypt messages
      const key = ethers.getBytes(sessionKey);
      // nonce is obtained from the ciphertext
      const nonce = ciphertext.slice(0, 24);
      // instantiate the cipher engine
      const chacha = xchacha20poly1305(key, nonce);
      // decrypt the message
      decryptedData = chacha.decrypt(ciphertext.slice(24));
    }
    expect(decryptedData).to.deep.equal(data);


    // alice starts the escrow dispute and leaks the session key to the arbitrator

    // arbitrator signs a message to leak his public key
    const arbitratorMessage = "arbitrator";
    const arbitratorDigest = ethers.hashMessage(arbitratorMessage);

    // arbitrator signs the message
    const arbitratorSignature = await arbitrator.signMessage(arbitratorMessage);

    // alice verifies the arbitrator's signature and recovers his public key
    const arbitratorAddress = ethers.verifyMessage(arbitratorMessage, arbitratorSignature);
    expect(arbitratorAddress).to.equal(arbitrator.address);
    const arbitratorPublicKeyCompressed = ethers.SigningKey.computePublicKey(ethers.SigningKey.recoverPublicKey(arbitratorDigest, arbitratorSignature), true);
    expect(arbitratorPublicKeyCompressed).to.equal(arbitrator.publicKey);

    // alice computes the shared key with arbitrator
    const sharedAA = alice.signingKey.computeSharedSecret(arbitratorPublicKeyCompressed);
    const hashedArbtiratorSharedSecret = ethers.keccak256(sharedAA);
    const arbitrationSessionKey = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes32"], [hashedArbtiratorSharedSecret, threadId]));

    const key_ = ethers.getBytes(arbitrationSessionKey);
    const nonce_ = randomBytes(24);
    const chacha_ = xchacha20poly1305(key_, nonce_);
    const data_ = ethers.getBytes(sessionKey);
    const ciphertext_ = Uint8Array.from([...nonce_, ...chacha_.encrypt(data_)]);
    let decryptedSessionKey;
    {
      // arbitrator uses the leaked session key to decrypt alice and bob's session key
      const key_ = ethers.getBytes(arbitrationSessionKey);
      const nonce_ = ciphertext_.slice(0, 24);
      const chacha_ = xchacha20poly1305(key_, nonce_);
      decryptedSessionKey = chacha_.decrypt(ciphertext_.slice(24));
    }
    expect(decryptedSessionKey).to.deep.equal(data_);

    {
      // arbitrator is able to decrypt alice's and bob's messages
      const key_ = ethers.getBytes(decryptedSessionKey);
      const nonce_ = ciphertext.slice(0, 24);
      const chacha_ = xchacha20poly1305(key_, nonce_);
      decryptedData = chacha_.decrypt(ciphertext.slice(24));
      expect(decryptedData).to.deep.equal(data);
    }
  });

  it("Should be able to send an encrypted message, contract workflow", async () => {
    const [deployer] = await ethers.getSigners();

    const accounts = config.networks.hardhat.accounts as HardhatNetworkHDAccountsConfig;
    const index = 1;
    const alice = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index}`).connect(deployer.provider);
    const bob = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 1}`).connect(deployer.provider);
    const arbitrator = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(accounts.mnemonic), accounts.path + `/${index + 2}`).connect(deployer.provider);

    // everyone registers their public keys some time in the past
    await marketplaceData.connect(alice).registerPublicKey(alice.publicKey);
    await marketplaceData.connect(bob).registerPublicKey(bob.publicKey);
    await marketplaceData.connect(arbitrator).registerPublicKey(arbitrator.publicKey);

    // everyone retreives their public keys from blockchain
    const alicePublicKeyCompressed = await marketplaceData.publicKeys(alice.address);
    expect(alicePublicKeyCompressed).to.equal(alice.publicKey);

    const bobPublicKeyCompressed = await marketplaceData.publicKeys(bob.address);
    expect(bobPublicKeyCompressed).to.equal(bob.publicKey);

    // bob and alice compute the ECDH shared secret
    const sharedAB = alice.signingKey.computeSharedSecret(bobPublicKeyCompressed);
    const sharedBA = bob.signingKey.computeSharedSecret(alicePublicKeyCompressed);
    expect(sharedAB).to.equal(sharedBA);

    const hashedSharedSecret = ethers.keccak256(sharedAB);
    const threadId = ethers.randomBytes(32);
    const sessionKey = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes32"], [hashedSharedSecret, threadId]));


    // start encrypted message exchange
    const key = ethers.getBytes(sessionKey);

    // get random nonce for every message
    const nonce = randomBytes(24);
    // instantiate the cipher engine
    const chacha = xchacha20poly1305(key, nonce);
    const data = utf8ToBytes('hello, noble');

    // prepend the nonce to the ciphertext for counterparty to use it
    const ciphertext = Uint8Array.from([...nonce, ...chacha.encrypt(data)]);
    let decryptedData;
    {
      // bob reuses the agreed session key to decrypt messages
      const key = ethers.getBytes(sessionKey);
      // nonce is obtained from the ciphertext
      const nonce = ciphertext.slice(0, 24);
      // instantiate the cipher engine
      const chacha = xchacha20poly1305(key, nonce);
      // decrypt the message
      decryptedData = chacha.decrypt(ciphertext.slice(24));
    }
    expect(decryptedData).to.deep.equal(data);


    // alice starts the escrow dispute and leaks the session key to the arbitrator

    const arbitratorPublicKeyCompressed = await marketplaceData.publicKeys(arbitrator.address);
    expect(arbitratorPublicKeyCompressed).to.equal(arbitrator.publicKey);

    // alice computes the shared key with arbitrator
    const sharedAA = alice.signingKey.computeSharedSecret(arbitratorPublicKeyCompressed);
    const hashedArbtiratorSharedSecret = ethers.keccak256(sharedAA);
    const arbitrationSessionKey = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes32"], [hashedArbtiratorSharedSecret, threadId]));

    const key_ = ethers.getBytes(arbitrationSessionKey);
    const nonce_ = randomBytes(24);
    const chacha_ = xchacha20poly1305(key_, nonce_);
    const data_ = ethers.getBytes(sessionKey);
    const ciphertext_ = Uint8Array.from([...nonce_, ...chacha_.encrypt(data_)]);
    let decryptedSessionKey;
    {
      // arbitrator uses the leaked session key to decrypt alice and bob's session key
      const key_ = ethers.getBytes(arbitrationSessionKey);
      const nonce_ = ciphertext_.slice(0, 24);
      const chacha_ = xchacha20poly1305(key_, nonce_);
      decryptedSessionKey = chacha_.decrypt(ciphertext_.slice(24));
    }
    expect(decryptedSessionKey).to.deep.equal(data_);

    {
      // arbitrator is able to decrypt alice's and bob's messages
      const key_ = ethers.getBytes(decryptedSessionKey);
      const nonce_ = ciphertext.slice(0, 24);
      const chacha_ = xchacha20poly1305(key_, nonce_);
      decryptedData = chacha_.decrypt(ciphertext.slice(24));
      expect(decryptedData).to.deep.equal(data);
    }
  });
});
});

describe("Web3, private key not available", () => {
describe("Encrypted communication tests", async () => {
  beforeEach(async () => {
    const [deployer] = await ethers.getSigners();

    const Marketplace = await ethers.getContractFactory(
      "MarketplaceV1"
    );
    marketplace = (await upgrades.deployProxy(Marketplace, [
      await deployer.getAddress(),
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      0,
    ])) as unknown as MarketplaceV1;
    await marketplace.waitForDeployment();

    const MarketplaceData = await ethers.getContractFactory(
      "MarketplaceDataV1"
    );
    marketplaceData = (await upgrades.deployProxy(MarketplaceData, [
      ethers.ZeroAddress,
    ])) as unknown as MarketplaceDataV1;
    await marketplaceData.waitForDeployment();
  });

  it("Should be able to send an encrypted message, contract workflow", async () => {
    const [deployer, alice, bob, arbitrator] = await ethers.getSigners();

    const accounts = config.networks.hardhat.accounts as HardhatNetworkHDAccountsConfig;
    const index = 1;

    // alice and bob generate their deterministic encryption keys based on signatures
    const aliceSignature = await alice.signMessage("Arbius Marketplace: Please sign this message to allow for encrypted message exchange.");
    const aliceEncryptionSigningKey = new ethers.SigningKey(ethers.keccak256(ethers.keccak256(aliceSignature)));

    const bobSignature = await bob.signMessage("Arbius Marketplace: Please sign this message to allow for encrypted message exchange.");
    const bobEncryptionSigningKey = new ethers.SigningKey(ethers.keccak256(ethers.keccak256(bobSignature)));

    const arbitratorSignature = await arbitrator.signMessage("Arbius Marketplace: Please sign this message to allow for encrypted message exchange.");
    const arbitratorEncryptionSigningKey = new ethers.SigningKey(ethers.keccak256(ethers.keccak256(arbitratorSignature)));

    // everyone registers their public keys some time in the past
    await marketplaceData.connect(alice).registerPublicKey(aliceEncryptionSigningKey.compressedPublicKey);
    await marketplaceData.connect(bob).registerPublicKey(bobEncryptionSigningKey.compressedPublicKey);
    await marketplaceData.connect(arbitrator).registerPublicKey(arbitratorEncryptionSigningKey.compressedPublicKey);

    // everyone retreives their public keys from blockchain
    const alicePublicKeyCompressed = await marketplaceData.publicKeys(alice.address);
    expect(alicePublicKeyCompressed).to.equal(aliceEncryptionSigningKey.compressedPublicKey);

    const bobPublicKeyCompressed = await marketplaceData.publicKeys(bob.address);
    expect(bobPublicKeyCompressed).to.equal(bobEncryptionSigningKey.compressedPublicKey);

    // bob and alice compute the ECDH shared secret
    const sharedAB = aliceEncryptionSigningKey.computeSharedSecret(bobPublicKeyCompressed);
    const sharedBA = bobEncryptionSigningKey.computeSharedSecret(alicePublicKeyCompressed);
    expect(sharedAB).to.equal(sharedBA);

    const hashedSharedSecret = ethers.keccak256(sharedAB);
    const threadId = ethers.randomBytes(32);
    const sessionKey = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes32"], [hashedSharedSecret, threadId]));

    // start encrypted message exchange
    const key = ethers.getBytes(sessionKey);

    // get random nonce for every message
    const nonce = randomBytes(24);
    // instantiate the cipher engine
    const chacha = xchacha20poly1305(key, nonce);
    const data = utf8ToBytes('hello, noble');

    // prepend the nonce to the ciphertext for counterparty to use it
    const ciphertext = Uint8Array.from([...nonce, ...chacha.encrypt(data)]);
    let decryptedData;
    {
      // bob reuses the agreed session key to decrypt messages
      const key = ethers.getBytes(sessionKey);
      // nonce is obtained from the ciphertext
      const nonce = ciphertext.slice(0, 24);
      // instantiate the cipher engine
      const chacha = xchacha20poly1305(key, nonce);
      // decrypt the message
      decryptedData = chacha.decrypt(ciphertext.slice(24));
    }
    expect(decryptedData).to.deep.equal(data);


    // alice starts the escrow dispute and leaks the session key to the arbitrator

    const arbitratorPublicKeyCompressed = await marketplaceData.publicKeys(arbitrator.address);
    expect(arbitratorPublicKeyCompressed).to.equal(arbitratorEncryptionSigningKey.compressedPublicKey);

    // alice computes the shared key with arbitrator
    const sharedAA = aliceEncryptionSigningKey.computeSharedSecret(arbitratorPublicKeyCompressed);
    const hashedArbtiratorSharedSecret = ethers.keccak256(sharedAA);
    const arbitrationSessionKey = ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["bytes32", "bytes32"], [hashedArbtiratorSharedSecret, threadId]));

    const key_ = ethers.getBytes(arbitrationSessionKey);
    const nonce_ = randomBytes(24);
    const chacha_ = xchacha20poly1305(key_, nonce_);
    const data_ = ethers.getBytes(sessionKey);
    const ciphertext_ = Uint8Array.from([...nonce_, ...chacha_.encrypt(data_)]);
    let decryptedSessionKey;
    {
      // arbitrator uses the leaked session key to decrypt alice and bob's session key
      const key_ = ethers.getBytes(arbitrationSessionKey);
      const nonce_ = ciphertext_.slice(0, 24);
      const chacha_ = xchacha20poly1305(key_, nonce_);
      decryptedSessionKey = chacha_.decrypt(ciphertext_.slice(24));
    }
    expect(decryptedSessionKey).to.deep.equal(data_);

    {
      // arbitrator is able to decrypt alice's and bob's messages
      const key_ = ethers.getBytes(decryptedSessionKey);
      const nonce_ = ciphertext.slice(0, 24);
      const chacha_ = xchacha20poly1305(key_, nonce_);
      decryptedData = chacha_.decrypt(ciphertext.slice(24));
      expect(decryptedData).to.deep.equal(data);
    }
  });
});
});
