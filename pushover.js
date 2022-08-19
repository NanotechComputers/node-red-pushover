const fs = require('fs');
const pushover = require('./lib/pushover');

module.exports = function (RED) {
    'use strict';

    function PushoverKeys(n) {
        RED.nodes.createNode(this, n);
        this.userKey = n.userKey;
        this.token = n.token;
    }

    function PushoverNotificationsNode(n) {

        RED.nodes.createNode(this, n);
        const node = this;

        node.title = n.title;
        node.keys = RED.nodes.getCredentials(n.keys);

        pushover.checkCredentials(node);

        node.on('input', function (msg, send, done) {
            if (!msg.payload) {
                throw 'Pushover notifications expects a payload of type string or object';
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
                    return pushover.get(msg.image, node, done);
                } else {
                    return fs.createReadStream(msg.image);
                }
            }

            const url = 'https://api.pushover.net/1/messages.json?html=1';
            pushover.postForm(url, notification, node, done).then();
        });
    }

    function PushoverGlancesNode(n) {

        RED.nodes.createNode(this, n);
        const node = this;

        node.title = n.title;
        node.text = n.text;
        node.subtext = n.subtext;
        node.keys = RED.nodes.getCredentials(n.keys);

        pushover.checkCredentials(node);

        node.on('input', function (msg, send, done) {

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
                        node.warn(`Pushover error: length of "msg.${t}" should less than 100. "msg.${t}" has been truncated`);
                        glances[t] = glances[t].slice(0, 100);
                    }
                }
            }

            for (let k in glances) {
                if (!glances[k]) {
                    delete glances[k];
                }
            }

            const url = "https://api.pushover.net/1/glances.json";
            if (Object.keys(glances).length > 2) {
                pushover.postForm(url, glances, node, done).then();
            } else {
                node.warn('Pushover glances has nothing to send');
            }
        });
    }

    RED.nodes.registerType('ntc-node-red-pushover-keys', PushoverKeys, {
        credentials: {
            userKey: {type: 'text'},
            token: {type: 'text'}
        }
    });
    RED.nodes.registerType('ntc-node-red-pushover-notifications', PushoverNotificationsNode);
    RED.nodes.registerType('ntc-node-red-pushover-glances', PushoverGlancesNode);
};
