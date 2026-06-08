# MongoDB Atlas Setup Guide

This guide walks you through setting up MongoDB Atlas for CodeCollab.

## Step 1: Create a MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (M0 Sandbox cluster is free forever)

## Step 2: Create a Cluster

1. After logging in, click **Build a Database**
2. Choose **M0 FREE** (Shared) tier
3. Select a cloud provider and region closest to you
4. Name your cluster (e.g., `CodeCollabCluster`)
5. Click **Create**

## Step 3: Create a Database User

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set a username (e.g., `codecollab_user`)
5. Generate a secure password and **save it**
6. Set privileges to **Read and write to any database**
7. Click **Add User**

## Step 4: Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For development, click **Allow Access from Anywhere** (`0.0.0.0/0`)
4. For production, add only your server's IP address
5. Click **Confirm**

## Step 5: Get Connection String

1. Go to **Database** → click **Connect** on your cluster
2. Choose **Drivers**
3. Select **Node.js** and version **5.5 or later**
4. Copy the connection string. It looks like:

```
mongodb+srv://codecollab_user:<password>@codecollabcluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

5. Replace `<password>` with your actual database user password
6. Add the database name before the query string:

```
mongodb+srv://codecollab_user:YOUR_PASSWORD@codecollabcluster.xxxxx.mongodb.net/codecollab?retryWrites=true&w=majority
```

## Step 6: Configure CodeCollab

Add the connection string to `server/.env`:

```env
MONGODB_URI=mongodb+srv://codecollab_user:YOUR_PASSWORD@codecollabcluster.xxxxx.mongodb.net/codecollab?retryWrites=true&w=majority
```

## Step 7: Verify Connection

Start the server:

```bash
cd server
npm run dev
```

You should see:

```
MongoDB Connected: codecollabcluster-shard-00-00.xxxxx.mongodb.net
Server running on port 5000
```

## Database Collections

CodeCollab automatically creates these collections on first use:

| Collection | Purpose                          |
|------------|----------------------------------|
| users      | User accounts (name, email, password) |
| rooms      | Coding rooms (roomId, owner, language, code) |
| messages   | Chat messages (roomId, sender, text, timestamp) |

## Troubleshooting

### Authentication failed
- Verify username and password in the connection string
- URL-encode special characters in the password (e.g., `@` → `%40`)

### Connection timeout
- Check Network Access allows your IP
- Verify the cluster is running (not paused)

### Database not found
- MongoDB creates databases automatically on first write — no manual creation needed
- Ensure `codecollab` is in the connection string path

## Production Tips

- Use a dedicated database user with minimal required permissions
- Restrict Network Access to your deployment IPs only
- Enable MongoDB Atlas backup for production clusters
- Monitor usage via Atlas dashboard
