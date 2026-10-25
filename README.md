# AI-Powered Retail Sales Forecasting System — Frontend

A modern React + Vite frontend for an AI-powered retail sales forecasting and analytics platform. The application connects with a FastAPI backend and Databricks ML pipeline to deliver sales forecasts, business KPIs, data pipeline controls, and AI-powered conversational analytics.

## Problem Statement

Retail businesses generate large volumes of sales data, but converting historical data into accurate forecasts and actionable insights can be challenging. Traditional reporting often requires manual analysis, disconnected tools, and technical expertise to understand sales trends, monitor data processing, and plan future demand.

Business users also need a simple way to explore forecasting results and ask questions about retail performance without writing complex queries.

## Solution

This frontend provides a centralized dashboard that connects retail analytics with machine learning and generative AI.

- **30-Day Sales Forecasting:** Explore predicted sales for the next 30 days.
- **Business KPI Dashboard:** View important sales and performance metrics.
- **AI-Powered Analytics Chat:** Ask natural-language questions about retail sales.
- **Dataset Upload:** Upload supported CSV files to initiate data processing.
- **Pipeline Management:** Trigger Databricks workflows and monitor execution status.
- **Forecast Exploration:** Use available filters and historical data options.
- **Integrated Analytics:** Access forecasts, KPIs, and explanations through a unified interface.

## Architecture

The platform consists of three main services:

1. **Frontend:** React + Vite for the dashboard and user interface.
2. **Backend:** FastAPI REST APIs for forecasts, KPIs, AI chat, file uploads, and pipeline controls.
3. **ML Pipeline:** Databricks for data transformation, model training, evaluation, and forecasting.

Supporting technologies:

- **MLflow:** Experiment tracking, model comparison, selection, and versioning.
- **LangSmith:** Tracing and observability for instrumented LLM/application workflows.
- **Docker:** Containerization of the frontend and backend.
- **AWS EC2:** Separate instances for frontend and backend deployment.
- **GitHub Actions:** CI/CD automation for building and deploying application changes.

### Request Flow

1. Users interact with the React dashboard.
2. The frontend sends HTTP requests to the FastAPI backend.
3. The backend retrieves data or triggers the relevant Databricks workflow.
4. Databricks processes data and supports model training and forecasting.
5. MLflow tracks experiments and supports model selection based on configured evaluation criteria.
6. The backend returns forecasts, KPIs, pipeline status, or AI-generated responses.
7. The frontend displays the results to users.

## Technology Stack

- React
- Vite
- JavaScript
- REST APIs and JSON
- FastAPI
- Databricks
- MLflow
- LangSmith
- Docker
- AWS EC2
- GitHub Actions CI/CD

## Repositories

- **Frontend:** https://github.com/Rohit2332000/AI-Powered-Retail-Sales-Forecasting-System-Frontend
- **Backend:** https://github.com/Rohit2332000/AI-Powered-Retail-Sales-Forecasting-System

## Getting Started

### Prerequisites

- Node.js compatible with the project's `package.json`
- npm
- A running FastAPI backend for API-powered functionality

### 1. Clone the Repository

```bash
git clone https://github.com/Rohit2332000/AI-Powered-Retail-Sales-Forecasting-System-Frontend.git
cd AI-Powered-Retail-Sales-Forecasting-System-Frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

Set this variable to the URL of your FastAPI backend. For production, use the deployed backend URL or domain.

Ensure the frontend code reads the same variable:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

**Security:** Never store API keys, private tokens, or other secrets in `VITE_` variables. Vite exposes these values in client-side assets.

### 4. Run the Development Server

```bash
npm run dev
```

Open the local URL printed by Vite, commonly `http://localhost:5173`.

### 5. Build for Production

```bash
npm run build
```

The production build is generated in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Backend API Integration

The frontend integrates with FastAPI endpoints for:

| Endpoint | Purpose |
|---|---|
| `GET /kpis` | Retrieve dashboard KPIs |
| `GET /forecast` | Retrieve sales forecasts and supported filters |
| `POST /chat` | Submit natural-language analytics questions |
| `POST /pipeline/upload` | Upload supported datasets |
| `POST /pipeline/trigger` | Trigger the Databricks pipeline |
| `POST /pipeline/upload-and-trigger` | Upload data and trigger processing |
| `GET /pipeline/status/{run_id}` | Monitor pipeline execution |
| `GET /forecast/explain` | Request forecast explanations |

Refer to the backend's `/docs` endpoint for the current request schemas and response formats.

## Docker Deployment

If the repository contains a Dockerfile configured for an Nginx-based production build, build the image with:

```bash
docker build -t sales-ai-frontend .
```

Run the container:

```bash
docker run -d \
  --name sales-ai-frontend \
  --restart unless-stopped \
  -p 3000:80 \
  sales-ai-frontend
```

Adjust the port mapping if your Dockerfile uses a different internal port.

## AWS EC2 Deployment

The frontend and backend are deployed on separate AWS EC2 instances.

- **Frontend EC2:** Serves the production React application.
- **Backend EC2:** Runs the FastAPI service, typically on port `8000`.

Deployment checklist:

1. Build the production frontend assets or Docker image.
2. Configure `VITE_API_BASE_URL` to point to the backend.
3. Deploy the frontend container to its EC2 instance.
4. Configure security groups to allow the required traffic.
5. Configure backend CORS to allow the frontend's exact origin.
6. Verify API requests through browser Developer Tools.

For production, prefer HTTPS and a stable domain name instead of relying on a public IP that may change.

## GitHub Actions CI/CD

The CI/CD workflow can automate:

1. Detecting changes pushed to the frontend repository.
2. Running configured build and validation steps.
3. Building production assets or a Docker image.
4. Deploying the updated frontend to AWS EC2.

Configure repository secrets according to the actual workflow YAML. Never commit `.env` files, SSH private keys, or access tokens.

# Live Link : http://34.229.58.71:3000

## Troubleshooting

### Dashboard data is not loading

- Confirm that the backend is running.
- Verify `VITE_API_BASE_URL`.
- Check the browser's Network and Console tabs.
- Confirm that backend CORS allows the frontend origin.

### API requests fail after deployment

- Verify that the backend URL is accessible from the browser.
- Check EC2 security group rules and backend logs.
- Do not use `localhost` as the production backend URL.

### Environment variable changes are not reflected

Vite typically embeds `VITE_` variables at build time. Rebuild and redeploy the frontend after changing the production API URL.

### Docker container troubleshooting

```bash
docker ps -a
docker logs --tail 200 sales-ai-frontend
```

## Security Best Practices

- Never expose private credentials in frontend code.
- Use HTTPS for public production traffic.
- Restrict inbound network access to required ports.
- Configure CORS for trusted frontend origins.
- Validate uploaded files and handle API errors safely.

## Author

**Rohit Kumar Yadav**

- GitHub: https://github.com/Rohit2332000
- LinkedIn: https://www.linkedin.com/in/rohit-kumar-yadav-42223a303/
- Portfolio: https://rohit2332000.github.io/rohityadav.github.io/

## License

This project is licensed under the [MIT License](https://opensource.org/license/mit/).

Copyright (c) 2026 Rohit Kumar Yadav

You are free to use, copy, modify, merge, publish, distribute, sublicense, and sell copies of this software, subject to the terms and conditions of the MIT License.