import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {BigNumber, Contract, ethers, Wallet} from 'ethers';
import tokenJson from '../assets/MyToken.json';
import ballotTokenJson from '../assets/Ballot.json';

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
  userVotingPower: number | undefined;
  tokenContractAddress: string | undefined;
  tokenSupply: number | undefined;
  tokenSymbol: string | undefined;
  tokenContract: Contract | undefined;
  ballotContract: Contract | undefined;
  ballotAddress: string | undefined;
  winner: string | undefined;

  constructor( private http: HttpClient ){
     this.provider = new ethers.providers.Web3Provider(window.ethereum);
    }

    getTokenAddress(){
      return this.http.get<{address: string}>(API_URL + "/token-address");
    }

    getTotalSupply(){
      return this.http.get<{supply: number}>(API_URL + "/total-supply");
    }

    getBallotAddress(){
      return this.http.get<{address: string}>(API_URL + "/ballot-address");
    }

    syncBlock(){
    this.provider.getBlock("latest").then(block=>{
      this.blockNumber = block.number;
      this.transactions = block.transactions;  
    });
    this.getTokenAddress().subscribe(resp=>{
      this.tokenContractAddress = resp.address;
      this.updateTokenInfo();
    })
    this.getBallotAddress().subscribe(response=>{
      this.ballotAddress = response.address;
      this.winnerAtTheMoment();
    })
    }

    winnerAtTheMoment() {
      //TODO ask backend for the ballot address
      this.ballotContract = new Contract(this.ballotAddress ?? "", ballotTokenJson.abi, this.provider);
      this.ballotContract['winnerName']().then((resp: string) =>{
        console.log('Winner name', resp);
        this.winner=ethers.utils.parseBytes32String(resp);
      });
    }

    updateTokenInfo(){
        this.tokenContract = new Contract(this.tokenContractAddress ?? "",tokenJson.abi,this.provider)
        this.tokenContract['totalSupply']().then((resp: ethers.BigNumber)=>{
          // const balanceStr = ethers.utils.formatEther(resp)
          this.tokenSupply=resp.toNumber()
        })
      }

      requestTokens(amount: string){
        console.log("component requestToken amount: " , amount)
        const url = API_URL + "/request-tokens";
        const body = {address:this.userAddress,amount: ethers.utils.parseEther(amount)};
        return this.http.post<{result: string}>(url, body).subscribe((res)=>{
          console.log("requested amount " , amount , " tokens for address " , this.userAddress)
            console.log("component Request Token: " , res)
          console.log("TX Hash: " ,  res.result)
        })
      }

      async delegate(address: string){
        const delegateTx = await this.tokenContract?.connect(this.userWallet!)['delegate'](address);
        await delegateTx.wait();
        alert('Votes delegated');
      }

      async vote(proposalNumber: string, votesAmount: string){
        //TODO: parse votes from string to correct type
        const voteTx = await this.ballotContract?.connect(this.userWallet!)['vote'](parseInt(proposalNumber), parseInt(votesAmount));
        await voteTx.wait();
      }

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
      this.tokenContract = new Contract(this.tokenContractAddress ?? "",tokenJson.abi,this.provider)
      
      this.tokenContract['balanceOf'](this.userAddress).then((resp: ethers.BigNumber)=>{
        // const balanceStr = ethers.utils.formatEther(resp)
        this.userTokenBalance=resp.toNumber();
      })

      this.ballotContract!['votingPower'](this.userAddress).then((resp: ethers.BigNumber) =>{
        console.log('Voting power', resp);
        this.userVotingPower=resp.toNumber();
      });
    }

    clearBlock(){
      this.blockNumber = 0;
      this.userWallet = undefined;
      this.tokenContractAddress = undefined;
    }
}