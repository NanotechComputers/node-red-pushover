const pushover = require('./pushover');
class Pushover {
    constructor(node, user, token, done) {
        this._node = node;
        this._done = done;
        this._url = 'https://api.pushover.net/1/messages.json';
        this._notification = {
            user: '',
            token: '',
            title: '',
            message: '',
            sound: 'pushover',
            priority: 0,
            expire: 0,
            retry: 0
        };
        this._notification.user = user;
        this._notification.token = token;
    }

    setDevice(device) {
        this._notification.device = device;
        return this;
    }

    setHtml() {
        this._notification.html = 1;
        return this;
    }

    setTitle(title) {
        this._notification.title = title;
        return this;
    }

    setMessage(payload) {
        if (!payload) {
            throw 'Pushover notification expects a payload of type string or object';
        } else if (typeof (payload) == 'object') {
            this._notification.message = JSON.stringify(payload);
        } else {
            this._notification.message = String(payload);
        }
        return this;
    }

    setSound(sound) {
        this._notification.sound = sound;
        return this;
    }

    setAttachment(name, filePath) {
        this._notification.file = {
            name,
            filePath
        };
        return this;
    }

    setExpire(expire){
        if (expire > 10800) {
            return 10800
        }
        return expire;
    }

    setRetry(retry){
        if (retry < 30) {
            return 30
        }
        return retry;
    }

    setPriority(priority, expire, retry) {
        if (priority < -2 || priority > 2) {
            this._node.error('Pushover notification priority has to be from -2 to 2');
            return this;
        }
        this._notification.priority = priority;
        if (priority === 2) {
            this._notification.expire = typeof expire === 'number' ? this.setExpire(expire) : 10800;
            this._notification.retry = typeof retry === 'number' ? this.setRetry(retry) : 3600;
        }
        return this;
    }

    setUrl(url, title) {
        this._notification.url = url;
        if (title) {
            this._notification.url_title = title;
        }
        return this;
    }

    setTimestamp(timestamp) {
        this._notification.timestamp = timestamp;
        return this;
    }

    send(title, message) {
        if (title) {
            this._notification.title = title;
        }
        if (message) {
            this._notification.message = message;
        }
        return pushover.post(this._url, this._notification, this._node, this._done);
    }
}
module.exports = Pushover;
