const fs = require('fs');
const pushover = require('./lib/pushover');
const messages = require('./lib/messages');
const receipts = require('./lib/receipts');

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
            function parseImageUrl() {
                let hasProtocol = msg.image.match(/^(\w+:\/\/)/igm);
                if (hasProtocol) {
                    return pushover.get(msg.image, node, done);
                } else {
                    return fs.createReadStream(msg.image);
                }
            }

            let message = new messages(node, node?.keys?.userKey, node?.keys?.token, done);
            const title = node.title || msg.topic || 'Node-RED Notification'
            message.setTitle(title);
            message.setMessage(msg.payload)
            message.setAttachment(msg.image ? parseImageUrl() : null)
            message.setDevice(msg.device)
            message.setHtml(msg.html)
            message.setUrl(msg.url, msg.url_title)
            if (msg.priority) {
                message.setPriority(msg.priority, msg.retry, msg.expire)
            }
            message.setSound(msg.sound)
            message.setTimestamp(msg.timestamp)

            // delete unused properties from the message object
            for (let k in message) {
                if (!message[k]) {
                    delete message[k];
                }
            }
            message.send().then((x)=> node.send(x));
        });
    }

    function PushoverReceiptCancelNode(n) {

        RED.nodes.createNode(this, n);
        const node = this;

        node.title = n.title;
        node.keys = RED.nodes.getCredentials(n.keys);

        pushover.checkCredentials(node);

        node.on('input', function (msg, send, done) {

            let receipt = new receipts(node, node?.keys?.userKey, node?.keys?.token, done);
            receipt.setReceiptId(msg.payload);
            receipt.send().then((x)=> node.send(x));
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

            const count = parseInt(msg.count);
            const percent = Math.min(100, Math.max(0, parseInt(msg.percent)))

            let glances = {
                'token': node.keys.token,
                'user': node.keys.userKey,
                'title': node.title || msg.topic,
                'text': node.text || msg.payload,
                'subtext': node.subtext || msg.subtext,
                'count': count,
                'percent': percent,
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
    RED.nodes.registerType('ntc-node-red-pushover-receipt-cancel', PushoverReceiptCancelNode);

    RED.nodes.registerType('ntc-node-red-pushover-glances', PushoverGlancesNode);
};
