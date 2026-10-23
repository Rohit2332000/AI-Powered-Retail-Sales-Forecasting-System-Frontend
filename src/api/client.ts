import axios from 'axios'

// Configured from VITE_API_BASE_URL so the target backend can be swapped per
// environment (local dev, docker-compose, deployed) without a code change.
// See .env.example for the expected variable name.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
})

export default apiClient
