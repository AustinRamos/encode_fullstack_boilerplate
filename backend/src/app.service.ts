import { Injectable } from '@nestjs/common';
import {ethers} from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import {RequestTokensDTO} from './models/paymentOrder.model'
import * as dotenv from "dotenv";
dotenv.config();

const CONTRACT_ADDRESS = '0x12D0122946B86dD1c71DA5eB637f3c056c143c89';

const privateKey = process.env.PRIVATE_KEY;
if (!privateKey || privateKey.length <= 0) throw new Error("Missing private key, check .env file");

@Injectable()
export class AppService {
  async requestTokens(address: string, amount: number) {

    console.log("REQUEST TOKENS AMOUNT: " , amount)
    const provider = new ethers.providers.InfuraProvider("goerli", process.env.INFURA_API_KEY);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, tokenJson.abi, wallet);
    
    const mintTx = await contract.mint(address,amount);
    const receipt = await mintTx.wait();
    console.log("receipt: " , receipt);
    console.log("Transaction Hash:", receipt.transactionHash);
    return receipt.transactionHash;
    //TODO 
    //pass in the ABI for the contract

  }


 
provider: ethers.providers.Provider;
contract: ethers.Contract;
wallet: ethers.Wallet;

//paymentOrders: PaymentOrder[];
  constructor(){

    this.provider = ethers.getDefaultProvider('goerli');
    this.contract = new ethers.Contract(CONTRACT_ADDRESS,tokenJson.abi,this.provider)
  }

 async getTransactionStatus(hash: string):Promise<string> {
    const tx= await this.provider.getTransaction(hash);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1? "completed" : "reverted";
  }

  async getAllowance(from,to): Promise<number> {

    const allowance = await this.contract.allowance(from,to)

    return allowance
   
  }
  async getTotalSupply(): Promise<number> {
    
const totalSupplyBN = await this.contract.totalSupply()
const totalSupplyString = ethers.utils.formatEther(totalSupplyBN)

    return parseFloat(totalSupplyString);
  }
  getHello(): string {
    return 'Hello World!';
  }

  getContractAddress(): string{
    return this.contract.address;
  }

  // getPaymentOrders(){
  //   return this.paymentOrders;
  // }

  // createPaymentOrder(value: number, secret: string){
  //   const newPaymentOrder = new PaymentOrder;
  //   newPaymentOrder.value = value;
  //   newPaymentOrder.secret = secret
  //   newPaymentOrder.id = this.paymentOrders.length
  //   this.paymentOrders.push(newPaymentOrder)
  //   return newPaymentOrder.id;
  // }

}
