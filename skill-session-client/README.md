## License

ISC

A modern React-based client application for the SkillSession tutoring platform that connects students with qualified tutors for online learning sessions.

## Overview

SkillSession is a comprehensive online tutoring platform that facilitates connections between students seeking academic help and tutors offering their expertise. This client application provides an intuitive interface for users to register, search for tutors by skills, schedule sessions, manage bookings, and maintain their profiles.

![SkillSession Platform](https://via.placeholder.com/800x400?text=SkillSession+Platform)

## Features

### For Students
- Create and manage student profiles
- Search for tutors by skills and expertise
- View tutor availability and book sessions
- Manage upcoming and past bookings
- Rate and review tutors after sessions

### For Tutors
- Create and manage tutor profiles with skills and expertise
- Set and update availability schedules
- Accept or reject booking requests
- View upcoming sessions
- Manage teaching history

### Common Features
- User authentication (signup, signin, account verification)
- Profile management with image upload
- Real-time notifications for bookings and messages
- Dashboard with upcoming sessions and actionable items
- Mobile-responsive design for access on any device

## Technologies Used

- **React.js** - Frontend library
- **React Router** - Navigation and routing
- **Ant Design** - UI component library
- **Formik & Yup** - Form handling and validation
- **AWS Cognito** - User authentication
- **AWS S3** - Profile image storage
- **AWS API Gateway** - API interaction
- **CSS/SCSS** - Styling

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn
- AWS account (for backend services)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Dishank-Kheni/pse_myproject.git
   cd skill-session-client
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   REACT_APP_API_ENDPOINT=https://your-api-gateway-url.amazonaws.com/prod
   REACT_APP_USER_POOL_ID=your-cognito-user-pool-id
   REACT_APP_USER_POOL_WEB_CLIENT_ID=your-cognito-client-id
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## Project Structure

```
skill-session-client/
├── public/               # Public assets
├── src/
│   ├── assets/           # Static assets (images, global CSS)
│   ├── components/       # Reusable components
│   │   ├── common/       # Common utility components
│   │   ├── icons/        # Custom icon components
│   │   └── layout/       # Layout components (Header, Footer)
│   ├── config/           # Configuration files
│   ├── context/          # React context providers
│   ├── features/         # Feature-based modules
│   │   ├── auth/         # Authentication feature
│   │   ├── bookings/     # Booking management
│   │   ├── dashboard/    # Dashboard views
│   │   ├── home/         # Home page
│   │   ├── profile/      # Profile management
│   │   ├── students/     # Student-specific features
│   │   └── tutors/       # Tutor-specific features
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service connectors
│   ├── App.js            # Main application component
│   └── index.js          # Application entry point
```

## Available Scripts

In the project directory, you can run:

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run test` - Runs the test suite
- `npm run lint` - Checks code for linting errors
- `npm run format` - Formats code according to project style

## Deployment

This application can be deployed to AWS Amplify, Netlify, Vercel, or any static hosting service:

1. Build the production version:
   ```sh
   npm run build
   ```

2. Deploy the contents of the `build` directory to your hosting provider.

### AWS Amplify Deployment

```sh
amplify init
amplify add hosting
amplify publish
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Acknowledgements

- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [AWS Services](https://aws.amazon.com/)
- [React Router](https://reactrouter.com/)