# Astro360 - Quick Start Guide

## 🚀 Running the Application

### Easiest Way (Recommended)

Run both backend and frontend with a single command:

```bash
./run_app.sh
```

This will open both servers in separate Terminal tabs.

### Manual Way

**Terminal 1 - Backend:**
```bash
./run_backend.sh
```

**Terminal 2 - Frontend:**
```bash
./run_frontend.sh
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## ✅ What Was Fixed

This project had two critical errors that have been resolved:

1. **Backend Module Import Error** - Fixed by setting `PYTHONPATH` in startup script
2. **Frontend Missing Dependencies** - Fixed by running `npm install` (423 packages)

## 📝 Known Warnings (Non-Critical)

The app runs successfully but shows these warnings:

- Deprecated `google.generativeai` package (still works)
- Python 3.9.6 version warnings (still works)
- Missing `ASTROLOGY_API_IO_KEY` (external API disabled)
- 2 npm moderate vulnerabilities (development dependencies)

These don't prevent the app from running.

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Make script executable
chmod +x run_backend.sh
```

### Frontend won't start
```bash
# Check if port 5173 is in use
lsof -i :5173

# Reinstall dependencies
cd astro_app/frontend
rm -rf node_modules
npm install
```

## 📚 More Information

- See [AI_SETUP.md](AI_SETUP.md) for AI provider configuration
- See [walkthrough.md](.gemini/antigravity/brain/46a70c79-0c0d-4e37-91e8-607d864dda5f/walkthrough.md) for detailed fix documentation

---

**Ready to develop!** 🎉
