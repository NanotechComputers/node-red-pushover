const helper = require("node-red-node-test-helper");
const pushover = require("../pushover.js");

helper.init(require.resolve('node-red'));

describe('pushover', function () {
    before(function (done) {
        helper.startServer(done);
    });

    afterEach(function () {
        helper.unload();
    });

    after(function (done) {
        helper.stopServer(done);
    });

    it('should load pushover-keys', function (done) {
        const flow = [{id: "n1", type: "pushover-keys", name: "pushover-keys"}];
        helper.load(pushover, flow, function () {
            const n1 = helper.getNode("n1");
            try {
                n1.should.have.property('name', 'pushover-keys');
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('should load pushover-notifications', function (done) {
        const flow = [{id: "n2", type: "pushover-notifications", name: "pushover-notifications"}];
        helper.load(pushover, flow, function () {
            const n2 = helper.getNode("n2");
            try {
                n2.should.have.property('name', 'pushover-notifications');
                done();
            } catch (err) {
                done(err);
            }
        });
    });

    it('should load pushover-glances', function (done) {
        const flow = [{id: "n3", type: "pushover-glances", name: "pushover-glances"}];
        helper.load(pushover, flow, function () {
            const n3 = helper.getNode("n3");
            try {
                n3.should.have.property('name', 'pushover-glances');
                done();
            } catch (err) {
                done(err);
            }
        });
    });

});
