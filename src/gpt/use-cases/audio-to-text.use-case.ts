import * as fs from 'fs';
import OpenAI from "openai";

interface Options {
    audioFile: Express.Multer.File;
    prompt?: string;
}

export const audioToTextUseCase = async (openai: OpenAI, options: Options) => {

    const { prompt, audioFile } = options;

    const response = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: fs.createReadStream(audioFile.path),
        prompt: prompt, //mismo idioma del audio
        language: 'es',
        response_format: 'verbose_json' // Para subtitulos usar estos: 'srt' 'vtt'
    });

    return response;

}
