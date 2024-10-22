import * as http from 'http'
import ModbusRTU from 'modbus-serial';
import * as fs from 'fs';
let dataToSend: { angle: number, error: number } = { "angle": 0, "error": 0 }
let server = http.createServer(onRequest);
function onRequest(request: http.IncomingMessage, response: http.ServerResponse) {
  if (request.url == undefined) {
    return;
  }
  let type = request.url?.substring(1);
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
        dataToSend.angle = recieved_ang * 100
      } else {
        dataToSend.angle = (360 + recieved_ang) * 100
      }
      dataToSend.error = parseInt(json.error);
    });
  }
  if (fs.existsSync(type)) {
    response.write(fs.readFileSync(request.url?.substring(1)));
  }

  response.end();
}

server.listen(8080, () => {
  console.log('Server is running on port 8080');
});

const client = new ModbusRTU();

// open connection to a serial port
try {
  client.connectRTUBuffered("/dev/tty.usbserial-MNS00003", {
    baudRate: 19200,
    parity: "none"
  }, write);
} catch (err) {
  console.log('No connection');
}

function write(err) {
  if(err){
    return;
  }
  client.setID(0);

  // write the values 0, 0xffff to registers starting at address 5
  // on device number 1.
  console.log("Connected")
  setInterval(async () => {
    await client.writeRegisters(0, [dataToSend.error, 0, dataToSend.angle])
  }, 400)
}
