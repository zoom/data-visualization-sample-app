# Zoom - Data Visualization Sample App

**NOTE** This is a WIP and ONLY for Development Testing Purposes

This is a sample application demonstrating the basics of developing an app for the Zoom Marketplace showing:

* OAuth2 Authorization Flow
* Zoom Webhook Event Handling
* OAuth2 Token Refresh Flow **TODO**
* Zoom API Data retrieval **TODO**

## Prerequisites

* Need a Zoom Account (preferably a Developer Account created from [Zoom Marketplace](https://marketplace.zoom.us)).
* [Node.js](https://nodejs.org) installed locally (test by running `node -v`)
* [MongoDB installed locally](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/) (test by running `mongo`)
* NPM installed locally, comes with Node.js installation (you can tell if you have this by running `npm -v`)
* Git installed locally (test by running this command in the terminal `git --version`)
* [ngrok](https://ngrok.com/) account and installed locally (sign up for a free account [here](https://dashboard.ngrok.com/user/signup)) and [installed locally](https://ngrok.com/download)

## How to Use This App Locally

1. Clone the repository `git clone https://github.com/zoom/data-visualization-sample-app`
2. Change CWD to the root of the new repository just cloned `cd data-visualization-sample-app`
3. Install dependencies `npm install` (if you have not already)
4. Change the name of the environment variable template `mv env.tmpl .env`
5. Edit the `.env` file and replace all property values with your values from Zoom Marketplace for your app. Set deauthorization url, event subscription urls, and any other webhook subscription url to: `{YOUR_NGROK_DOMAIN}/zoom/webhooks` all events sent to that location will be logged
6. Save/Close the `.env` file
7. Start the ngrok (see below)
8. Start your app `npm start`
9. Use the Marketplace to test: Local Test (for Development API Keys), Publishable URL (for Production API Keys)
10. Open the Zoom Client (logged in as the user who installed the app) and start a meeting, then end it. You should see webhook event data coming through

### Locally with ngrok

Before you begin, you will need to clone this repository to your local machine, and then rename `env.tmpl` => `.env`, then update the values in the `.env` file, and finally install the app depenencies `npm install`

1. Configure and [Install your ngrok Auth token](https://ngrok.com/docs#authtoken)
2. Create a new Reserved Domain: `ftdx.{{YOUR_DOMAIN_NAME}}.{{TLD}}`, and update DNS with a new CNAME per the [ngrok docs](https://ngrok.com/docs#custom-domains)
3. Update your [ngrok configuration file](https://ngrok.com/docs#config-location) with the following

```
log_level: debug
log_format: json
tunnels:
  ftdx:
    addr: 127.0.0.1:3000
    region: {{YOUR_REGION}}
    proto: http
    hostname: {{YOUR_CUSTOM_RESERVED_CNAME}}
    remote_addr: 3000
```
4. Start your tunnel `~/ngrok start ftdx`
5. Start the app `npm start`
6. Open the [Zoom Marketplace](https://marketplace.zoom.us) and view your app's **Local Test** view, and click the "Test" button.
7. Authorize the app, and you should arrive at the configuration view, and can view the command line logs to see your new access and refresh tokens
8. Start customizing the code to try new things of your own!

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on the Zoom Developer Code of Conduct, the different ways you can contribute, and the process for submitting pull requests to us.

## License

Please see the [LICENSE](LICENSE) file for complete license details.

## Built Using

* Node.js
* Github
* Docker
* NPM
* NVM
* dotenv
* Express.js
* MongoDB
* ngrok

## Support
For any questions or issues, please visit our new Community Support Forum at https://devforum.zoom.us/
