"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeCustomJobEvent = exports.decodeJobMessageEvent = exports.decodeJobArbitratedEvent = exports.decryptJobDisputedEvent = exports.decodeJobDisputedEvent = exports.decodeJobRatedEvent = exports.decodeJobSignedEvent = exports.decodeJobUpdatedEvent = exports.decodeJobCreatedEvent = void 0;
const ethers_1 = require("ethers");
const decodeData_1 = require("./decodeData");
const encryption_1 = require("./encryption");
const interfaces_1 = require("../interfaces");
const decodeJobCreatedEvent = (rawData) => {
    const bytes = (0, ethers_1.getBytes)(rawData);
    let ptr = { bytes, index: 0 };
    const result = {};
    result.title = (0, decodeData_1.decodeString)(ptr);
    result.contentHash = (0, decodeData_1.decodeBytes32)(ptr);
    result.multipleApplicants = (0, decodeData_1.decodeBool)(ptr);
    result.tags = (0, decodeData_1.decodeStringArray)(ptr);
    result.token = (0, decodeData_1.decodeAddress)(ptr);
    result.amount = (0, decodeData_1.decodeUint256)(ptr);
    result.maxTime = (0, decodeData_1.decodeUint32)(ptr);
    result.deliveryMethod = (0, decodeData_1.decodeString)(ptr);
    result.arbitrator = (0, decodeData_1.decodeAddress)(ptr);
    result.whitelistWorkers = (0, decodeData_1.decodeBool)(ptr);
    return result;
};
exports.decodeJobCreatedEvent = decodeJobCreatedEvent;
const decodeJobUpdatedEvent = (rawData) => {
    const bytes = (0, ethers_1.getBytes)(rawData);
    let ptr = { bytes, index: 0 };
    const result = {};
    result.title = (0, decodeData_1.decodeString)(ptr);
    result.contentHash = (0, decodeData_1.decodeBytes32)(ptr);
    result.tags = (0, decodeData_1.decodeStringArray)(ptr);
    result.amount = (0, decodeData_1.decodeUint256)(ptr);
    result.maxTime = (0, decodeData_1.decodeUint32)(ptr);
    result.arbitrator = (0, decodeData_1.decodeAddress)(ptr);
    result.whitelistWorkers = (0, decodeData_1.decodeBool)(ptr);
    return result;
};
exports.decodeJobUpdatedEvent = decodeJobUpdatedEvent;
const decodeJobSignedEvent = (rawData) => {
    const bytes = (0, ethers_1.getBytes)(rawData);
    return {
        revision: new DataView(bytes.buffer, 0).getUint16(0),
        signatire: (0, ethers_1.hexlify)(bytes.slice(2)),
    };
};
exports.decodeJobSignedEvent = decodeJobSignedEvent;
const decodeJobRatedEvent = (rawData) => {
    const bytes = (0, ethers_1.getBytes)(rawData);
    return {
        rating: new DataView(bytes.buffer, 0).getUint8(0),
        review: (0, ethers_1.toUtf8String)(bytes.slice(1)),
    };
};
exports.decodeJobRatedEvent = decodeJobRatedEvent;
const decodeJobDisputedEvent = (rawData) => {
    const bytes = (0, ethers_1.getBytes)(rawData);
    let ptr = { bytes, index: 0 };
    const result = {};
    result.encryptedSessionKey = (0, decodeData_1.decodeBytes)(ptr);
    result.encryptedContent = (0, decodeData_1.decodeBytes)(ptr);
    return result;
};
exports.decodeJobDisputedEvent = decodeJobDisputedEvent;
const decryptJobDisputedEvent = (event, sessionKey) => {
    try {
        event.content = (0, encryption_1.decryptUtf8Data)((0, ethers_1.getBytes)(event.encryptedContent), sessionKey);
        event.sessionKey = (0, ethers_1.hexlify)((0, encryption_1.decryptBinaryData)((0, ethers_1.getBytes)(event.encryptedSessionKey), sessionKey));
    }
    catch {
        event.content = "<encrypted message>";
    }
};
exports.decryptJobDisputedEvent = decryptJobDisputedEvent;
const decodeJobArbitratedEvent = (rawData) => {
    const bytes = (0, ethers_1.getBytes)(rawData);
    const marketplaceData = new DataView(bytes.buffer, 0);
    return {
        creatorShare: marketplaceData.getUint16(0),
        creatorAmount: (0, ethers_1.toBigInt)(bytes.slice(2, 34)),
        workerShare: marketplaceData.getUint16(34),
        workerAmount: (0, ethers_1.toBigInt)(bytes.slice(36, 68)),
        reasonHash: (0, ethers_1.hexlify)(bytes.slice(68, 100)),
        workerAddress: (0, ethers_1.getAddress)((0, ethers_1.hexlify)(bytes.slice(100))),
    };
};
exports.decodeJobArbitratedEvent = decodeJobArbitratedEvent;
const decodeJobMessageEvent = (rawData) => {
    return {
        contentHash: (0, ethers_1.hexlify)(rawData),
    };
};
exports.decodeJobMessageEvent = decodeJobMessageEvent;
const decodeCustomJobEvent = (eventType, rawData) => {
    switch (eventType) {
        case interfaces_1.JobEventType.Created:
            return (0, exports.decodeJobCreatedEvent)(rawData);
        case interfaces_1.JobEventType.Updated:
            return (0, exports.decodeJobUpdatedEvent)(rawData);
        case interfaces_1.JobEventType.Signed:
            return (0, exports.decodeJobSignedEvent)(rawData);
        case interfaces_1.JobEventType.Rated:
            return (0, exports.decodeJobRatedEvent)(rawData);
        case interfaces_1.JobEventType.Disputed:
            return (0, exports.decodeJobDisputedEvent)(rawData);
        case interfaces_1.JobEventType.Arbitrated:
            return (0, exports.decodeJobArbitratedEvent)(rawData);
        case interfaces_1.JobEventType.WorkerMessage:
        case interfaces_1.JobEventType.OwnerMessage:
            return (0, exports.decodeJobMessageEvent)(rawData);
        default:
            return undefined;
    }
};
exports.decodeCustomJobEvent = decodeCustomJobEvent;
