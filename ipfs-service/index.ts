import express from "express";
import cors from "cors";
import axios from "axios";
import { decodeBase58, hexlify, toBeArray } from "ethers";

const IPFS_API_URL = process.env.IPFS_API_URL || "http://127.0.0.1:5001";
const IPFS_UPLOAD_SERVICE_SECRET = process.env.IPFS_UPLOAD_SERVICE_SECRET

if (!IPFS_UPLOAD_SERVICE_SECRET) {
  throw "Set IPFS_UPLOAD_SERVICE_SECRET environment variable";
}

const cidToHash = (cid: string): string => {
  return hexlify(toBeArray(decodeBase58(cid)).slice(2));
}

const app = express();
app.use(express.json());
app.use(cors());

app.post('/', async function(req, res) {
  if (req.header("IPFS_UPLOAD_SERVICE_SECRET") !== IPFS_UPLOAD_SERVICE_SECRET) {
    console.log("Invalid upload secret");
    return res.status(400).send({error: "Invalid upload secret"});
  }

  const b64: string | undefined = req.body.dataB64;
  if (b64?.length === 0) {
    console.log("empty data");
    return res.status(400).send({error: "empty data"});
  }

  const formData = new FormData();
  formData.append("file", b64!)
  const response = await axios.post(`${IPFS_API_URL}/api/v0/add?pin=true`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return res.status(200).send({cid: response.data.Hash, hash: cidToHash(response.data.Hash)});
});

console.log("Service started");
app.listen(8000);
