// SPDX-License-Identifier: MIT

pragma solidity >=0.5.17;
pragma experimental ABIEncoderV2;

/// @title A contract that logs calls made by addresses to another contract
/// @author BlockVigil team
/// @notice "calling address" refers to the address making a state changing call to myDemoContract

contract myAuditLog {
    ///@notice this is an event that is emitted whenever an address causes state-change of another contract
    event AuditLogAdded(address changedBy, uint256 timestamp);

    ///@notice struct of an AuditLog containing a note, value by which increment was made and a timestamp of when the increment was made
    struct AuditLog {
        string note;
        uint256 incrementedValue;
        uint256 timestamp;
        address changedBy;
    }

    ///@notice a mapping of address to array of AuditLog objects
    mapping(uint256 => AuditLog[]) public storedAuditLogs;

    constructor() public {}

    ///@notice add an auditlog to the AuditLog array of an address
    ///@param _newNote A message by the caller,
    ///@param _changedBy address of the caller,
    ///@param _incrementValue value by which increment was made
    ///@param _timestamp when the call was made
    function addAuditLog(
        string memory _newNote,
        address _changedBy,
        uint256 _incrementValue,
        uint256 _timestamp,
        //id of a log array
        uint _logId
    ) public {
        //a memory variable i.e. created only in memory lasting only until the scope of this func
        AuditLog memory _a = AuditLog(_newNote, _incrementValue, _timestamp, _changedBy);
        //storing the newly created AuditLog to this mapping as value of the log id
        storedAuditLogs[_logId].push(_a);
        //event emitted; this is being picked up by EV and sent to us by websocket (if we want)
        emit AuditLogAdded(_changedBy, block.timestamp);
    }

    ///@notice returns the AuditLog array of a logId
    ///@param _logId the calling address
    ///@return auditLogs array of all the audit logs of an address
    ///@dev returning an array of objects is an experimental feature
    function getLogsByLogId(uint256 _logId)
        public
        view
        returns (AuditLog[] memory auditLogs)
    {
        AuditLog[] memory audit_logs = new AuditLog[](
            storedAuditLogs[_logId].length
        );
        for (uint256 i = 0; i < storedAuditLogs[_logId].length; i++) {
            audit_logs[i] = storedAuditLogs[_logId][i];
        }
        return audit_logs;
    }
}
