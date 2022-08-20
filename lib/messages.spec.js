const axios = require('axios');
const messages = require('./messages');
const {
    v4: uuidv4,
} = require('uuid');

jest.mock('axios');

describe('Messages', () => {
    const done = () => ({})
    const node = () => ({})

    it('should send a simple notification', async () => {

        const requestId = uuidv4();
        const axiosResponse = {
            data: {
                "status": 1,
                "request": requestId
            }
        };

        const libResponse = {
            payload: {
                "status": 1,
                "request": requestId,
                "receipt": null
            }
        };

        axios.post.mockResolvedValue(axiosResponse);

        const message = new messages(node, "user", "token", done);
        message.send("Title", "Message").then(data => expect(data).toEqual(libResponse));

        expect(axios.post).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalledWith(`https://api.pushover.net/1/messages.json`, {
            "expire": 0,
            "message": "Message",
            "priority": 0,
            "retry": 0,
            "sound": "pushover",
            "title": "Title",
            "token": "token",
            "user": "user"
        })
    });

    it('should send a complex notification', async () => {

        const requestId = uuidv4();
        const axiosResponse = {
            data: {
                "status": 1,
                "request": requestId
            }
        };

        const libResponse = {
            payload: {
                "status": 1,
                "request": requestId,
                "receipt": null
            }
        };

        axios.post.mockResolvedValue(axiosResponse);

        const message = new messages(node, "user", "token", done);
        message.setTitle("Title");
        message.setMessage("Message")
        message.setHtml()
        message.setUrl("https://github.com/NanotechComputers/node-red-pushover", "Git Repo")
        message.setPriority(2)
        message.setSound("alien")
        message.setTimestamp(1331249662)
        message.send().then(data => expect(data).toEqual(libResponse));

        expect(axios.post).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalledWith(`https://api.pushover.net/1/messages.json`, {
            "expire": 10800,
            "html": 1,
            "message": "Message",
            "priority": 2,
            "retry": 3600,
            "sound": "alien",
            "timestamp": 1331249662,
            "title": "Title",
            "token": "token",
            "url": "https://github.com/NanotechComputers/node-red-pushover",
            "url_title": "Git Repo",
            "user": "user",
        })
    });

    it('should throw error if setMessage payload is empty', async () => {
        const message = new messages(node, "user", "token", done);
        expect(() => {
            message.setMessage(null);
        }).toThrow('Pushover notification expects a payload of type string or object');
    });
})
