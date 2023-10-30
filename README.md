# How to Run the project

This application shows you how you can use the Vonage Video API along with Google Cloud APIs to build a real time translation app

# Pre-requisites

1. A Vonage Video API account. Click [Sign Up](https://www.tokbox.com/account/user/signup) to create one if you don't have one already.
2. Node.js installed
3. Experience Composer API enabled in your account. You can do so in the [account portal](https://tokbox.com/account/)
4. A Google Cloud Platform account and a project with Text-to-speech, translate and Speech-to-text APIs enabled.

# Run the app

1. `npm install`
2. `node index.js`
3. Populate a `.env` as per `.env.example`
4. Expose port 5000 or the port that you are using with ngrok
5. Open your ngrok URL and click on start session and then on start sending audio.

## Things to note.

For the sake of simplicity, and to avoid running into higher costs while testing Experience Composer API, there's a maxDuration flag set to 70 seconds for testing purposes. This means that after 70 seconds the translations will stop playing. For a production application you need to [stop the experience composer instance](https://tokbox.com/developer/rest/#delete_experience_composer).

Likewise, when testing you need to make sure that you disconnect websocket connections on the Audio connector API. You can disconnect the Audio Connector WebSocket connection using the [force disconnect REST method](https://tokbox.com/developer/guides/moderation/rest/). Use the connection ID of the Audio Connector WebSocket connection with this method. Otherwise, as a security measure, the WebSocket will be closed automatically after 6 hours.
