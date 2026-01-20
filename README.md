# Barber's Booking and Auth UI

This project is a modern single-page application (SPA) for managing barber shop bookings and user authentication, built with the Next.js framework. It provides a seamless experience for users to register, log in, and book appointments, with a focus on clean UI/UX and robust authentication flows.

---

## Table of Contents
- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

---

## Overview
This application allows users to:
- Register and verify their email address
- Log in using password, magic link, or OTP
- Book, view, and manage appointments with barbers
- Browse available barbers and services

The UI is designed for clarity and ease of use, following the wireframe provided in `wireframe.excalidraw` (see [UI/UX Wireframe](#uiux-wireframe)).

## Technologies Used
- **Next.js** – React framework for server-side rendering and routing
- **React.js** – Component-based UI library
- **Material UI** – Component library for fast, accessible design
- **Tailwind CSS** – Utility-first CSS framework for rapid styling

## Features
- **User Registration**: Sign up with email verification
- **Authentication**: Login via password, magic link, or OTP
- **Booking System**: Create, update, and manage appointments
- **Barber & Service Listings**: View available barbers and services
- **Responsive Design**: Mobile-friendly and accessible UI

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/erics-barbers-ui.git
   cd erics-barbers-ui
   ```
2. Install dependencies:
   ```sh
   npm install
   # or
   yarn install
   ```
3. (Optional) Configure environment variables as needed.

### Running the App
Start the development server:
```sh
npm run dev
# or
yarn dev
```
The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── api/                # API client, models, and services
│   ├── generated/      # OpenAPI-generated client code
│   └── repositories/   # Data access and repository logic
├── app/                # Next.js app directory (pages, components, routes)
│   ├── components/     # Shared UI components (navbar, footer, etc.)
│   ├── booking/        # Booking-related pages
│   ├── login/          # Login forms and pages
│   ├── register/       # Registration forms and pages
│   └── ...             # Other feature folders
├── public/             # Static assets (if any)
├── config.json         # App configuration
├── README.md           # Project documentation
└── ...
```

## Usage
- Register a new account and verify your email
- Log in using your preferred method
- Browse barbers and available services
- Book, update, or cancel appointments

## UI/UX Wireframe
The `wireframe.excalidraw` file at the root of this project contains the UI/UX design. Open it at [excalidraw.com](https://excalidraw.com/) to view the application's wireframe.

## Contributing
Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License
This project is licensed under the MIT License.