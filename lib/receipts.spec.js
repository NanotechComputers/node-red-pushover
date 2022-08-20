const axios = require('axios');
const receipts = require('./receipts');
const {
    v4: uuidv4,
} = require('uuid');

const crypto = require("crypto");

jest.mock('axios');

describe('Receipts', () => {

    it('should cancel an emergency notification', async () => {
        const done = () => ({})
        const node = () => ({})

        const receiptId = crypto.randomBytes(15).toString("hex");

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

        let receipt = new receipts(node, "user", "token", done);
        receipt.setReceiptId(receiptId);
        receipt.send("Title", "Message").then(data => {
            expect(data).toEqual(libResponse);
        });

        expect(axios.post).toHaveBeenCalled();
        expect(axios.post).toHaveBeenCalledWith(`https://api.pushover.net/1/receipts/${String(receiptId)}/cancel.json`, {"token": "token", "user": "user"})
    });

    it('should throw error when payload is empty or not a string', async () => {
        const done = () => ({})
        const node = () => ({})

        let receipt = new receipts(node, "user", "token", done);

        expect(() => {
            receipt.setReceiptId(null);
        }).toThrow('Pushover receipt cancellation expects a payload of type string');
    });
})
