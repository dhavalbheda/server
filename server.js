const app = require('./src/app');
const PORT = require('./config/keys').PORT

app.listen(PORT, () => {
    console.log(`Server Running At ${PORT} Port`);
})