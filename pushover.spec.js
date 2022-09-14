const helper = require("node-red-node-test-helper");
const pushover = require("./pushover.js");
const {v4: uuidv4} = require("uuid");
const axios = require("axios");

helper.init(require.resolve('node-red'));

jest.mock('axios');

describe('pushover', function () {
    beforeAll(function (done) {
        helper.startServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    afterAll(function (done) {
        helper.stopServer(done);
    });

    it('should load ntc-node-red-pushover-keys', function (done) {
        const flow = [{id: "n1", type: "ntc-node-red-pushover-keys", name: "ntc-node-red-pushover-keys"}];
        helper.load(pushover, flow, function () {
            const n1 = helper.getNode("n1");
            try {
                expect(n1.name).toMatch("ntc-node-red-pushover-keys");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('should load ntc-node-red-pushover-notifications', function (done) {
        const flow = [{
            id: "notification",
            type: "ntc-node-red-pushover-notifications",
            name: "ntc-node-red-pushover-notifications"
        }];
        helper.load(pushover, flow, function () {
            const notification = helper.getNode("notification");

            notification.on("input", (msg) => {
                try {
                    expect(msg.payload).toMatch("Test Message")
                    done();
                } catch (e) {
                    done(e);
                }
            });

            notification.receive({payload: "Test Message"});

        });
    });

    it('should send a simple notification', function (done) {

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

        const credentials = {
            nc: {
                userKey: "userKey",
                token: "token"
            }
        }

        const flow = [
            {
                id: "n1", type: "ntc-node-red-pushover-notifications", name: "notification", wires: [["n2"]], keys: "nc"
            },
            {
                'id': 'nc',
                'type': 'ntc-node-red-pushover-keys',
                'displayName': 'Config'
            },
            {id: "n2", type: "helper"}
        ];

        helper.load(pushover, flow, credentials, function () {
            const n2 = helper.getNode("n2");
            const n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    expect(msg).toMatchObject(libResponse);
                    done();
                } catch (err) {
                    done(err);
                }
            });

            n1.receive({
                payload: "This is a test message"
            });
        });
    });

    it('should load ntc-node-red-pushover-glances', function (done) {
        const flow = [{id: "n3", type: "ntc-node-red-pushover-glances", name: "ntc-node-red-pushover-glances"}];
        helper.load(pushover, flow, function () {
            const n3 = helper.getNode("n3");
            try {
                expect(n3.name).toMatch("ntc-node-red-pushover-glances");
                done();
            } catch (err) {
                done(err);
            }
        });
    });

});
