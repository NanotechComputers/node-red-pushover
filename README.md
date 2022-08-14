node-red-contrib-pushover
======================

A [Pushover](http://www.pushover.net/) API wrapper for Node-RED.

Supports rich notifications and watch glances.

![](banner.gif)
----

### Install

Run the following command in your Node-RED user directory - typically `~/.node-red`

    npm install node-red-contrib-pushover

[![npm](https://img.shields.io/npm/v/node-red-contrib-pushover.svg)](https://www.npmjs.com/package/node-red-contrib-pushover)

### Required Inputs
- `msg.payload`(required): The message of the notification, supports a [few html tags](https://pushover.net/api#html)

### Optional Inputs
- `msg.topic`: This will be used as the title of the notification if **Title** is not set
- `msg.image`: The URL of the image in notification. Local file path or http(s) url
- `msg.url`: Can add an url to your notification
- `msg.url_title`: Can set the title of the url
- `msg.priority`: -2/-1/1/2, [see explain](https://pushover.net/api#priority)
- `msg.device`: Default for all device if not provided. Separated by a comma
- `msg.sound`: Name of the notification sound, [see the list](https://pushover.net/api#sounds)
- `msg.timestamp`: An unix timestamp to specific the date time of your notification


See <a href="https://pushover.net/api" target="_new">Pushover.net</a> for more details.

## Pushover Glances

![](glances-node.png)

With Pushover's Glances API, you can push small bits of data directly to a constantly-updated screen, referred to as a widget, such as a complication on your smart watch or a widget on your phone's lock screen.

![](icons/help-pushover-glances-preview.jpg)

### Available Inputs
- `msg.payload`: This will be used as the title if **Title** is not set
- `msg.text`: The main line
- `msg.subtext`: The second line
- `msg.count`: The number
- `msg.percent`: The progress bar/circle
- `msg.device`: Device name, default for all

![](icons/help-pushover-glances-props.png)

Credit goes to [Ray](https://github.com/RayPS/node-red-contrib-pushover) for starting this project
