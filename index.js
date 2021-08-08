/** 
 * @file example tocken-session auth on node.js.
 * @author Full_droper <full_droper@pm.me>
 * @version 0.0.1
*/

/**
 * @class db 
 * @description class for store of date
 */
class db {
    constructor() {
        this.db = new Map()
    }
    createUser({email, pwd}) {
        if (!email || !pwd) return {status : 400};
        const tmp = {
            token: createToken(),
            tokenTimeStamp: new Date().getTime(),
            updateKey: createToken(),
        }
        this.db.set(createToken(),{
            email,
            pwd,
            ...tmp
        })
        return {status: 200,...tmp}
    }
    getUserToken({email, pwd}){
        if (!email || !pwd) return {status : 400};
        this.db.forEach(value => {
            if (value.email === email && value.pwd === pwd) return {token, tokenLifeTime, updateKey} = value;
        });
        return {status : 404};
    }
    getUserObj({token}){
        if (!token) return {status : 400};
        const obj = this.db.get(token)
        if(!obj) return {status : 404};
        if(new Date().getTime() - obj.tokenTimeStamp > tokenLifeTimeMS) {
            return {status : 401}
        } else {
            return {status : 200 ,...obj}
        }
    }
    updateUserToken({updateKey}){
        if (!updateKey) return {status : 400};
        this.db.forEach(value , uid => {
            if (value.updateKey === updateKey){
                value.token = createToken()
                value.tokenTimeStamp = new Date().getTime()
                value.updateKey = createToken()
                this.db.set({value})
                return {token, tokenLifeTime, updateKey} = value;
            }
        });
        return {status : 404};
    }
}
const 
    {port, tokenLifeTimeMS} = require('./config.json'),
    { v4: createToken } = require('uuid'),
    WebSocket = require("ws"),
    server = new WebSocket.Server({port}),
    db = new db(),
    safeJsonParser = x => {
        return new Promise((res, rej) => {
            try {
                res(JSON.parse(x))
            } catch (e) {
                rej(e)
            };
        })
    },
    safeJsonStringify = x => {
        try {
            return (JSON.stringify(x))
        } catch (e) {
            return (JSON.stringify({status: 500}))
        };
    };

server.on("listening", () => console.log(`Server running on port ${data_port} at [${(new Date).toISOString()}]`))
server.on("connection", client => {

    console.log(`[data][${(new Date).toISOString()}]:${client._socket.remoteAddress.slice(7)} connected"`)
    client.send(`{"date":"${new Date()}"}`)

    client.on('message', async msg_raw => {
        console.log(`"[data][${(new Date).toISOString()}]:${client._socket.remoteAddress.slice(7)} connected with "${msg_raw}"`)
        if (client.readyState === WebSocket.OPEN) {
            safeJsonParser(msg_raw).then(msg => {                
                switch (msg.cmd) {
                    case "register": 
                        client.send(safeJsonStringify(db.createUser({ email: msg.email, pwd: msg.pwd })))
                    break; 
                    case "auth":
                        client.send(safeJsonStringify(db.getUserToken({ email: msg.email, pwd: msg.pwd })))  
                    break; 
                    case "update":
                        client.send(safeJsonStringify(db.updateUserToken({ updateKey: msg.updateKey })))
                    break;
                    case "login":
                        client.send(safeJsonStringify(db.getUserObj({ token: msg.token })))
                    break;
                }
            })
            .catch(e => client.send(safeJsonStringify({ status: 400, error: "command not found" })))
        }
    })
})
