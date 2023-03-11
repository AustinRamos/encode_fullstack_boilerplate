import { Controller, Get, Param,Query,Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestTokensDTO } from './dtos/createPaymentOrder.dto.ts';


const TOKEN_ADDRESS = "0x12D0122946B86dD1c71DA5eB637f3c056c143c89";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/contract-address")
  getContractAddress(): {address: string} {
    return {address: this.appService.getContractAddress()};
  }

  @Get("/total-supply")
    getTotalSupply(): Promise<number> {
    return this.appService.getTotalSupply();
  }


  @Get("/allowance/")
   async getAllowance(
     @Query('from') from: string,
     @Query('to') to: string,
   ): Promise<number> {
    return await this.appService.getAllowance(from,to);
  }


  @Get("/transaction-status")
  async getTransactionStatus(
    @Query('hash') hash: string,
  ): Promise<string> {
   return await this.appService.getTransactionStatus(hash);
 }

 
  
 @Post("request-tokens")
 requestTokens(@Body() body: RequestTokensDTO){
      console.log({body})
  return {result: this.appService.requestTokens(body.address,body.amount)};
 }

}
