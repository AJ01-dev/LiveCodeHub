import axios from 'axios';
import { getLanguageId } from '../config/languages.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

const isRapidApi = () =>
  Boolean(
    process.env.JUDGE0_API_KEY &&
      process.env.JUDGE0_API_KEY !== 'your_rapidapi_key_here' &&
      process.env.JUDGE0_API_HOST
  );

const createJudge0Client = () => {
  const baseURL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com';
  const headers = { 'Content-Type': 'application/json' };

  if (isRapidApi()) {
    headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
    headers['X-RapidAPI-Host'] = process.env.JUDGE0_API_HOST;
  }

  return axios.create({ baseURL, headers, timeout: 30000 });
};

const pollSubmission = async (client, token, maxAttempts = 15) => {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await client.get(
      `/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,status,time,memory,message`
    );

    if (data.status.id > 2) {
      return data;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new AppError('Code execution timed out', 408);
};

const STATUS_LABELS = {
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error (SIGSEGV)',
  8: 'Runtime Error (SIGXFSZ)',
  9: 'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error',
};

const formatResult = (result) => ({
  status: STATUS_LABELS[result.status.id] || result.status.description,
  stdout: result.stdout || '',
  stderr: result.stderr || '',
  compileOutput: result.compile_output || '',
  time: result.time,
  memory: result.memory,
  message: result.message || '',
});

export const runCode = asyncHandler(async (req, res) => {
  const { sourceCode, language, stdin = '' } = req.body;

  if (!sourceCode || !language) {
    throw new AppError('Source code and language are required', 400);
  }

  const languageId = getLanguageId(language);
  const client = createJudge0Client();
  const useWait = !isRapidApi();

  try {
    const { data } = await client.post(
      `/submissions?base64_encoded=false&wait=${useWait}`,
      {
        source_code: sourceCode,
        language_id: languageId,
        stdin,
      }
    );

    const result = useWait && data.status?.id > 2 ? data : await pollSubmission(client, data.token);

    res.json({
      success: true,
      data: formatResult(result),
    });
  } catch (error) {
    if (error instanceof AppError) throw error;

    const message = error.response?.data?.message || error.message || 'Code execution failed';
    throw new AppError(`Judge0 error: ${message}`, error.response?.status || 500);
  }
});

export const getLanguages = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      languages: [
        { id: 'javascript', name: 'JavaScript', judge0Id: 63 },
        { id: 'python', name: 'Python', judge0Id: 71 },
        { id: 'java', name: 'Java', judge0Id: 62 },
        { id: 'cpp', name: 'C++', judge0Id: 54 },
      ],
    },
  });
});
