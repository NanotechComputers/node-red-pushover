const pushover = require('./pushover');

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
            keys:{},
            error: (x) => ({x})
        };
        const spy = jest.spyOn(node, 'error');
        pushover.checkCredentials(node)
        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(2);
        expect(spy).toHaveBeenNthCalledWith(1, "Pushover user key is invalid")
        expect(spy).toHaveBeenNthCalledWith(2, "Pushover token is invalid")
    });
})
