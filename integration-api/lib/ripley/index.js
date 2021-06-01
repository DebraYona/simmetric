
// const soap = require('soap');
// https://stackoverflow.com/questions/8655252/node-js-how-to-consume-soap-xml-web-service
const axios = require('axios');

const informaEstadoOTPayloadByCUD = (usuario, clave, cud, fechaEvento, estado, idOTOperador, comentario) => {
    // segments, from docs
    const envelopeStart = `<soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:com="http://com.ripley.bigticket.tracking/">`
    const envelopeEnd = `</soapenv:Envelope>`
    const headStart = `<soapenv:Header/>
    <soapenv:Body>
    <com:informaEstadoOT>`
    const headEnd = `</com:informaEstadoOT>
    </soapenv:Body>`
    // segments, from SOAPUI
    const envelopeStartSOAPUI = `<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:examples:informaEstadoOT">`
    const envelopeENDSOAPUI = `</soapenv:Envelope>`
    const headStartSOAPUI = `<soapenv:Header/><soapenv:Body>`
    const headEndSOAPUI = `</soapenv:Body>`
    // build, from docs
    const payloadByCUD = `${envelopeStart}
    ${headStart}
    <trackingEvent>
    <usuario>${usuario}</usuario>
    <clave>${clave}</clave>
    <cud>${cud}</cud>
    <fechaEvento>${fechaEvento}</fechaEvento>
    <estado>${estado}</estado>
    <idOTOperador>${idOTOperador}</idOTOperador>
    <comentario>${comentario}</comentario>
    </trackingEvent>
    ${headEnd}
    ${envelopeEnd}
    `
    // build, from SOAPUI
    const payloadByCUDSOAPUI = `${envelopeStartSOAPUI}
    ${headStartSOAPUI}
    <urn:informaEstadoOT soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
    <usuario xsi:type="xsd:string">${usuario}</usuario>
    <clave xsi:type="xsd:string">${clave}</clave>
    <cud xsi:type="xsd:string">${cud}</cud>
    <fechaEvento xsi:type="xsd:string">${fechaEvento}</fechaEvento>
    <estado xsi:type="xsd:string">${estado}</estado>
    <idOTOperador xsi:type="xsd:string">${idOTOperador}</idOTOperador>
    <comentario xsi:type="xsd:string">${comentario}</comentario>
    </urn:informaEstadoOT>
    ${headEndSOAPUI}
    ${envelopeENDSOAPUI}
    `
    return payloadByCUDSOAPUI
}

const sendToRipley = async (data)=>{
    const headers = {
        'Accept-Encoding': 'gzip,deflate',
        'Content-Type': 'text/xml;charset=UTF-8',
        SOAPAction: 'informaEstadosOT',
      };
      const url = 'http://localhost:8088/';
      const method = 'post';
      const response = await axios({
        method,
        url,
        headers,
        data,
      }).catch((error) => {
        console.log(error);
        return error
      });
      console.log(response);
    return response
}

const statusUpdateRipley = (cud, status, comment)=>{
  const nowDate = (new Date(Date.now())).toISOString();
  const user = 'user'
  const password = 'password'
  const idOTOperador = 'idOTOperador'
  const payload = informaEstadoOTPayloadByCUD(user, password, cud, nowDate, status, idOTOperador, comment)
  return sendToRipley(payload)
}
module.exports = {
  statusUpdateRipley
};

