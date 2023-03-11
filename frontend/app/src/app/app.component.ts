import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {BigNumber, Contract, ethers, Wallet} from 'ethers';
//import * as tokenJson from './assets/MyToken.json';
import tokenJson from '../assets/MyToken.json';

declare let window: any

const API_URL = "http://localhost:3000";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  provider:  ethers.providers.Web3Provider;
  blockNumber: number = 0;
  transactions: string[] | undefined;
  userWallet: ethers.Signer | undefined ;
  userEthBalance: number | undefined;
  userAddress: string | undefined;
  userTokenBalance: number | undefined;
  tokenContractAddress: string | undefined;
  tokenSupply: number | undefined;
  tokenContract: Contract | undefined ;

  constructor( private http: HttpClient ){
     //this.provider = ethers.getDefaultProvider('goerli');
     this.provider = new ethers.providers.Web3Provider(window.ethereum);
     
     //setInterval(()=>{this.blockNumber +=1 })
    }

    getTokenAddress(){
      return this.http.get<{address: string}>(API_URL + "/contract-address");
    }

    getTotalSupply(){
      return this.http.get<{supply: number}>(API_URL + "/total-supply");
    }

    syncBlock(){
      //this.blockNumber = "loading...";
    this.provider.getBlock("latest").then(block=>{
      this.blockNumber = block.number;
      this.transactions = block.transactions;
      
    });
    this.getTokenAddress().subscribe(resp=>{
      this.tokenContractAddress = resp.address;
      this.updateTokenInfo()
    })
   
    }

    updateTokenInfo(){
        this.tokenContract = new Contract(this.tokenContractAddress ?? "",tokenJson.abi,this.provider)

        this.tokenContract['totalSupply']().then((resp: ethers.BigNumber)=>{
          const balanceStr = ethers.utils.formatEther(resp)
          this.tokenSupply=parseFloat(balanceStr)
        })
    
      }

      requestTokens(amount: string ){
        console.log("component requestToken amount: " , amount)
        const url = API_URL + "/request-tokens";
        const body = {address:this.userAddress,amount: amount};
        return this.http.post<{result: string}>(url, body).subscribe((res)=>{
          console.log("requested amount " , amount , " tokens for address " , this.userAddress)

          console.log("TX Hash: " ,  res.result)
        })
      }

    // createWallet(){
    //   this.userWallet = ethers.Wallet.createRandom().connect(this.provider);
    //   this.userWallet.getBalance().then(bal=>{
    //     this.userEthBalance = parseFloat(ethers.utils.formatEther(bal));
    //   })
    // }

    async handleAuth() {
      console.log("HANDLE AUTH***")
      window.ethereum.enable()
      this.provider.send("eth_requestAccounts", [])
      console.log("CONNECTED!")
      console.log("provider: " , this.provider);
      const signer = await this.provider.getSigner();
      this.userAddress = await signer.getAddress();
      this.userWallet=signer

        this.userWallet.getBalance().then(bal=>{
        this.userEthBalance = parseFloat(ethers.utils.formatEther(bal));
      })


     // this.userTokenBalance = await 
      
      
      
      //const test = signer.connect(this.provider)
      //console.log("Account:", await signer.getAddress());

    }

    clearBlock(){
      this.blockNumber = 1;
    
    }
}

