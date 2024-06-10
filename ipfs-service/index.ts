import express from "express";
import cors from "cors";
import axios from "axios";
import { decodeBase58, hexlify, toBeArray } from "ethers";

const IPFS_API_URL = process.env.IPFS_API_URL || "http://127.0.0.1:5001";

const cidToHash = (cid: string): string => {
  return hexlify(toBeArray(decodeBase58(cid)).slice(2));
}

const app = express();
app.use(express.json());
app.use(cors());

app.post('/', async function(req, res) {
  const b64: string | undefined = req.body.dataB64;
  if (b64?.length === 0) {
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
