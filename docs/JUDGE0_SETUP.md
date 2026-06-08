# Judge0 API Integration Guide

CodeCollab uses the [Judge0 CE API](https://judge0.com/) to execute code in multiple languages.

## Quick Start (No API Key Required)

CodeCollab is pre-configured to use the **free public Judge0 CE endpoint** — no RapidAPI account needed:

```env
JUDGE0_API_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_API_HOST=
```

This works out of the box for development. For production with higher rate limits, use RapidAPI (Option B below).

## Supported Languages

| Language   | Judge0 ID | Monaco Editor |
|------------|-----------|---------------|
| JavaScript | 63        | javascript    |
| Python     | 71        | python        |
| Java       | 62        | java          |
| C++        | 54        | cpp           |

## Option B: RapidAPI (Production)

For higher rate limits in production, use RapidAPI:

### Step 1: Create a RapidAPI Account

1. Go to [https://rapidapi.com/auth/sign-up](https://rapidapi.com/auth/sign-up)
2. Create a free account

## Step 2: Subscribe to Judge0 CE

1. Visit [Judge0 CE on RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Click **Subscribe to Test**
3. Select the **Basic (Free)** plan:
   - 50 requests/day on the free tier
   - Sufficient for development and testing
4. Click **Subscribe**

## Step 3: Get Your API Key

1. After subscribing, go to the **Endpoints** tab
2. Your API key is shown in the code snippets under `X-RapidAPI-Key`
3. Alternatively, find it at [https://rapidapi.com/developer/security](https://rapidapi.com/developer/security)

## Step 4: Configure CodeCollab

Add these values to `server/.env`:

```env
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_key_here
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

Replace `your_rapidapi_key_here` with your actual RapidAPI key.

## Step 5: Test Code Execution

1. Start the server and client
2. Create or join a room
3. Write code in the editor
4. Click **Run Code**
5. View output in the Output panel

### Example Test Code

**JavaScript:**
```javascript
console.log("Hello from CodeCollab!");
```

**Python:**
```python
print("Hello from CodeCollab!")
```

**With Custom Input:**

Use the **Input** tab in the output panel. For example, Python:

```python
name = input()
print(f"Hello, {name}!")
```

Enter `World` in the Input tab, then click Run Code.

## How It Works

1. Client sends code, language, and optional stdin to `POST /api/execute/run`
2. Server submits to Judge0 with the appropriate `language_id`
3. Server polls Judge0 until execution completes (max ~15 seconds)
4. Results (stdout, stderr, compile output, status, time, memory) are returned to the client

## API Response Fields

| Field          | Description                        |
|----------------|------------------------------------|
| status         | Execution result (Accepted, Runtime Error, etc.) |
| stdout         | Standard output                    |
| stderr         | Standard error                     |
| compileOutput  | Compilation errors (if any)        |
| time           | Execution time in seconds          |
| memory         | Memory usage in KB                 |

## Status Codes

| ID | Status                    |
|----|---------------------------|
| 3  | Accepted                  |
| 4  | Wrong Answer              |
| 5  | Time Limit Exceeded       |
| 6  | Compilation Error         |
| 11 | Runtime Error (NZEC)      |

## Troubleshooting

### "Judge0 API is not configured"
- Set `JUDGE0_API_KEY` in `server/.env` with a valid RapidAPI key

### 403 Forbidden
- Verify you subscribed to Judge0 CE on RapidAPI
- Check the API key is correct

### 429 Too Many Requests
- Free tier limit: 50 requests/day
- Upgrade your RapidAPI plan or wait for the daily reset

### Code execution timed out
- Judge0 may be slow on the free tier
- Complex code may exceed the polling window — try simpler code first

### Java "Main class not found"
- Java submissions must use `public class Main` with a `main` method (default template provided)

## Self-Hosted Alternative

For unlimited executions, you can self-host Judge0:

1. Follow [Judge0 documentation](https://github.com/judge0/judge0)
2. Update `server/.env`:

```env
JUDGE0_API_URL=http://localhost:2358
JUDGE0_API_KEY=
JUDGE0_API_HOST=
```

3. Modify `server/src/controllers/executionController.js` to skip RapidAPI headers when self-hosting

## Production Tips

- Monitor RapidAPI usage in your dashboard
- Consider caching language metadata
- Set reasonable rate limits on `/api/execute/run` for production
- Use a paid RapidAPI plan for higher traffic
