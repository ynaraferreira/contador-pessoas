# People Counter with ESP32 + Progressive Web App

A real-time people counting system built using **ESP32-S3**, **HC-SR04 ultrasonic sensors**, and a **TypeScript, Next JS web application** to monitor occupancy and movement patterns in an environment.

The system detects **entries and exits**, stores the data, and allows analysis of **peak movement hours** through a web dashboard.

The application was deployed on **Vercel** and can be installed as a **Progressive Web App (PWA)** on mobile devices.

## Project Overview

This project was developed to monitor the number of people inside a physical environment using low-cost hardware sensors and a lightweight web application.

The system detects movement direction to identify whether a person is **entering or leaving the space**, updates the total occupancy, and records the event with a timestamp.

The collected data allows analyzing **traffic patterns and peak occupancy periods**.

## System Architecture

Hardware Layer
- ESP32-S3 microcontroller
- Two HC-SR04 ultrasonic sensors
- Direction-based detection (entry / exit)

Processing Layer
- Sensor data captured by ESP32
- Event detection logic determines entry or exit

Application Layer
- TypeScript, Next JS web application
- Data storage and visualization

Deployment
- Frontend deployed on **Vercel**
- Installable as a **PWA on mobile devices**

## Features

- Real-time people counting
- Entry and exit detection
- Occupancy tracking
- Timestamped event logging
- Movement analytics (peak hours)
- Mobile access via PWA
- Lightweight and low-cost hardware setup

## Technologies Used

Hardware
- ESP32-S3
- HC-SR04 Ultrasonic Sensors

Software
- TypeScript, Next JS
- Web App / PWA
- Vercel (deployment)

Concepts
- IoT systems
- Sensor data processing
- Event tracking
- Movement analytics

## Data Collected

The system records:

- Entry events
- Exit events
- Timestamp of each event
- Total number of people in the environment

This data can be used to analyze:

- Peak occupancy periods
- Traffic patterns
- Space usage behavior

## Use Cases

- Smart buildings
- Retail traffic monitoring
- Classroom occupancy tracking
- Event spaces
- Office capacity monitoring

## Installation (PWA)

The application can be installed directly on a smartphone as a **Progressive Web App**.

Steps:
1. Open the deployed application
2. Select **"Add to Home Screen"**
3. The dashboard becomes available as a mobile app

## Author

Ynara Ferreira  
Data Analyst | Data Engineer

LinkedIn:  
https://linkedin.com/in/ynara-ferreira


------


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
