import { Injectable } from '@nestjs/common';
import {ethers} from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import {PaymentOrder} from './models/paymentOrder.model'
import * as dotenv from "dotenv";


const CONTRACT_ADDRESS = '0x12D0122946B86dD1c71DA5eB637f3c056c143c89';



@Injectable()
export class AppService {

 
provider: ethers.providers.Provider;
contract: ethers.Contract;
wallet: ethers.Wallet;

paymentOrders: PaymentOrder[];
  constructor(){

    this.provider = ethers.getDefaultProvider('goerli');
    this.contract = new ethers.Contract(CONTRACT_ADDRESS,tokenJson.abi,this.provider)
    this.paymentOrders=[];
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

  getPaymentOrders(){
    return this.paymentOrders;
  }

  createPaymentOrder(value: number, secret: string){
    const newPaymentOrder = new PaymentOrder;
    newPaymentOrder.value = value;
    newPaymentOrder.secret = secret
    newPaymentOrder.id = this.paymentOrders.length
    this.paymentOrders.push(newPaymentOrder)
    return newPaymentOrder.id;
  }

  //TODO 
  //FULLFILL PAYMENT ORDER
  async fullfillPaymentOrder(id: number, secret: string, address: string){
    //todo: check if secret is correct. if it is correct, 
    //pick priv key from env. build a signer, 
    //connect it to contract, 
    //call the mint function passning value to ming to address
   

    const paymentOrder = this.paymentOrders.find(p=>p.id==id);
    if (!paymentOrder){
      throw Error("No such order");

    }


    if(secret!=paymentOrder.secret){
      throw Error("Incorrect Secret.");
    }
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY,this.provider)

    const tx = await this.contract
    .connect(signer)
    .mint(address,ethers.utils.parseEther(paymentOrder.value.toString()))

    const txreceipt = await tx.wait();

    console.log(txreceipt)

  }
}
