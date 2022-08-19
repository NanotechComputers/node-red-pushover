const pushover = require('./pushover');
class Pushover {
    constructor(node, user, token, done) {
        this._node = node;
        this._done = done;
        this._url = 'https://api.pushover.net/1/receipts/';
        this._notification = {
            user: '',
            token: ''
        };
        this._notification.user = user;
        this._notification.token = token;
    }

    setReceiptId(payload) {
        if (!payload || typeof (payload) !== 'string') {
            throw 'Pushover receipt cancellation expects a payload of type string';
        } else {
            this._url += `${String(payload)}/cancel.json`;
        }
        return this;
    }

    send() {
        return pushover.post(this._url, this._notification, this._node, this._done);
    }
}
module.exports = Pushover;
