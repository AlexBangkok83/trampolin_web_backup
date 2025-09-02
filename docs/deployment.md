# Trampolin Web Application Deployment Guide

This guide provides instructions for deploying the Trampolin web application to DigitalOcean App Platform.

## Prerequisites

- A DigitalOcean account.
- A registered domain name.
- A GitHub account with access to the application repository.
- Node.js and npm installed locally.

## 1. DigitalOcean App Platform Setup

1.  **Create App**: In the DigitalOcean dashboard, navigate to **Apps** and click **Create App**.
2.  **Connect GitHub**: Select GitHub as the source and connect your repository.
3.  **Configure App**:
    - **Region**: Choose a region closest to your users.
    - **Branch**: Select the `main` branch for production deployments.
    - **Autodeploy**: Keep autodeploy enabled.
4.  **Configure Components**:
    - The `web` service should be detected automatically.
    - **Build Command**: `npm run build`
    - **Run Command**: `npm start`
    - **HTTP Port**: `3000`

## 2. Database Setup

1.  **Create Database**: In the DigitalOcean dashboard, navigate to **Databases** and create a **PostgreSQL** managed database.
2.  **Secure Connection**: Restrict inbound sources to your App Platform application only.
3.  **Get Connection String**: Copy the **Connection String** (URI format).

## 3. Environment Variables

In your App Platform settings, go to the **Settings** tab for your `web` component and add the following environment variables. Mark sensitive values as **secrets**.

- `DATABASE_URL`: The connection string from your managed PostgreSQL database.
- `NODE_ENV`: `production`
- `NEXTAUTH_URL`: The URL of your deployed application (e.g., `https://your-app-name.ondigitalocean.app`).
- `NEXTAUTH_SECRET`: A securely generated random string. You can generate one with `openssl rand -base64 32`.
- `STRIPE_SECRET_KEY`: Your Stripe secret key.
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook signing secret.

## 4. Database Migrations

To run database migrations automatically on deployment, add the following command to your App Platform component's **Commands** section, before the build command:

`npx prisma migrate deploy`

## 5. Health Checks

The application includes a health check endpoint at `/api/health`. DigitalOcean will use this to monitor the application's status. You can configure this in the component settings under **Health Check**.

- **HTTP Path**: `/api/health`

## 6. Custom Domain & SSL

1.  In the App Platform settings, go to the **Domains** tab.
2.  Click **Add Domain** and enter your custom domain.
3.  Follow the instructions to update your domain's DNS records (usually a CNAME record).
4.  DigitalOcean will automatically provision a Let's Encrypt SSL certificate once the DNS changes propagate.

## 7. Logging and Monitoring

- **Logs**: View real-time logs in the **Logs** tab of your App Platform dashboard.
- **Monitoring**: Use the **Insights** tab to monitor CPU, memory, and network usage. Configure alert policies as needed.
