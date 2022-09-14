const pushover = require('./pushover');
const axios = require("axios");
const {v4: uuidv4} = require("uuid");

jest.mock('axios');

describe('Pushover', () => {

    it('should call node.error if credentials are not set', async () => {
        const node = {
            error: (x) => ({x})
        };

        const spy = jest.spyOn(node, 'error');
        pushover.checkCredentials(node)
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith("Pushover credentials have not been set up");
    });

    it('should call node.error if credentials are not set correctly', async () => {
        const node = {
            keys: {},
            error: (x) => ({x})
        };
        const spy = jest.spyOn(node, 'error');
        pushover.checkCredentials(node)
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenNthCalledWith(1, "Pushover user key is invalid")
        expect(spy).toHaveBeenNthCalledWith(2, "Pushover token is invalid")
    });

    it('should call get successfully', async () => {
        const url = "https://github.com/NanotechComputers/node-red-pushover";
        const done = () => ({});
        const node = () => ({});
        const requestId = uuidv4();
        const axiosResponse = {
            data: {
                "status": 1,
                "request": requestId,
                "receipt": null
            }
        };
        const libResponse = {
            payload: {
                "status": 1,
                "request": requestId,
                "receipt": null
            }
        };
        axios.get.mockResolvedValue(axiosResponse);

        pushover.get(url, node, done)
            .then((x) => {
                expect(x).toMatchObject(libResponse)
            });

        expect(axios.get).toHaveBeenCalled();
        expect(axios.get).toHaveBeenCalledTimes(1);
        expect(axios.get).toHaveBeenCalledWith(url);
    });

})
