Advanced Trading Platform

A full-stack trading application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).
Main page
![77AFA0A6-4646-4034-97F4-ABCCD92D1808](https://github.com/user-attachments/assets/decc4db6-8179-4f7f-b863-3ff2f17c2c0c)
Dashboard

![B522778F-E348-47C4-B502-5853C42E33EA](https://github.com/user-attachments/assets/eabb27cd-ce24-4697-a737-c373c7f5131e)

Trade page

![564BDD83-6142-4358-B467-3971FE162623](https://github.com/user-attachments/assets/4fcf6a9a-fdc0-4c73-95ea-6c7da2ef6ccb)
Real time market 


![05A07DDE-3216-4573-935D-C4D3CBD6BF02](https://github.com/user-attachments/assets/5437679e-6772-48b1-8658-b9aa077ff4a3)

 Features

- Real-time market data and price updates
- User authentication and authorization
- Portfolio management
- Trading functionality
- Market analysis tools
- Responsive design
- Real-time notifications

Tech Stack

- Frontend: React.js, Redux, Material-UI, WebSocket
- Backend: Node.js, Express.js
- Database: MongoDB
- Real-time: Socket.io
- Authentication: JWT
- API Integration: Alpha Vantage, Binance API

 Project Structure

```
trading-app/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express application
├── .gitignore
└── README.md
```

 Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   BINANCE_API_KEY=your_binance_api_key
   BINANCE_API_SECRET=your_binance_api_secret
   ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## License

MIT 
