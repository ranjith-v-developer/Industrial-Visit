import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';
import { IndustrialVisitService } from 'src/industrial-visit/industrial-visit.service';
import { checkDate } from '../config/common-config';

const TRANSLATE_CODE = {
  english: 'en',
  tamil: 'ta',
  hindi: 'hi',
};

const pKey = {
  dept: 'course_and_dept',
  location: 'location',
};

@Injectable()
export class PredictService {
  constructor(private industrialVisitService: IndustrialVisitService) {}

  // Main function to run the Python script and handle the result
  async runPythonScript(inputText: string): Promise<any> {
    const pythonScriptPath = join(
      __dirname.replace('/dist/predict', ''),
      'python_scripts',
      'predict.py',
    );

    try {
      const { stdout } = await this.executePythonScript(
        pythonScriptPath,
        inputText,
      );
      const result = JSON.parse(stdout);
      if (!result) return [];

      const [key, value] = result.key.split('-');
      const langCode = TRANSLATE_CODE[result.lang] || 'en';
      return this.fetchAndTranslateIndustrialVisits(pKey[key], value, langCode);
    } catch (error) {
      console.error('Error running Python script:', error);
      throw new Error('Failed to process Python script output');
    }
  }

  // Fetch and translate Industrial Visits
  private async fetchAndTranslateIndustrialVisits(
    key: string,
    value: string,
    lang: string,
  ) {
    const ivData = await this.industrialVisitService.findAll(0, 100, {
      [key]: value,
    });

    return Promise.all(
      ivData
        .filter((d) => checkDate(d.start_date, { checkBefore: true }))
        .map(async (iv: any) => {
          delete iv.instituteData;
          iv.tran = {
            description: await this.customTranslate(iv.description, 'en', lang),
          };
          return iv;
        }),
    );
  }

  // Execute Python script with input text
  private executePythonScript(
    scriptPath: string,
    inputText: string,
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python3', [scriptPath, inputText]);

      let stdoutData = '';
      let stderrData = '';

      pythonProcess.stdout.on(
        'data',
        (data) => (stdoutData += data.toString()),
      );
      pythonProcess.stderr.on(
        'data',
        (data) => (stderrData += data.toString()),
      );

      pythonProcess.on('close', (code) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        code !== 0 || stderrData
          ? reject(
              new Error(
                `Python script failed with code ${code}: ${stderrData}`,
              ),
            )
          : resolve({ stdout: stdoutData, stderr: stderrData });
      });

      pythonProcess.on('error', reject);
    });
  }

  // Custom translation function using Google Translate API
  private async customTranslate(
    str: string,
    from = 'en',
    to: string,
  ): Promise<string> {
    try {
      const params = new URLSearchParams({
        client: 'gtx',
        sl: from,
        tl: to,
        dt: 't',
        q: str,
      });
      const response = await fetch(
        `https://translate.googleapis.com/translate_a/single?${params}`,
      );
      const data = await response.json();

      return data?.[0]?.[0]?.[0] || str;
    } catch (error) {
      console.error('Translation Error:', error);
      throw new Error('Failed to fetch translation');
    }
  }
}
