const helper = require("node-red-node-test-helper");
const pushover = require("../pushover.js");

helper.init(require.resolve('node-red'));

describe('pushover', function () {
    beforeAll(function (done) {
        helper.startServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    afterAll (function (done) {
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
        const flow = [{id: "n2", type: "ntc-node-red-pushover-notifications", name: "ntc-node-red-pushover-notifications"}];
        helper.load(pushover, flow, function () {
            const n2 = helper.getNode("n2");
            try {
                expect(n2.name).toMatch("ntc-node-red-pushover-notifications");
                done();
            } catch (err) {
                done(err);
            }
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
