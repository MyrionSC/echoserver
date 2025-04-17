require("express-async-errors")
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const {getParametrizedParamList} = require("./helper")

const app = express()

// TODO: dockerize
// TODO: colored logs

// to call from localhost, need to set cors for exact port like below. * is not enough.
app.use(cors({origin: ["*", "http://localhost:3000"]}))
app.use(morgan('dev'))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
const multer = require('multer')
const upload = multer()

app.use(upload.any())

app.all('*', async function (req, res) {
    console.log(`\n${(new Date().toISOString())} === ${req.method} ${req.url}`)

    const parametrizedParamList = getParametrizedParamList(req)
    let resObj = {
        "url": req.url,
        "query": req.query,
        "headers": req.headers,
        "method": req.method,
        "hostname": req.hostname,
        "params": req.params[0],
        "parametrizedParams": "/" + parametrizedParamList.join("/"),
        "body": req.body
    }
    if (req.files){
        resObj.files = req.files.map(file => {
            if (file.buffer && file.buffer.length > 1000) {
                console.log(`file ${file.originalname} is larger than 1000 bytes, not logging buffer`)
                const fileWithoutBuffer = {...file};
                fileWithoutBuffer.buffer = null;
                return fileWithoutBuffer;
            }
            return file;
        });


    }
    console.dir(resObj, {depth: null})

    if (req.url.includes(".well-known/openid-configuration")) {
        console.log("url includes '.well-known/openid-configuration' so returning something that looks like valid config")
        const authBaseUrl = "https://marand.dk" + req.url.slice(0, -(".well-known/openid-configuration".length + 1))
        resObj = {
            "token_endpoint": authBaseUrl + "/oauth2/v2.0/token",
            "token_endpoint_auth_methods_supported": [
                "client_secret_post",
                "private_key_jwt",
                "client_secret_basic"
            ],
            "jwks_uri": authBaseUrl + "/discovery/v2.0/keys",
            "response_modes_supported": [
                "query",
                "fragment",
                "form_post"
            ],
            "subject_types_supported": [
                "pairwise"
            ],
            "id_token_signing_alg_values_supported": [
                "RS256"
            ],
            "response_types_supported": [
                "code",
                "id_token",
                "code id_token",
                "id_token token"
            ],
            "scopes_supported": [
                "openid",
                "profile",
                "email",
                "offline_access"
            ],
            "issuer": authBaseUrl + "/v2.0",
            "request_uri_parameter_supported": false,
            "userinfo_endpoint": authBaseUrl + "/oidc/userinfo",
            "authorization_endpoint": authBaseUrl + "/oauth2/v2.0/authorize",
            "device_authorization_endpoint": authBaseUrl + "/oauth2/v2.0/devicecode",
            "http_logout_supported": true,
            "frontchannel_logout_supported": true,
            "end_session_endpoint": authBaseUrl + "/oauth2/v2.0/logout",
            "claims_supported": ["sub", "iss", "cloud_instance_name", "cloud_instance_host_name", "cloud_graph_host_name", "msgraph_host", "aud", "exp", "iat", "auth_time", "acr", "nonce", "preferred_username", "name", "tid", "ver", "at_hash", "c_hash", "email"],
            "kerberos_endpoint": authBaseUrl + "/kerberos",
            "tenant_region_scope": "EU",
            "cloud_instance_name": "marand.dk/echo",
            "cloud_graph_host_name": "marand.dk/echo",
            "msgraph_host": "marand.dk/echo",
            "rbac_url": "https://marand.dk/echo"
        }
        console.dir(resObj, {depth: null})
    }

    res.send(resObj)
})


// === Error handling (must be after routes)
app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).send(err)
})

//start app
const port = 8077
app.listen(port, () =>
    console.log(`App is listening on port ${port}`)
)
