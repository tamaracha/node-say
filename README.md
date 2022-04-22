# node-say
Rest server for OS X's say command

## Usage

### Running the server

```shell
npm start
```

### Sending requests

```shell
# Get list of voices
curl -H "Content-Type: application/json" localhost:3000/voices
# Say text with given voice
curl -X POST -H "Content-Type: application/json" -d '{ "voice": "Alex", "text": "Hello" }' --output sample.wav localhost:3000/speak
```
