from fastapi import FastAPI

app = FastAPI(
    title="Forex Trading Journal",
    description="A platform to record and analyse forex trades",
    version="1.0.0"
)

@app.get("/")
def home():
    return {
        "message": "Welcome to Forex Trading Journal",
        "status": "running"
    }
