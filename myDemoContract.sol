// SPDX-License-Identifier: MIT

pragma solidity >= 0.5.17;
pragma experimental ABIEncoderV2;

contract myDemoContract {
    struct ContractInfo {
        uint256 counter;
        string note;
        string contractLicenseId;
    }

    //instantiating ContractInfo
    ContractInfo private contractInformation;

    ///@notice event for when the counter is incremented by an adress
    event ContractIncremented(uint8 incrementedValue, address incrementedBy, string newNote);

    constructor(string memory initLicenseid, string memory initNote) public {
        contractInformation.counter = 0;
        contractInformation.note = initNote;
        contractInformation.contractLicenseId = initLicenseid;
    }

    function setContractInformation(uint8 incrValue, string memory _note) public {
        /*
        require(
            keccak256(abi.encodePacked(_note)) !=
            keccak256(abi.encodePacked(contractInformation.note))
        );
        */
        contractInformation.counter += incrValue;
        contractInformation.note = _note;
        emit ContractIncremented(incrValue, msg.sender, _note);
    }


    function getCounter() public view returns (uint256 counterValue){
        return contractInformation.counter;
    }

    function getContractInformation() public view returns
    (ContractInfo memory returnedContractInformation) {
        return contractInformation;
    }

//session 3 assignment
    function getContractNoteLicenseId() public view returns (string memory, string memory) {
        return (contractInformation.note, contractInformation.contractLicenseId);
    }
}