export const PATCH_FACTORY_ABI = [
  "function getAccountAddress(uint256 index) view returns (address)",
];

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

export const FACTORY_ADDRESS = "0xa7ac5B9d40D67e6cac7A975Bbf9b513Fb5EA8A60";

export const KERNEL_ACCOUNT_SUFFIX = "kernel-account";

export const KERNEL_ABI = [
  "function upgradeTo(address _newImplementation) external",
];

export const SEAPORT_ABI = [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "considerationToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "considerationIdentifier",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "considerationAmount",
            type: "uint256",
          },
          { internalType: "address payable", name: "offerer", type: "address" },
          { internalType: "address", name: "zone", type: "address" },
          { internalType: "address", name: "offerToken", type: "address" },
          { internalType: "uint256", name: "offerIdentifier", type: "uint256" },
          { internalType: "uint256", name: "offerAmount", type: "uint256" },
          {
            internalType: "enum BasicOrderType",
            name: "basicOrderType",
            type: "uint8",
          },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
          { internalType: "uint256", name: "salt", type: "uint256" },
          {
            internalType: "bytes32",
            name: "offererConduitKey",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "fulfillerConduitKey",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "totalOriginalAdditionalRecipients",
            type: "uint256",
          },
          {
            components: [
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct AdditionalRecipient[]",
            name: "additionalRecipients",
            type: "tuple[]",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct BasicOrderParameters",
        name: "parameters",
        type: "tuple",
      },
    ],
    name: "fulfillBasicOrder",
    outputs: [{ internalType: "bool", name: "fulfilled", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "considerationToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "considerationIdentifier",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "considerationAmount",
            type: "uint256",
          },
          { internalType: "address payable", name: "offerer", type: "address" },
          { internalType: "address", name: "zone", type: "address" },
          { internalType: "address", name: "offerToken", type: "address" },
          { internalType: "uint256", name: "offerIdentifier", type: "uint256" },
          { internalType: "uint256", name: "offerAmount", type: "uint256" },
          {
            internalType: "enum BasicOrderType",
            name: "basicOrderType",
            type: "uint8",
          },
          { internalType: "uint256", name: "startTime", type: "uint256" },
          { internalType: "uint256", name: "endTime", type: "uint256" },
          { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
          { internalType: "uint256", name: "salt", type: "uint256" },
          {
            internalType: "bytes32",
            name: "offererConduitKey",
            type: "bytes32",
          },
          {
            internalType: "bytes32",
            name: "fulfillerConduitKey",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "totalOriginalAdditionalRecipients",
            type: "uint256",
          },
          {
            components: [
              { internalType: "uint256", name: "amount", type: "uint256" },
              {
                internalType: "address payable",
                name: "recipient",
                type: "address",
              },
            ],
            internalType: "struct AdditionalRecipient[]",
            name: "additionalRecipients",
            type: "tuple[]",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct BasicOrderParameters",
        name: "parameters",
        type: "tuple",
      },
    ],
    name: "fulfillBasicOrder_efficient_6GL6yc",
    outputs: [{ internalType: "bool", name: "fulfilled", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              { internalType: "address", name: "offerer", type: "address" },
              { internalType: "address", name: "zone", type: "address" },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                ],
                internalType: "struct OfferItem[]",
                name: "offer",
                type: "tuple[]",
              },
              {
                components: [
                  {
                    internalType: "enum ItemType",
                    name: "itemType",
                    type: "uint8",
                  },
                  { internalType: "address", name: "token", type: "address" },
                  {
                    internalType: "uint256",
                    name: "identifierOrCriteria",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "startAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "uint256",
                    name: "endAmount",
                    type: "uint256",
                  },
                  {
                    internalType: "address payable",
                    name: "recipient",
                    type: "address",
                  },
                ],
                internalType: "struct ConsiderationItem[]",
                name: "consideration",
                type: "tuple[]",
              },
              {
                internalType: "enum OrderType",
                name: "orderType",
                type: "uint8",
              },
              { internalType: "uint256", name: "startTime", type: "uint256" },
              { internalType: "uint256", name: "endTime", type: "uint256" },
              { internalType: "bytes32", name: "zoneHash", type: "bytes32" },
              { internalType: "uint256", name: "salt", type: "uint256" },
              { internalType: "bytes32", name: "conduitKey", type: "bytes32" },
              {
                internalType: "uint256",
                name: "totalOriginalConsiderationItems",
                type: "uint256",
              },
            ],
            internalType: "struct OrderParameters",
            name: "parameters",
            type: "tuple",
          },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct Order",
        name: "",
        type: "tuple",
      },
      { internalType: "bytes32", name: "fulfillerConduitKey", type: "bytes32" },
    ],
    name: "fulfillOrder",
    outputs: [{ internalType: "bool", name: "fulfilled", type: "bool" }],
    stateMutability: "payable",
    type: "function",
  },
];
