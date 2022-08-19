const axios = require("axios");
module.exports = (function () {
    return (function () {

        function _handlePostFormSuccess(node, res, done) {
            const data = res?.data; // Example response: {"status":1,"request":"ddc01c7d-e908-4107-a2ab-e8c82ce7db01", "receipt": "rqhaemia2vow6hxmj3d5jgw78eriwx"}
            const status = data?.status;
            const request = data?.request;
            const receipt = data?.receipt;
            if (res.status === 200 && status === 1) {
                node.log(`Pushover notification sent successfully. Status: ${status}, Request: ${request}`);
                done();
            } else {
                done(`Unknown Pushover error: ${JSON.stringify(data)}`);
            }
            return {
                payload: {
                    status: status,
                    request: request,
                    receipt: receipt ?? null
                }
            };
        }

        function _handlePostFormError(error, done) {
            const response = error?.response;
            const data = response?.data;
            const status = data?.status;
            const request = data?.request;
            const errors = data?.errors;
            const msg = `Pushover error. Status: ${status}, Request: ${request}, Errors: ${errors?.join(', ')}`;
            done(msg);

            return {
                payload: {
                    status: status,
                    request: request,
                    errors: errors
                }
            };
        }

        function get(url, node, done) {
            // TODO: Change the way success and failure messaging works
            return axios.get(url)
                .then((res) => _handlePostFormSuccess(res, done))
                .catch((error) => _handlePostFormError(error, done))
        }

        function post(url, form, node, done) {
            return axios.post(url, form)
                .then((res) => _handlePostFormSuccess(node, res, done))
                .catch((error) => _handlePostFormError(error, done))
        }

        function postForm(url, form, node, done) {
            return axios.postForm(url, form)
                .then((res) => _handlePostFormSuccess(node, res, done))
                .catch((error) => _handlePostFormError(error, done))
        }

        function checkCredentials(node){
            if (!node.keys) {
                node.error('Pushover credentials have not been set up');
            } else {
                if (!node.keys.userKey) {
                    node.error('Pushover user key is invalid');
                }

                if (!node.keys.token) {
                    node.error('Pushover token is invalid');
                }
            }
        }

        return {
            get: get,
            post: post,
            postForm: postForm,
            checkCredentials: checkCredentials
        };
    })();
})();
