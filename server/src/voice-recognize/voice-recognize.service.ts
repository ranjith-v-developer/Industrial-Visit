import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';
import { promisify } from 'util';
import * as fs from 'fs';
import { PredictService } from 'src/predict/predict.service';

@Injectable()
export class VoiceRecognizeService {
  constructor(private predictService: PredictService) { }

  async runPythonScript(filePath: string): Promise<any> {
    const pythonScriptPath = path.join(
      __dirname.replace('/dist/voice-recognize', ''),
      'python_scripts',
      'audio.py',
    );

    try {
      const { stdout } = await this.executePythonScript(pythonScriptPath, filePath);
      const result = JSON.parse(stdout); // Assuming output is JSON
      return result
    } catch (error) {
      console.error('Error running Python script:', error);
      throw new Error('Failed to process Python script output');
    }
  }

  private executePythonScript(scriptPath: string, filePath: string): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath, filePath]);
      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on('data', (data) => (stdoutData += data.toString()));
      pythonProcess.stderr.on('data', (data) => (stderrData += data.toString()));

      pythonProcess.on('close', (code) => {
        if (code !== 0 || stderrData) {
          reject(new Error(`Python script failed with code ${code}: ${stderrData}`));
        } else {
          resolve({ stdout: stdoutData, stderr: stderrData });
        }
      });

      pythonProcess.on('error', reject);
    });
  }

  // Process the uploaded audio file and call the Python script
  async processAudioFile(filePath: string): Promise<any> {
    try {
      const result = await this.runPythonScript(filePath);
      return result;
    } catch (error) {
      console.error('Error processing audio file:', error);
      throw new Error('Error processing audio file');
    } finally {
      fs.unlink(filePath, (err) => {
        if (err) {
         console.error(err);
         return err;
        }
       });
    }
  }
}