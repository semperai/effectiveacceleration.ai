// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

function encodeString(string memory str) pure returns (bytes memory) {
  return abi.encodePacked(uint8(bytes(str).length), str);
}

function encodeStringArray(string[] calldata arr) pure returns (bytes memory) {
  bytes memory result = abi.encodePacked(uint8(arr.length));
  for (uint i = 0; i < arr.length; i++) {
      result = bytes.concat(result, abi.encodePacked(uint8(bytes(arr[i]).length), arr[i]));
  }

  return result;
}

function encodeAddressArray(address[] calldata arr) pure returns (bytes memory) {
  bytes memory result = abi.encodePacked(uint8(arr.length));
  for (uint i = 0; i < arr.length; i++) {
      result = bytes.concat(result, abi.encodePacked(uint160(arr[i])));
  }

  return result;
}

