"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const modbus_serial_1 = __importDefault(require("modbus-serial"));
const fs = __importStar(require("fs"));
let dataToSend = { "angle": 0, "error": 0 };
let server = http.createServer(onRequest);
function onRequest(request, response) {
    var _a, _b;
    if (request.url == undefined) {
        return;
    }
    let type = (_a = request.url) === null || _a === void 0 ? void 0 : _a.substring(1);
    if (type.startsWith('send')) {
        var body = '';
        request.on('data', (data) => {
            body += data;
            if (body.length > 1e6)
                request.socket.destroy();
        });
        request.on('end', function () {
            let json = JSON.parse(body);
            let recieved_ang = parseInt(json.angle);
            if (recieved_ang >= 0) {
                dataToSend.angle = recieved_ang * 100;
            }
            else {
                dataToSend.angle = (360 + recieved_ang) * 100;
            }
            dataToSend.error = parseInt(json.error);
        });
    }
    if (fs.existsSync(type)) {
        response.write(fs.readFileSync((_b = request.url) === null || _b === void 0 ? void 0 : _b.substring(1)));
    }
    response.end();
}
server.listen(8080, () => {
    console.log('Server is running on port 8080');
});
const client = new modbus_serial_1.default();
// open connection to a serial port
try {
    client.connectRTUBuffered("/dev/tty.usbserial-MNS00003", {
        baudRate: 19200,
        parity: "none"
    }, write);
}
catch (err) {
    console.log('No connection');
}
function write(err) {
    if (err) {
        return;
    }
    client.setID(0);
    // write the values 0, 0xffff to registers starting at address 5
    // on device number 1.
    console.log("Connected");
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        yield client.writeRegisters(0, [dataToSend.error, 0, dataToSend.angle]);
    }), 400);
}
//# sourceMappingURL=main.js.map