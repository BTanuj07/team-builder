# Mobile App Setup Guide

## 🔧 Fix API Connection

The app needs to connect to your backend. Update the IP address:

### Step 1: Find Your Computer's IP Address

**Windows:**
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.0.104)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```

### Step 2: Update API URL

Edit `services/api.ts` line 7:

```typescript
// Change this line:
return 'http://10.0.2.2:5000/api'; // Android emulator

// To your computer's IP:
return 'http://YOUR_IP_HERE:5000/api'; // e.g., http://192.168.0.104:5000/api
```

### Step 3: Reload App

In Expo Go:
- Shake your phone
- Tap "Reload"

Or in terminal:
- Press `r`

---

## 🚀 Start Backend

```powershell
cd backend
npm install
npm run dev
```

Should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

---

## 🧪 Test Connection

Once backend is running and IP is updated:

1. Reload app in Expo Go
2. Should see login screen
3. Try logging in:
   - Email: `arjun@example.com`
   - Password: `password123`

---

## 🐛 Troubleshooting

### "Network Error" or "Connection Refused"

1. Check backend is running: `http://localhost:5000/health`
2. Check firewall allows port 5000
3. Make sure phone and computer are on same WiFi
4. Update IP address in `services/api.ts`

### "Cannot connect to Metro"

1. Press `r` in terminal to reload
2. Or shake phone → Reload

### Backend not starting

1. Make sure MongoDB is running
2. Check `.env` file exists in backend folder
3. Run `npm install` in backend folder

---

## ✅ When Everything Works

You should see:
1. Login screen loads
2. Can login with demo credentials
3. See 4 tabs: Projects, AI Assistant, Teams, Profile
4. AI Assistant can build teams

---

## 📱 Demo Flow

1. Login with `arjun@example.com` / `password123`
2. Go to "AI Assistant" tab
3. Type: "Build my team for a fintech hack"
4. See AI recommendations
5. Approve and send invitations

---

**The app is now ready to demo!** 🎉
