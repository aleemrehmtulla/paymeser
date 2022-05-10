import WalletConnectProvider from "@walletconnect/ethereum-provider";
import Web3 from "web3";

const provider = new WalletConnectProvider({
  infuraId: "2d8110a2cee347a0b1056ce46d7387b1", // Required
});

export const web3 = new Web3(provider);
