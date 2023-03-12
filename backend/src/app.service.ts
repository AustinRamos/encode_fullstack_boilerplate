import { Injectable } from '@nestjs/common';
import {ethers} from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import * as ballotJson from './assets/Ballot.json';
import * as dotenv from "dotenv";
dotenv.config();

const TOKEN_ADDRESS = '0x83F67FB14B31D957F9A8E65D71BEA88B64306b9C';
const BALLOT_ADDRESS = '0xa2b417B40D10b16A496505Adf9Af4B707C901b01';

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey || privateKey.length <= 0) throw new Error("Missing private key, check .env file");

@Injectable()
export class AppService {
  provider: ethers.providers.Provider;
  contract: ethers.Contract;
  wallet: ethers.Wallet;

  constructor(){
    this.provider = ethers.getDefaultProvider('goerli');
    this.contract = new ethers.Contract(TOKEN_ADDRESS,tokenJson.abi,this.provider)
  }

  async requestTokens(address: string, amount: number) {
    console.log(`Request tokens: ${amount}`);
    const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_API_KEY);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(BALLOT_ADDRESS, ballotJson.abi, wallet);
    
    const parsedAmount = ethers.utils.parseEther(amount.toString());
    const mintTx = await contract.giveVotes(address,parsedAmount);
    const receipt = await mintTx.wait();
    console.log("Receipt: " , receipt);
    console.log("Tx hash:", receipt.transactionHash);
    return receipt.transactionHash;
  }
  
  async getTransactionStatus(hash: string):Promise<string> {
    const tx= await this.provider.getTransaction(hash);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1? "completed" : "reverted";
  }

  async getAllowance(from: string, to: string): Promise<number> {
    return await this.contract.allowance(from,to)
  }
  async getTotalSupply(): Promise<number> {
    const totalSupplyBN = await this.contract.totalSupply()
    const totalSupplyString = ethers.utils.formatEther(totalSupplyBN)
    return parseFloat(totalSupplyString);
  }
 
  getHello(): string {
    return 'Hello World!';
  }

  getTokenAddress(): string{
    return this.contract.address;
  }

  getBallotAddress(): string {
    return BALLOT_ADDRESS;
  }
}