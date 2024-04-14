import { Body, Controller, FileTypeValidator, Get, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { GptService } from './gpt.service';
import { AudioToTextDto, OrthographyDto, ProsConsDiscusserDto, TextToAudioDto, TranslateDto } from './dtos';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

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

  @Post('translate')
  translateText(
    @Body() translateDto: TranslateDto,
  ){

    return this.gptService.translateText(translateDto);

  }

  @Post('text-to-audio')
  async textToAudio(
    @Body() textToAudioDto: TextToAudioDto,
    @Res() res: Response
  ){

    const filePath = await this.gptService.textToAudio(textToAudioDto);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);

  }

  @Get('text-to-audio/:fileId')
  async textToAudioGetter(
    @Res() res: Response,
    @Param('fileId') fileId: string
  ){

    const filePath = await this.gptService.textToAudioGetter(fileId);

    res.setHeader('Content-Type', 'audio/mp3');
    res.status(HttpStatus.OK);
    res.sendFile(filePath);

  }

  @Post('audio-to-text')
  @UseInterceptors( //Se puede crear algo personalizado para que haga esta tarea y no se repitan las cosas muchas veces
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './generated/uploads',
        filename: (req, file, callback) => {
          const fileExtension = file.originalname.split('.').pop();
          const fileName = `${new Date().getTime()}.${fileExtension}`; //Esto mejor con un UUID en vez de fechas
          return callback(null, fileName); //Revisar que solo se pueda subir archivos de audio, porque así se suben igual al filesystem
        }
      })
    })
  )
  async audioToText(
    @UploadedFile(
      new ParseFilePipe({ //Se puede crear un pipe personalizado para esto
        validators: [
          new MaxFileSizeValidator({maxSize: 1000 * 1024 * 5, message: 'File is bigger than 5 mb'}),
          new FileTypeValidator({fileType: 'audio/*'})
        ]
      })
    ) file: Express.Multer.File,
    @Body() audioToTextDto: AudioToTextDto
  ){    
    return this.gptService.audioToText(file, audioToTextDto);
  }

}
