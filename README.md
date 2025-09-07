# Drape - Visualize Your Voyage

Drape is an AI-powered web application that reimagines your attire for any event or destination. Simply upload a photo, describe the scene, and let AI generate a new, photorealistic image of you in a stylish, event-appropriate outfit.

![Drape Screenshot](https://i.imgur.com/EXAMPLE.png) <!-- Placeholder: Replace with an actual screenshot -->

## How It Works

1.  **Upload a Photo:** Drag and drop a photo of yourself or browse to upload one.
2.  **Describe the Scene:** Enter a destination, event, and theme (e.g., "Paris," "Museum Visit," "Artistic, Chic").
3.  **Generate:** The AI generates a new image of you in a perfectly styled outfit and background.
4.  **Swap Styles:** Browse through multiple AI-generated style options for the same scene.
5.  **Download:** Save your favorite looks.

## Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** Custom components styled with pure CSS.
-   **Image Conversion:** [heic2any](https://github.com/alexcorvi/heic2any) for client-side HEIC to JPEG conversion.

This frontend application is powered by a Go backend service that utilizes the Google Gemini AI model.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   The [Go backend service](docs/backend/README.md) must be running.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd drape-frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Copy the example environment file:
    ```bash
    cp .env.local.example .env.local
    ```
    Open the new `.env.local` file and add the URL of your running backend service. For example:
    ```
    NEXT_PUBLIC_API_URL=http://172.28.5.89:8081/api/v1
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Backend Setup

This is the frontend application and requires the backend service to be running to function. For instructions on how to set up and run the backend, please see the backend documentation at [docs/backend/README.md](docs/backend/README.md).
