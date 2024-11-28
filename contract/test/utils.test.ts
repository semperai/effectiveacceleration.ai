import "@nomicfoundation/hardhat-ethers";
import { ethers } from "hardhat";
import { expect } from "chai";
import chai from "chai";
import chaiAsPromised from 'chai-as-promised';
import { ZeroHash } from "ethers";
import { hashToCid, cidToHash, publishToIpfs, getFromIpfs, getEncryptionSigningKey, getSessionKey, publishMediaToIpfs, getMediaFromIpfs } from "../src/utils/encryption";
import { utf8ToBytes } from "@noble/ciphers/utils";

chai.use(chaiAsPromised);

describe("utils", () => {
  describe("hashToCid", () => {
    it("should convert a hash to a cid", () => {
      const hash = "0x31479ede5414b18e9205f0ab03b8cfac02f4c449ae9a993fc91c9b88c84efbcc";
      const cid = hashToCid(hash);
      expect(cid).equal("QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm");
    });

    it("should throw an error if hash is not a valid hex", () => {
      expect(() => hashToCid("0x1234")).to.throw("invalid hash");
    });
  });

  describe("cidToHash", () => {
    it("should convert a cid to a hash", () => {
      const cid = "QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm";
      const hash = cidToHash(cid);
      expect(hash).equal("0x31479ede5414b18e9205f0ab03b8cfac02f4c449ae9a993fc91c9b88c84efbcc");
    });

    it("should throw an error if cid is empty", () => {
      expect(() => cidToHash("")).to.throw("invalid cid");
    });

    it("should throw an error if cid is not a string", () => {
      expect(() => cidToHash(123 as any)).to.throw("invalid cid");
    });

    it("should throw an error if cid is not a valid base58", () => {
      expect(() => cidToHash("QmRf22bZar3WKmojipms22PkXH1MZGmvsqzQtuSvQE3uhm=")).to.throw("invalid cid");
    });
  });

  let encryptedCid = "";
  describe("publishToIpfs", () => {
    it("should publish an unencrypted message to ipfs", async () => {
      const { hash, cid } = await publishToIpfs("unencrypted", undefined);
      expect(hash).to.equal("0x1a8fd29da207cbd2438153d9871fd3a8dd2e6345d385f519ad149867fdbdb61d");
      expect(cid).to.equal("QmQ8LWNYRHdz3JEnA12A2KkpKBwEbcpmzWfGDWj3KMapwW");
    });

    it("should publish an encrypted message to ipfs", async () => {
      const { hash, cid } = await publishToIpfs("encrypted", ZeroHash);
      expect(hash.length).to.equal(66);
      expect(cid).to.match(/^Qm/);
      encryptedCid = cid;
    });

    it("should throw an error if message is empty", async () => {
      await expect(publishToIpfs("", undefined)).to.be.rejectedWith("empty data");
    });

    it("should throw an error if upload secret is not set", async () => {
      const oldSecret = process.env.IPFS_UPLOAD_SERVICE_SECRET;
      delete process.env.IPFS_UPLOAD_SERVICE_SECRET;
      await expect(publishToIpfs("unencrypted", undefined)).to.be.rejectedWith(/Invalid upload secret/);
      process.env.IPFS_UPLOAD_SERVICE_SECRET = oldSecret;
    });
  });

  describe("getFromIpfs", () => {
    it("should get an unencrypted message from ipfs", async () => {
      const hash = "QmQ8LWNYRHdz3JEnA12A2KkpKBwEbcpmzWfGDWj3KMapwW";
      const message = await getFromIpfs(hash, undefined);
      expect(message).to.equal("unencrypted");
    });

    it("should get an encrypted message from ipfs", async () => {
      const message = await getFromIpfs(encryptedCid, ZeroHash);
      expect(message).to.equal("encrypted");
    });
  });

  const testFileContents = "src/index.ts";
  describe("publishMediaToIpfs", () => {
    it("should publish a media file to ipfs", async () => {
      const { hash, cid } = await publishMediaToIpfs("text/plain", utf8ToBytes(testFileContents));
      expect(hash).to.equal("0xc4d5fbc909dee24b0fd432cc9e3c04c84dfbf317cd2b24119ea2b536791b8c39");
      expect(cid).to.equal("Qmbb1sCuEt9gnsGjXVU3axYJ3mew2NSEUdFPc1ckCD8aWC");
    });

    it("should publish an encrypted media file to ipfs", async () => {
      const { hash, cid } = await publishMediaToIpfs("text/plain", utf8ToBytes(testFileContents), ZeroHash);
      expect(hash.length).to.equal(66);
      expect(cid).to.match(/^Qm/);
      encryptedCid = cid;
    });

    it("should throw an error if media data is empty", async () => {
      await expect(publishMediaToIpfs("text/plain", new Uint8Array())).to.be.rejectedWith("empty data");
    });

    it("should throw an error if media mime type is wrong is empty", async () => {
      await expect(publishMediaToIpfs("", Uint8Array.from([1]))).to.be.rejectedWith("wrong mime type");
      await expect(publishMediaToIpfs("text", Uint8Array.from([1]))).to.be.rejectedWith("wrong mime type");
    });
  });

  describe("getFromIpfs", () => {
    it("should get an unencrypted message from ipfs", async () => {
      const hash = "QmQ8LWNYRHdz3JEnA12A2KkpKBwEbcpmzWfGDWj3KMapwW";
      const message = await getFromIpfs(hash, undefined);
      expect(message).to.equal("unencrypted");
    });

    it("should get an encrypted message from ipfs", async () => {
      const { mimeType, mediaBytes } = await getMediaFromIpfs(encryptedCid, ZeroHash);
      expect(mimeType).to.equal("text/plain");
      expect(mediaBytes).to.deep.equal(utf8ToBytes(testFileContents));
    });
  });

  describe("getEncryptionSigningKey", () => {
    it("should get an encryption signing key", async () => {
      const [signer] = await ethers.getSigners();
      const key = await getEncryptionSigningKey(signer);
      expect(key).to.be.an("object");
    });
  });

  describe("getSessionKey", () => {
    it("should get a session key", async () => {
      const [signer, other] = await ethers.getSigners();

      const signerSigningKey = await getEncryptionSigningKey(signer);
      const otherSigningKey = await getEncryptionSigningKey(other);

      const sessionKey = await getSessionKey(signer, otherSigningKey.compressedPublicKey, 0n);
      const otherSessionKey = await getSessionKey(other, signerSigningKey.compressedPublicKey, 0n);
      expect(sessionKey).equal(otherSessionKey);
    });
  });
});