# How to Run the project

This application is using the dev version of the Vonage video API SDK. Therefore, credentials generation does not follow the same process as always as you need to log into the dev environment in order to create sessionIDs and tokens. For testing purposes, I have created a token that will expire in 30 days and the rest of the env variables will be shared on Slack with you.

# Run the app

1. `npm install`
2. `node index.js`
3. Expose port 5000 or the port that you are using with ngrok
4. Open your ngrok URL and click on start session and then on start sending audio.
