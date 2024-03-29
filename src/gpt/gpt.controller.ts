import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { GptService } from './gpt.service';
import { OrthographyDto, ProsConsDiscusserDto } from './dtos';
import { Response } from 'express';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('orthography-check')
  orthographyCheck(
    @Body() orthographyDto: OrthographyDto,
  ){

    return this.gptService.orthographyCheck(orthographyDto);

  }

  @Post('pros-cons-discusser')
  prosConsDiscusser(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto,
  ){

    return this.gptService.prosConsDicusser(prosConsDiscusserDto);

  }

  @Post('pros-cons-discusser-stream')
  async prosConsDiscusserStream(
    @Body() prosConsDiscusserDto: ProsConsDiscusserDto,
    @Res() res: Response
  ){

    const stream = await this.gptService.prosConsDicusserStream(prosConsDiscusserDto);

    res.setHeader('Content-Type', 'application/json');
    res.status(HttpStatus.OK);

    //Esto sirve para ir recibiendo el texto de respuesta segun openai lo genera.
    for await(const chunk of stream){
      const piece = chunk.choices[0].delta.content || '';
      res.write(piece);
    }

    res.end();

  }

}
