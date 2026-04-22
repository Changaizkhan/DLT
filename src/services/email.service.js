const sgMail = require("@sendgrid/mail");
const { shipmentCreatedTemplate } = require("../email-templates/shipmentCreated.template");
const { statusUpdatedTemplate } = require("../email-templates/statusUpdated.template");

const sendGridApiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.SENDGRID_FROM_EMAIL;

if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

async function sendEmailToReceiver(receiverEmail, template) {
  if (!sendGridApiKey || !fromEmail) return false;
  await sgMail.send({
    to: receiverEmail,
    from: fromEmail,
    subject: template.subject,
    text: template.text,
    html: template.html,
  });
  return true;
}

async function sendShipmentCreatedEmail({ receiverEmail, receiverName, trackingId, status, timestamp }) {
  const template = shipmentCreatedTemplate({ receiverName, trackingId, status, timestamp });
  return sendEmailToReceiver(receiverEmail, template);
}

async function sendStatusUpdatedEmail({ receiverEmail, receiverName, trackingId, status, timestamp }) {
  const template = statusUpdatedTemplate({ receiverName, trackingId, status, timestamp });
  return sendEmailToReceiver(receiverEmail, template);
}

module.exports = {
  sendShipmentCreatedEmail,
  sendStatusUpdatedEmail,
};
