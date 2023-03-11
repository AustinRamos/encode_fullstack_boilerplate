import { Injectable } from '@nestjs/common';
import {ethers} from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import {RequestTokensDTO} from './models/paymentOrder.model'
import * as dotenv from "dotenv";


const CONTRACT_ADDRESS = '0x12D0122946B86dD1c71DA5eB637f3c056c143c89';



@Injectable()
export class AppService {
  requestTokens(address: string, amount: number) {
    //throw new Error('Method not implemented.');]
    console.log("todo!")
    //TODO 
    //load private key

    //create signer

    //connect signer to contract

    //call mint fucntion

    //return tx hash 

    return "txHash "
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
