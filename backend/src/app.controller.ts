import { Controller, Get, Param,Query,Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestTokensDTO } from './dtos/requestTokens.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/token-address")
  getTokenAddress(): {address: string} {
    return {address: this.appService.getTokenAddress()};
  }

  @Get("/ballot-address")
  getBallotAddress(): {address: string} {
    return {address: this.appService.getBallotAddress()};
  }

  @Get("/total-supply")
    getTotalSupply(): Promise<number> {
    return this.appService.getTotalSupply();
  }

  @Get("/allowance")
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
      console.log("app controller body: ", body)
  return {result: this.appService.requestTokens(body.address,body.amount)};
 }
}
