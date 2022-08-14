module.exports = function (RED) {
    'use strict';
    const axios = require('axios');
    const fs = require('fs');

    function PushoverKeys(n) {
        RED.nodes.createNode(this, n);
        this.userKey = n.userKey;
        this.token = n.token;
    }

    function PushoverNotificationsNode(n) {
        function checkFetchStatus(res) {
            if (res.ok) { // res.status >= 200 && res.status < 300
                return res;
            } else {
                if (done) {
                    done(res.response.text());
                } else {
                    node.error('Pushover error: ' + res.response);
                }
            }
        }
        RED.nodes.createNode(this, n);
        this.title = n.title;
        this.keys = RED.nodes.getCredentials(n.keys);
        if (this.keys) {
            if (!this.keys.userKey) {
                this.error('No pushover user key');
            }
            if (!this.keys.token) {
                this.error('No pushover token');
            }
        } else {
            this.error('No pushover keys configuration');
        }

        const node = this;

        this.on('input', function (msg, send, done) {
            if (!msg.payload) {
                throw 'Pushover error: payload has no string';
            } else if (typeof (msg.payload) == 'object') {
                msg.payload = JSON.stringify(msg.payload);
            } else {
                msg.payload = String(msg.payload);
            }
            if (msg.priority) {
                switch (msg.priority) {
                    case -2:
                    case -1:
                    case 0:
                    case 1:
                        break;
                    case 2:
                        if (!msg.retry || !msg.expire) {
                            throw 'Pushover error: missing msg.retry or msg.expire';
                        } else {
                            if (msg.retry < 30) {
                                throw 'Pushover error: msg.retry must at least 30';
                            }
                            if (msg.expire > 10800) {
                                throw 'Pushover error: msg.expire must less than 10800';
                            }
                        }
                        break;
                    default:
                        throw 'Pushover error: priority out of range';
                }
            }

            let notification = {
                'title': node.title || msg.topic || 'Node-RED Notification',
                'token': node?.keys?.token,
                'user': node?.keys?.userKey,
                'message': msg.payload,
                'attachment': msg.image ? parseImageUrl() : null,
                'device': msg.device,
                'url': msg.url,
                'url_title': msg.url_title,
                'priority': msg.priority,
                'retry': msg.retry,
                'expire': msg.expire,
                'sound': msg.sound,
                'timestamp': msg.timestamp
            };

            for (let k in notification) {
                if (!notification[k]) {
                    delete notification[k];
                }
            }

            function parseImageUrl() {
                let hasProtocol = msg.image.match(/^(\w+:\/\/)/igm);
                if (hasProtocol) {
                    return axios.get(msg.image)
                        .then(checkFetchStatus)
                        .then(res => {
                            node.log('pushover POST succeeded:\n' + JSON.stringify(res));
                            if (done) {
                                1
                                done();
                            }
                        })
                        .catch(function (error) {
                            // handle error
                            console.log(error);
                        })
                } else {
                    return fs.createReadStream(msg.image);
                }
            }

            function push(form) {
                let pushoverAPI = 'https://api.pushover.net/1/messages.json?html=1';
                axios.postForm(pushoverAPI, form)
                    .then(checkFetchStatus)
                    .then(res => {
                        node.log('pushover POST succeeded:\n' + JSON.stringify(res));
                        if (done) {
                            done();
                        }
                    })
                    .catch(error => {
                        if (done) {
                            done(error.message);
                        } else {
                            node.error('Error parsing json: ' + error.message);
                        }
                    })
            }
            push(notification);
        });
    }

    function PushoverGlancesNode(n) {
        function checkFetchStatus(res) {
            if (res.ok) { // res.status >= 200 && res.status < 300
                return res;
            } else {
                if (done) {
                    done(res.response.text());
                } else {
                    node.error('Pushover error: ' + res.response);
                }
            }
        }
        RED.nodes.createNode(this, n);

        this.keys = RED.nodes.getCredentials(n.keys);
        this.title = n.title;
        this.text = n.text;
        this.subtext = n.subtext;

        if (this.keys) {
            if (!this.keys.userKey) {
                this.error('No pushover user key');
            }
            if (!this.keys.token) {
                this.error('No pushover token');
            }
        } else {
            this.error('No pushover keys configuration');
        }

        const node = this;

        this.on('input', function (msg, send, done) {

            msg.count = parseInt(msg.count);
            msg.percent = Math.min(100, Math.max(0, parseInt(msg.percent)));

            let glances = {
                'token': node.keys.token,
                'user': node.keys.userKey,
                'title': node.title || msg.topic,
                'text': node.text || msg.payload,
                'subtext': node.subtext || msg.subtext,
                'count': msg.count,
                'percent': msg.percent,
                'device': msg.device
            };

            for (let t in ['title', 'text', 'subtext']) {
                if (glances[t]) {
                    glances[t] = String(glances[t]);
                    if (glances[t].length > 100) {
                        node.warn(`Pushover error: length of "msg.${t}" should less than 100`);
                        glances[t] = glances[t].slice(0, 100);
                    }
                }
            }

            for (let k in glances) {
                if (!glances[k]) {
                    delete glances[k];
                }
            }

            function push(form) {
                let pushoverAPI = 'https://api.pushover.net/1/glances.json';
                axios.postForm(pushoverAPI, form)
                    .then(checkFetchStatus)
                    .then(res => {
                        node.log('pushover POST succeeded:\n' + JSON.stringify(res));
                        if (done) {
                            done();
                        }
                    })
                    .catch(error => {
                        if (done) {
                            done(error.message);
                        } else {
                            node.error('Error parsing json: ' + error.message);
                        }
                    })
            }

            if (Object.keys(glances).length > 2) {
                push(glances);
            } else {
                node.warn('Pushover glances has nothing to send');
            }
        });
    }

    RED.nodes.registerType('pushover-keys', PushoverKeys, {
        credentials: {
            userKey: {type: 'text'},
            token: {type: 'text'}
        }
    });
    RED.nodes.registerType('pushover-notifications', PushoverNotificationsNode);
    RED.nodes.registerType('pushover-glances', PushoverGlancesNode);
};
