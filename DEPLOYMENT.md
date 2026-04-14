# FinSight Deployment Guide

## GPU Compatibility

This project supports both **NVIDIA** and **AMD** GPUs (or CPU-only mode).

### Choose Your Configuration

| File | Use Case | GPU Support |
|------|----------|-------------|
| `docker-compose.yml` | CPU only (all systems) | None |
| `docker-compose.gpu.yml` | NVIDIA GPU | NVIDIA CUDA |

---

## AMD GPU Support

For AMD GPUs (like RX 7900 XTX), you need to use **ROCm** version of Ollama.

### Option 1: Use CPU-only (Recommended for testing)

```bash
docker compose up -d
```

This works on any system without GPU or with incompatible GPU.

### Option 2: Use NVIDIA GPU

```bash
docker compose -f docker-compose.gpu.yml up -d
```

Requires NVIDIA GPU + nvidia-docker runtime.

### Option 3: AMD GPU (ROCm)

If you have AMD GPU with ROCm support, edit `docker-compose.yml`:

```yaml
ollama:
  image: ollama/ollama:rocm:latest  # Use ROCm version
  # ... rest of config
```

---

## Quick Start

### 1. Clone and configure

```bash
cp .env.example .env
# Edit .env with your Discord bot token
```

### 2. Start services (CPU mode - works everywhere)

```bash
docker compose up -d
```

### 3. Check status

```bash
docker compose ps
```

### 4. Access the app

- Web UI: http://localhost:3000
- API: http://localhost:3000/api
- Ollama: http://localhost:11434

---

## Troubleshooting

### "No GPU found" error

If Docker fails to start with GPU error:

1. **CPU mode** (no GPU needed):
   ```bash
   # Use the default docker-compose.yml (CPU only)
   docker compose up -d
   ```

2. **NVIDIA**: Ensure nvidia-docker is installed:
   ```bash
   docker run --gpus all nvidia/cuda:12.0-base-ubuntu nvidia-smi
   ```

3. **AMD**: Use `ollama/ollama:rocm:latest` image

### Slow performance without GPU

Without GPU, the LLM will run on CPU and be slower. For production:
- Use a machine with NVIDIA/AMD GPU
- Or use a smaller model (e.g., `llama3:8b` instead of `mistral-nemo`)

---

## System Requirements

### Minimum (CPU only)
- Docker + Docker Compose
- 8GB RAM
- 20GB storage

### Recommended (GPU)
- NVIDIA GPU with 8GB+ VRAM (or AMD RX 6000/7000 series)
- 16GB RAM
- 50GB storage

---

## Model Notes

The `mistral-nemo` model requires:
- ~7GB RAM (GPU) or ~12GB RAM (CPU)
- First request takes 30-90s (model loading)

For slower systems, use a smaller model:
```bash
docker exec finsight-ollama ollama pull llama3:8b
```

Then update `.env`:
```
OLLAMA_MODEL=llama3:8b
```
